#!/usr/bin/env bash
set -Eeuo pipefail

: "${DB_PASSWORD:?DB_PASSWORD is required}"

export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME="${DB_NAME:-tires_shop_idea2}"
export DB_USER="${DB_USER:-tire_app}"
export PORT="${PORT:-3030}"

# Validate values before using them in SQL
[[ "$DB_NAME" =~ ^[a-zA-Z0-9_]+$ ]]
[[ "$DB_USER" =~ ^[a-zA-Z0-9_]+$ ]]
[[ "$DB_PASSWORD" =~ ^[a-zA-Z0-9_-]{16,}$ ]] || {
  echo "Use a new password with 16+ letters, numbers, _ or -"
  exit 1
}

mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql

if [ ! -d /var/lib/mysql/mysql ]; then
  mysqld --initialize-insecure --user=mysql
fi

echo "Starting MySQL..."

mysqld \
  --user=mysql \
  --bind-address=127.0.0.1 \
  --innodb-buffer-pool-size=64M \
  --performance-schema=OFF \
  --max-connections=20 &
MYSQL_PID=$!

cleanup() {
  kill "${NODE_PID:-}" "$MYSQL_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for MySQL..."

READY=false

for i in $(seq 1 120); do
  if mysql --protocol=socket -u root -e "SELECT 1" \
    >/dev/null 2>&1; then
    READY=true
    break
  fi

  kill -0 "$MYSQL_PID" 2>/dev/null || break
  sleep 1
done

if [ "$READY" != true ]; then
  echo "MySQL failed to initialize"
  exit 1
fi

echo "Preparing database..."

mysql --protocol=socket -u root <<SQL
DROP DATABASE IF EXISTS \`$DB_NAME\`;
CREATE DATABASE \`$DB_NAME\`;
CREATE USER IF NOT EXISTS '$DB_USER'@'%'
  IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USER'@'%'
  IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.*
  TO '$DB_USER'@'%';
SQL

echo "Importing Tire Shop data..."

mysql --protocol=socket -u root "$DB_NAME" \
  < /app/db/tires_shop_idea2.sql

echo "Starting Express..."

node index.js &
NODE_PID=$!

wait -n "$NODE_PID" "$MYSQL_PID"