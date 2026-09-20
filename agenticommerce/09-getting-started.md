# 09 — Getting Started (fresh clone)

How to run the whole demo (shop + Enthusiast sidecar) on a new machine. The only value you must supply is your **OpenRouter API key**; every other secret is generated locally and never committed.

## 1. Prerequisites

| Need | Notes |
|---|---|
| Docker with Compose v2 | Docker Desktop must be **running** |
| Git with GitHub access | SSH key or HTTPS credentials |
| `openssl`, `curl` | Present by default on macOS and Linux |
| Free ports | 3000 (shop), 10000 (Enthusiast API), 10001 (Enthusiast UI) |
| Memory/disk | Several GB of free disk; the first build downloads images and Python/Node dependencies |
| OpenRouter API key | Used by the shop and by Enthusiast's agent |

## 2. Steps

```bash
git clone git@github.com:lorenzogirardi/demo-app-eshop-jsonld.git
cd demo-app-eshop-jsonld
OPENROUTER_API_KEY=<your-key> ./scripts/setup.sh
```

Without the variable the script asks for the key (input hidden). The first run takes several minutes (image builds). When it ends it prints the URLs. Then wait about a minute for the catalog import before judging the assistant.

## 3. What `scripts/setup.sh` does

| Step | Detail |
|---|---|
| Env files | Creates `.env` (shop) and `.env.enthusiast` (sidecar) from `.env.example` / `.env.enthusiast.example`, with random secrets and your key. Both are git-ignored, permissions `600`. Existing files are kept |
| Shared token | One random token is used as `ENTHUSIAST_TOKEN` (shop), `ESHOP_DUMP_TOKEN` (Enthusiast source plugin) and Enthusiast's API token |
| Network | Creates the Docker network `enthusiast-net` if missing |
| Sidecar | `docker compose --env-file .env.enthusiast -f compose.enthusiast.yml up -d --build`: Postgres+pgvector, Redis, API, worker, beat, UI |
| Bootstrap | `scripts/enthusiast_bootstrap.py` (idempotent) creates the API token, the "eShop Products" data set, the eShop product source and the "eShop Search Agent" (Product Search) |
| Shop | `docker compose up -d --build` builds and starts the shop on port 3000 |
| Catalog import | Queues a sync so Enthusiast pulls the catalog from the shop (`/api/products/dump`) |

The script can be re-run safely.

## 4. Use it

| What | Where |
|---|---|
| Shop | http://localhost:3000 |
| AI search | Tick **AI** next to the search box, then search (with `AI_BACKEND=enthusiast` a query takes about 25 s) |
| Assistant chat | Floating button, bottom right |
| Enrichment admin | http://localhost:3000/admin/enrichment (token: `ADMIN_TOKEN` in `.env`) |
| AI bot activity | http://localhost:3000/admin/bots (same token) |
| Enthusiast UI | http://localhost:10001 (user `admin@example.com`, password `ECL_ADMIN_PASSWORD` in `.env.enthusiast`) |
| Health check | `curl localhost:3000/api/ai/health` should report the product-search agent |
| Agent API | `curl localhost:3000/api/products?q=bag`, `localhost:3000/openapi.json`, `localhost:3000/llms.txt` |

## 5. Configuration you may change (`.env`, then restart the shop)

| Variable | Effect |
|---|---|
| `AI_ENABLED` | `false` hides all AI features and falls back to keyword search |
| `AI_BACKEND` | `enthusiast` (agent first, ~25 s) or `direct` (LLM only, ~2 s) |
| `OPENAI_API_KEY` | Your OpenRouter key (the name is historical) |
| `ADMIN_TOKEN` | Token for the admin pages |
| `URL` | Public base URL used in links and feeds; change it if you do not use `localhost:3000` |

Restart the shop after editing: `docker compose up -d --build` (rebuild is needed only for code changes; `docker compose restart` picks up `.env` changes).

## 6. Daily operations

```bash
# stop
docker compose down
docker compose --env-file .env.enthusiast -f compose.enthusiast.yml down

# start again (no rebuild)
docker compose --env-file .env.enthusiast -f compose.enthusiast.yml up -d
docker compose up -d

# logs
docker logs -f gd-demo-app
docker logs -f enthusiast-api
docker logs -f enthusiast-worker

# full reset of Enthusiast data (deletes conversations and imported catalog), then run setup.sh again
docker compose --env-file .env.enthusiast -f compose.enthusiast.yml down -v
```

## 7. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop is not running |
| Port already in use | Free 3000, 10000 or 10001, or stop the other service |
| Script fails at "Bootstrap" | The Enthusiast API was still starting. Check `docker logs enthusiast-api`, then re-run the script |
| AI search returns keyword results only | Enthusiast is unreachable or slow (45 s limit) and the shop fell back; check `curl localhost:3000/api/ai/health` and the worker logs. With no valid key the direct LLM also fails |
| Assistant answers poorly right after start | The catalog import is still running; wait a minute |
| Chat stops answering after a few messages | Rate limit (10 AI requests per minute per IP by default, `AI_RATE_LIMIT`); wait a minute. Older versions also rejected long assistant replies in the history (fixed) |
| Enthusiast UI (port 10001) not reachable | Fixed in the current version: the UI needs a healthy API and a `PORT` variable. Re-run `./scripts/setup.sh` after pulling |
| Wrong links or images in feeds and handoff URLs | `URL` in `.env` does not match the address you use |
| Answers slow | Expected on `AI_BACKEND=enthusiast`; switch to `direct` for speed |

## 8. What this setup is not

- **Not production**: mock data and login, shared tokens, default-style sidecar settings (`ECL_DJANGO_DEBUG=True`), in-memory carts (lost on restart). See doc 07.
- **Embeddings** are not part of the demo path; the agent searches with SQL tools, so answers work without them.
- **Not tested from an empty machine** by the author at the time of writing: the script was validated against a running stack and with a stubbed Docker, not with a full clean install. Report the first failing step if something breaks.
