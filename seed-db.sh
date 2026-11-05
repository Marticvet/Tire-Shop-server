#!/usr/bin/env bash
set -Eeuo pipefail

DUMP=/app/db/tires_shop_idea2.sql
[[ -s "$DUMP" ]] || { echo "Missing or empty SQL dump: $DUMP" >&2; exit 1; }

mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql

# Ubuntu normally initializes this directory while installing mysql-server.
if [[ ! -d /var/lib/mysql/mysql ]]; then
  echo 'Initializing MySQL during Docker build...'
  mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql \
    --innodb-buffer-pool-size=64M --log-error=/tmp/mysql-build.log
fi

touch /tmp/mysql-build.log
chown mysql:mysql /tmp/mysql-build.log

mysql_socket=/run/mysqld/mysqld.sock
mysql_cmd=(mysql --protocol=socket --socket="$mysql_socket" -u root)

# Only a local Unix socket is enabled during the image build.
mysqld \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --skip-networking \
  --socket="$mysql_socket" \
  --pid-file=/run/mysqld/build.pid \
  --log-error=/tmp/mysql-build.log \
  --innodb-buffer-pool-size=64M \
  --performance-schema=OFF \
  --mysqlx=OFF &
mysql_pid=$!

cleanup() {
  kill "$mysql_pid" 2>/dev/null || true
  wait "$mysql_pid" 2>/dev/null || true
}
trap cleanup EXIT

echo 'Waiting for build-time MySQL...'
ready=false
for _ in $(seq 1 120); do
  if "${mysql_cmd[@]}" -e 'SELECT 1' >/dev/null 2>&1; then
    ready=true
    break
  fi
  if ! kill -0 "$mysql_pid" 2>/dev/null; then break; fi
  sleep 1
done

if [[ "$ready" != true ]]; then
  echo 'Build-time MySQL failed:' >&2
  tail -n 100 /tmp/mysql-build.log >&2 || true
  exit 1
fi

echo 'Creating and importing tires_shop_idea2 during image build...'
"${mysql_cmd[@]}" -e 'CREATE DATABASE IF NOT EXISTS `tires_shop_idea2`'
"${mysql_cmd[@]}" tires_shop_idea2 < "$DUMP"
"${mysql_cmd[@]}" -e 'SHOW TABLES' tires_shop_idea2

echo 'Shutting down build-time MySQL cleanly...'
mysqladmin --protocol=socket --socket="$mysql_socket" -u root shutdown
wait "$mysql_pid" || true
trap - EXIT
rm -f /run/mysqld/*.pid /run/mysqld/*.sock

echo 'Demo MySQL database is included in this Docker image.'
