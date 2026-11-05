#!/usr/bin/env bash
set -Eeuo pipefail

: "${DB_PASSWORD:?Set DB_PASSWORD in Render's Environment tab}"
: "${JWT_SECRET:?Set JWT_SECRET in Render's Environment tab}"

export PORT="${PORT:-3030}"
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME="${DB_NAME:-tires_shop_idea2}"
export DB_USER="${DB_USER:-tire_app}"

# Restrict SQL-interpolated identifiers and password to safe values.
[[ "$DB_NAME" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'Invalid DB_NAME' >&2; exit 1; }
[[ "$DB_USER" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'Invalid DB_USER' >&2; exit 1; }
[[ "$DB_PASSWORD" =~ ^[A-Za-z0-9_-]{16,}$ ]] || {
  echo 'DB_PASSWORD must have at least 16 letters, digits, _ or -' >&2
  exit 1
}

[[ -d /var/lib/mysql/mysql ]] || {
  echo 'Pre-seeded MySQL data missing from image. Check Docker build logs.' >&2
  exit 1
}

mkdir -p /run/mysqld
chown mysql:mysql /run/mysqld
touch /tmp/mysql-runtime.log
chown mysql:mysql /tmp/mysql-runtime.log

mysql_socket=/run/mysqld/mysqld.sock
mysql_cmd=(mysql --protocol=socket --socket="$mysql_socket" -u root)

# Start the pre-initialized database; no runtime initialization or SQL import.
echo 'Starting pre-seeded MySQL...'
mysqld \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --bind-address=127.0.0.1 \
  --port=3306 \
  --socket="$mysql_socket" \
  --pid-file=/run/mysqld/mysqld.pid \
  --log-error=/tmp/mysql-runtime.log \
  --innodb-buffer-pool-size=32M \
  --innodb-log-buffer-size=4M \
  --performance-schema=OFF \
  --max-connections=10 \
  --table-open-cache=128 \
  --skip-log-bin \
  --mysqlx=OFF &
mysql_pid=$!
node_pid=''

cleanup() {
  if [[ -n "$node_pid" ]]; then kill "$node_pid" 2>/dev/null || true; fi
  kill "$mysql_pid" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

echo 'Waiting for MySQL socket...'
ready=false
for i in $(seq 1 120); do
  if "${mysql_cmd[@]}" -e 'SELECT 1' >/dev/null 2>&1; then
    ready=true
    break
  fi
  if (( i % 10 == 0 )); then
    echo "MySQL still starting (attempt $i/120)..."
    tail -n 5 /tmp/mysql-runtime.log || true
  fi
  if ! kill -0 "$mysql_pid" 2>/dev/null; then break; fi
  sleep 1
done

if [[ "$ready" != true ]]; then
  echo 'ERROR: MySQL did not become ready.' >&2
  echo '=== MYSQL ERROR LOG ===' >&2
  tail -n 100 /tmp/mysql-runtime.log >&2 || true
  echo '=== MEMORY EVENTS ===' >&2
  cat /sys/fs/cgroup/memory.events >&2 2>/dev/null || true
  if ! kill -0 "$mysql_pid" 2>/dev/null; then
    set +e
    wait "$mysql_pid"
    exit_code=$?
    set -e
    echo "MySQL process exit code: $exit_code" >&2
  fi
  exit 1
fi

echo 'MySQL is ready. Creating application user...'
"${mysql_cmd[@]}" <<SQL
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
SQL

echo 'Starting Express on port' "$PORT"
node /app/index.js &
node_pid=$!

set +e
wait -n "$mysql_pid" "$node_pid"
exit_code=$?
set -e
echo "MySQL or Express stopped (exit code $exit_code)." >&2
exit "$exit_code"
