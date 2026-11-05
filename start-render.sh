#!/usr/bin/env bash
set -Eeuo pipefail

: "${DB_PASSWORD:?Set DB_PASSWORD in your environment}"
: "${JWT_SECRET:?Set JWT_SECRET in your environment}"

export PORT="${PORT:-3030}"
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME="${DB_NAME:-tires_shop_idea2}"
export DB_USER="${DB_USER:-tire_app}"

# These values are interpolated into the SQL below.
[[ "$DB_NAME" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'Invalid DB_NAME'; exit 1; }
[[ "$DB_USER" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'Invalid DB_USER'; exit 1; }
[[ "$DB_PASSWORD" =~ ^[A-Za-z0-9_-]{16,}$ ]] || {
  echo 'DB_PASSWORD must be 16+ characters, using letters, numbers, _ or -'
  exit 1
}

SQL_DUMP=/app/db/tires_shop_idea2.sql
[[ -s "$SQL_DUMP" ]] || { echo "Missing or empty SQL dump: $SQL_DUMP"; exit 1; }

mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql
: > /tmp/mysql-runtime.log
: > /tmp/mysql-stdout.log
chown mysql:mysql /tmp/mysql-runtime.log /tmp/mysql-stdout.log

# Render Free has an ephemeral filesystem. Initialize only when needed.
if [[ ! -d /var/lib/mysql/mysql ]]; then
  echo 'Initializing MySQL data directory...'
  if ! mysqld --initialize-insecure \
    --user=mysql \
    --datadir=/var/lib/mysql \
    --innodb-buffer-pool-size=32M \
    --log-error=/tmp/mysql-runtime.log; then
    echo 'MySQL initialization failed:'
    tail -n 100 /tmp/mysql-runtime.log || true
    exit 1
  fi
fi

echo 'Starting MySQL...'
mysqld \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --bind-address=127.0.0.1 \
  --port=3306 \
  --socket=/run/mysqld/mysqld.sock \
  --pid-file=/run/mysqld/mysqld.pid \
  --log-error=/tmp/mysql-runtime.log \
  --innodb-buffer-pool-size=32M \
  --innodb-log-buffer-size=4M \
  --performance-schema=OFF \
  --max-connections=10 \
  --table-open-cache=128 \
  --skip-log-bin \
  --mysqlx=OFF \
  > /tmp/mysql-stdout.log 2>&1 &
MYSQL_PID=$!
NODE_PID=''

cleanup() {
  if [[ -n "$NODE_PID" ]]; then kill "$NODE_PID" 2>/dev/null || true; fi
  kill "$MYSQL_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

echo 'Waiting for MySQL...'
READY=false
for i in $(seq 1 120); do
  if mysql --protocol=socket \
      --socket=/run/mysqld/mysqld.sock \
      -u root -e 'SELECT 1' >/dev/null 2>&1; then
    READY=true
    break
  fi
  if ! kill -0 "$MYSQL_PID" 2>/dev/null; then break; fi
  sleep 1
done

if [[ "$READY" != true ]]; then
  echo 'ERROR: MySQL failed to become ready.'
  if ! kill -0 "$MYSQL_PID" 2>/dev/null; then
    set +e
    wait "$MYSQL_PID"
    MYSQL_EXIT_CODE=$?
    set -e
    echo "MySQL exit code: $MYSQL_EXIT_CODE"
  else
    echo 'MySQL is running but is not accepting connections.'
  fi
  echo '=== MYSQL RUNTIME LOG ==='
  tail -n 100 /tmp/mysql-runtime.log || true
  echo '=== MYSQL STDOUT ==='
  tail -n 100 /tmp/mysql-stdout.log || true
  echo '=== MEMORY EVENTS ==='
  cat /sys/fs/cgroup/memory.events 2>/dev/null || true
  exit 1
fi

echo 'Preparing application database...'
mysql --protocol=socket --socket=/run/mysqld/mysqld.sock -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
SQL

echo 'Importing Tire Shop SQL dump...'
if ! mysql --protocol=socket \
    --socket=/run/mysqld/mysqld.sock \
    -u root "$DB_NAME" < "$SQL_DUMP"; then
  echo 'ERROR: SQL import failed.'
  exit 1
fi

echo 'Starting Express...'
node /app/index.js &
NODE_PID=$!

# Keep the container alive while both processes are healthy.
set +e
wait -n "$MYSQL_PID" "$NODE_PID"
EXIT_CODE=$?
set -e
echo "A service stopped (exit code: $EXIT_CODE)."
exit "$EXIT_CODE"
