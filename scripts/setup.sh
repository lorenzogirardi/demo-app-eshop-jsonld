#!/usr/bin/env bash
# One-command start on a fresh clone. Needs Docker. The only thing you provide is your OpenRouter key:
#   OPENROUTER_API_KEY=sk-or-... ./scripts/setup.sh      (or run it and paste the key when asked)
# Safe to re-run: existing .env files are kept, the sidecar bootstrap is idempotent.
set -euo pipefail
cd "$(dirname "$0")/.."

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1"; exit 1; }; }
need docker; need openssl; need curl
docker compose version >/dev/null

rand() { openssl rand -hex "${1:-24}"; }

# --- OpenRouter key (never written anywhere except the git-ignored env files) ---
KEY="${OPENROUTER_API_KEY:-}"
if [ -z "$KEY" ] && [ -f .env ]; then
  KEY="$(grep -E '^OPENAI_API_KEY=' .env | cut -d= -f2- || true)"
  [ "$KEY" = "__YOUR_OPENROUTER_KEY__" ] && KEY=""
fi
if [ -z "$KEY" ]; then
  read -rsp "OpenRouter API key: " KEY; echo
fi
[ -n "$KEY" ] || { echo "An OpenRouter key is required."; exit 1; }

# --- env files ---
TOKEN=""
if [ ! -f .env.enthusiast ]; then
  TOKEN="$(rand 24)"
  sed -e "s|ECL_DB_PASSWORD=__GENERATED__|ECL_DB_PASSWORD=$(rand 12)|" \
      -e "s|ECL_DJANGO_SECRET_KEY=__GENERATED__|ECL_DJANGO_SECRET_KEY=$(rand 32)|" \
      -e "s|ECL_ADMIN_PASSWORD=__GENERATED__|ECL_ADMIN_PASSWORD=$(rand 10)|" \
      -e "s|ESHOP_DUMP_TOKEN=__GENERATED__|ESHOP_DUMP_TOKEN=$TOKEN|" \
      -e "s|OPENAI_API_KEY=__YOUR_OPENROUTER_KEY__|OPENAI_API_KEY=$KEY|" \
      .env.enthusiast.example > .env.enthusiast
  chmod 600 .env.enthusiast
fi
if [ ! -f .env ]; then
  [ -n "$TOKEN" ] || TOKEN="$(grep -E '^ESHOP_DUMP_TOKEN=' .env.enthusiast | cut -d= -f2-)"
  sed -e "s|NEXTAUTH_SECRET=__GENERATED__|NEXTAUTH_SECRET=$(rand 32)|" \
      -e "s|ENTHUSIAST_TOKEN=__GENERATED__|ENTHUSIAST_TOKEN=$TOKEN|" \
      -e "s|ADMIN_TOKEN=__GENERATED__|ADMIN_TOKEN=$(rand 24)|" \
      -e "s|OPENAI_API_KEY=__YOUR_OPENROUTER_KEY__|OPENAI_API_KEY=$KEY|" \
      .env.example > .env
  chmod 600 .env
fi
TOKEN="$(grep -E '^ENTHUSIAST_TOKEN=' .env | cut -d= -f2-)"

# --- Enthusiast sidecar ---
docker network inspect enthusiast-net >/dev/null 2>&1 || docker network create enthusiast-net >/dev/null
echo "Starting Enthusiast (first build takes several minutes)..."
docker compose --env-file .env.enthusiast -f compose.enthusiast.yml up -d --build

echo -n "Waiting for the Enthusiast API"
for _ in $(seq 1 90); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:10000/api/config/ || true)"
  [ "$code" != "000" ] && [ "$code" != "502" ] && break
  echo -n "."; sleep 5
done; echo

echo "Bootstrapping Enthusiast (token, data set, product source, agent)..."
for _ in $(seq 1 12); do
  if docker exec -i -e BOOT_TOKEN="$TOKEN" enthusiast-api python manage.py shell < scripts/enthusiast_bootstrap.py | grep -q BOOTSTRAP_OK; then ok=1; break; fi
  sleep 5
done
[ "${ok:-0}" = "1" ] || { echo "Bootstrap failed; see: docker logs enthusiast-api"; exit 1; }

# --- Shop ---
echo "Starting the shop..."
docker compose up -d --build
echo -n "Waiting for the shop"
for _ in $(seq 1 60); do
  curl -sf -o /dev/null http://localhost:3000/ && break
  echo -n "."; sleep 3
done; echo

echo "Importing the catalog into Enthusiast..."
SRC="$(docker exec -i -e BOOT_TOKEN="$TOKEN" enthusiast-api python manage.py shell -c "
from catalog.models import ProductSource
from sync.tasks import sync_product_source
s = ProductSource.objects.get(plugin_name='eShop Product Source'); sync_product_source.delay(s.id); print('SYNC_QUEUED')" | grep -c SYNC_QUEUED || true)"
[ "$SRC" = "1" ] && echo "Catalog import queued."

cat <<MSG

Ready:
  Shop:            http://localhost:3000        (AI search box: tick "AI"; assistant: bottom-right)
  Enthusiast UI:   http://localhost:10001       (login: see ECL_ADMIN_* in .env.enthusiast)
  Admin pages:     http://localhost:3000/admin/enrichment  (token: ADMIN_TOKEN in .env)
The agent needs a minute after the catalog import before it can answer well.
MSG
