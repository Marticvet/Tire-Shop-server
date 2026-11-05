TIRE SHOP RENDER DEPLOYMENT - V2 (BUILD-TIME MYSQL SEED)

Replace these files in the ROOT of your Tire-Shop-server Git repository:
  Dockerfile.render
  start-render.sh
Add:
  seed-db.sh
Keep your existing index.js, config.js, Dockerfile, docker-compose.yml unchanged.
Keep the non-sensitive SQL dump at db/tires_shop_idea2.sql.

The Docker image now imports SQL AT BUILD TIME. Runtime starts an already
initialized MySQL database, creates the app user from environment variables,
and launches your existing Express API.

Required Render service settings:
  Runtime: Docker
  Dockerfile path: ./Dockerfile.render
  Docker build context: .
  PORT=3030
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_NAME=tires_shop_idea2
  DB_USER=tire_app
  DB_PASSWORD=<a newly generated password: openssl rand -hex 24>
  JWT_SECRET=<different newly generated password: openssl rand -hex 32>

Local test (Docker running):
  docker build -f Dockerfile.render -t tire-shop-render .
  docker run --rm --name tire-shop-test --memory=512m -p 3031:3030 \
    -e DB_PASSWORD="$(openssl rand -hex 24)" \
    -e JWT_SECRET="$(openssl rand -hex 32)" \
    tire-shop-render
  curl -i http://localhost:3031/tires/manufacturers

DO NOT commit real passwords or customer data. This is a disposable demo
setup only. Persistent DB changes disappear when Render restarts/spins down.

IMPORTANT: This modification is untested on Render. It eliminates repeat SQL
import and MySQL initialization at runtime, but cannot guarantee that MySQL
will run reliably within Render's 512 MB and limited CPU. If startup fails,
inspect the printed MySQL error log before attempting further tuning.
