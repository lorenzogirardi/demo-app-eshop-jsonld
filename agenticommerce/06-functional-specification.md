# 06 — Functional Specification

Status labels: **Implemented**, **Partial**, **Not implemented**. Every statement is derived from the code path cited.

## 1. Actors and roles

| Role | How identified | Notes |
|---|---|---|
| Anonymous shopper | Nothing (cookie `localCartId` for cart) | Default |
| "Signed-in" shopper | Mock session, always "Demo User" | `authOptions.ts`; no real accounts |
| Admin | Shared secret `ADMIN_TOKEN` (`Authorization: Bearer` or `x-admin-token`); if unset, open outside production | `src/lib/adminAuth.ts` |
| AI agent / crawler | User-Agent match only (for logging) | No authentication |
| Enthusiast worker | `Authorization: Token <ENTHUSIAST_TOKEN>` on `/api/products/dump` if configured | |
| Operator / support | — | **Not implemented** |

## 2. Feature × role matrix

| Feature | Anonymous | Shopper | Admin | AI agent | Notes |
|---|:-:|:-:|:-:|:-:|---|
| Browse, classic search | ✔ | ✔ | ✔ | ✔ (pages) | |
| AI search / assistant chat | ✔* | ✔* | ✔* | — | *Only if `AI_ENABLED=true`; rate limited |
| Cart add/edit | ✔ | ✔ | ✔ | — | Cookie cart |
| Agent REST / MCP / cart preview | ✔ | ✔ | ✔ | ✔ | Public, rate limited |
| Open handoff link and confirm | ✔ | ✔ | ✔ | — | Human step |
| Add product (`/add-product`) | ✔ ⚠ | ✔ | ✔ | — | ⚠ mock session ⇒ open |
| Enrichment generate/review | ✖ | ✖ | ✔ | — | Token |
| Bot dashboard | ✖ | ✖ | ✔ | — | Token |
| Checkout / order / payment | ✖ | ✖ | ✖ | ✖ | **Not implemented** |

## 3. Use cases

### UC-01 Classic search
- **Actor:** any visitor. **Trigger:** submit the navbar search. **Pre:** none.
- **Main:** server action redirects to `/search?query=…`; page filters products by case-insensitive `name`/`description` contains.
- **Alt:** no results → panel with category buttons (and "Search with AI" if AI is on).
- **Post:** none. **Acceptance:** results contain the query text; empty state offers next steps.

### UC-02 AI search
- **Trigger:** `/search?query=…&ai=true` with `AI_ENABLED=true`.
- **Main:** with `AI_BACKEND=enthusiast`, `aiSearch` asks the Enthusiast Product Search agent and maps catalog names in its reply to products; otherwise (or on failure) it sends catalog + query to the LLM and maps returned ids (max 20). The page shows answer, reasons and chips (direct path only) and ItemList JSON-LD.
- **Alt A:** Enthusiast fails → direct LLM; LLM fails too → classic results, `fallback_used: true`.
- **Alt B:** AI disabled → classic search regardless of `ai=true`.
- **Post:** none stored. **Acceptance:** every displayed product exists in the catalog; every displayed price equals the catalog price; disclaimer visible.

### UC-03 Assistant conversation
- **Pre:** `AI_ENABLED=true`. **Trigger:** open widget, type or tap a chip.
- **Main:** see doc 04 §2 (direct backend) and §2.3 (Enthusiast). On the Enthusiast backend `mode` is `recommend` when the agent names catalog products, else `ask`; there are no quick replies or reasons. Response `mode`: `ask` (no products, 2–4 quick replies) or `recommend` (≤4 products).
- **Rules:** after 2 assistant turns the model must recommend; the server also forces `recommend` mode.
- **Exceptions:** 400 invalid input/unsafe text; 403 AI disabled; 429; 500 `Assistant failed`; LLM failure → `fallback_used: true` keyword list.
- **Acceptance (tests):** fallback returns products from keyword match; clarifying limit enforced (`tests/ai/chat.test.ts`).

### UC-04 Agent product search (REST)
- **Trigger:** `GET /api/products?...`. **Main:** validated query → word-scored search → paged result. **Exceptions:** 400, 429.
- **Acceptance:** `limit` never exceeds 50; category filter is exact (case-insensitive); results sorted by score then id (`tests/ai/agent-api.test.ts`).

### UC-05 MCP session
- **Main:** `initialize` → `tools/list` → `tools/call`. **Exceptions:** wrong Origin 403; parse error 400/-32700; unknown tool -32602; invalid args → `isError` result.

### UC-06 Cart preview → handoff
- **Pre:** valid product ids. **Trigger:** `POST /api/cart/preview` or MCP `build_cart`.
- **Main:** merge duplicate lines, cap quantities, price from catalog, return `handoff_url`. Shopper opens it, sees repriced lines, presses *Add to my cart* → lines added to the cookie cart (existing quantities incremented) → redirect `/cart`.
- **Alt:** invalid lines reported in `errors[]` and dropped; no valid lines → `handoff_url: null` and the page shows "Nothing to review".
- **Post:** cart updated only after the human click. **Acceptance:** preview never changes cart state; totals never depend on client input.
- **Known limitation:** the handoff form does not cap the resulting cart quantity (increments add up).

### UC-07 Crawler reads a product page
- **Main:** page includes `Product` JSON-LD (offers with GBP price, availability always `InStock`, optional return policy if `RETURN_DAYS` is set; no shipping data is emitted), breadcrumbs, `ItemList` on home/search. AI-bot UA visits are logged.
- **Acceptance:** `safeJsonLd` output cannot contain a raw `<` (`tests/ai/jsonld.test.ts`).

### UC-08 Enrichment
- **Actor:** admin. **Pre:** `AI_ENABLED=true`, admin token, LLM key.
- **Main:** select products (≤20) and fields → generate proposals (3 concurrent) → each proposal carries auto-checks and confidence (share of passed checks) → admin approves (optionally edits) → description written to catalog, SEO/attributes/categories stored → audit entry.
- **Alt:** reject; revert (restores original description, drops SEO); override to approve despite failed checks (recorded in audit as `override: …`); newer approval supersedes older.
- **Exceptions:** 401 no token; 403 AI disabled; 503 no LLM key; 409 invalid state transition or failed checks; 404 unknown proposal.
- **Acceptance (tests):** ungrounded numbers/claims fail `grounded`; approve/revert cycle restores the original (`tests/ai/enrichment.test.ts`).

### UC-09 Bot monitoring
- **Actor:** admin. `GET /api/ai/bots` → `known_bots`, counts per bot, last 100 visits.

### UC-10 / UC-11 Checkout, post-sale
**Not implemented.**

## 4. API contract summary

| Method & path | Auth | Request | Success | Errors |
|---|---|---|---|---|
| `POST /api/ai/search` | none; AI flag | `{query, filters?{categories,price_min,price_max}, options?{max_results 1–50, timeout_ms 1000–30000, include_ai_answer}}` | `AISearchResponse` (`schema_version 1.0.0`, `correlation_id`, `fallback_used`, `ai_answer?`, `reasons`, `followups`, `disclaimer`, `products[]` (price in pence), `citations`, `grounding_score`, `metadata`) | 400, 429, 500 (body still shaped) |
| `POST /api/ai/chat` | none; AI flag | `{messages:[{role,content ≤600}] 1–12, conversation_ref?}` | `ChatReply` (+ `conversation_ref`, `backend: "enthusiast"\|"direct"`) | 400, 403, 429, 500 |
| `GET/POST /api/ai/enrich` | admin token; AI flag | GET: list. POST generate `{product_ids[≤20], fields[]}` or review `{proposal_id, action, notes?, override?, edits?}` | proposals / proposal | 400, 401, 403, 404, 409, 500, 503 |
| `GET /api/ai/bots` | admin token | — | `{known_bots, counts, visits}` | 401 |
| `GET /api/ai/health` | none | — | `{status, details, agent?}` (`agent`: id, name, type when the product-search agent is found) | 503 when Enthusiast unreachable |
| `GET /api/products` | none | query params | `{total, products[], limit, offset}` | 400 |
| `GET /api/products/{id}` | none | — | product | 404 |
| `POST /api/cart/preview` | none | `{items[]}` | preview (see doc 05) | 400 |
| `POST /api/mcp` | none, Origin check | JSON-RPC | JSON-RPC | 400, 403 |
| `GET /api/products/dump` | `Token` header if `ENTHUSIAST_TOKEN` set | — | `{count, documents[]}` (`ProductIndexDocument`, price in pence) | 401 |
| `GET /openapi.json`, `/llms*.txt`, `/feed/*`, `/sitemap.xml`, `/robots.txt` | none | — | discovery | — |

Server actions: `setProductQuantity`, `confirmItems` (handoff), `addProduct`, navbar `searchProducts`.

**Events:** `CatalogUpdateEvent` (`product.created|updated|deleted`) is *typed* in `src/lib/ai/types.ts` but **no code emits or consumes it** — Not implemented (Enthusiast syncs by pulling the dump).

**Contract inconsistencies to fix:** price units differ (pence in `/api/ai/*` and dump, pounds in agent API); `/api/ai/search` validation limits `timeout_ms` to ≤30 s while the search page passes 45 s directly; the Enthusiast path ignores `timeout_ms` and uses `ENTHUSIAST_TIMEOUT_MS`.

## 5. Configuration (environment)

| Variable | Purpose |
|---|---|
| `AI_ENABLED` | Master switch for AI UI/API (default off) |
| `AI_FALLBACK`, `AI_SEARCH_TIMEOUT_MS`, `AI_LOG_LEVEL` | Parsed by `config.ts`; only partly consumed |
| `AI_RATE_LIMIT` (10), `AGENT_RATE_LIMIT` (60) | Requests per IP per minute |
| `OPENROUTER_API_KEY` / `OPENAI_API_KEY`, `OPENROUTER_API_BASE`, `AI_SEARCH_MODEL`, `LLM_MAX_TOKENS` | LLM access (`llm.ts`) |
| `LLM_PROVIDER`, `OLLAMA_*`, `OPENROUTER_MODEL`, `LLM_TEMPERATURE`, `LLM_TIMEOUT_MS` | `config.ts` provider block (not used for inference) |
| `AI_BACKEND` (`enthusiast` \| `direct`, default `direct`) | Selects who answers search and chat |
| `ENTHUSIAST_URL`, `ENTHUSIAST_TOKEN` | Sidecar API base URL and DRF token (also compared on the dump endpoint) |
| `ENTHUSIAST_DATASET_ID`, `ENTHUSIAST_AGENT_ID`, `ENTHUSIAST_TIMEOUT_MS` | Optional: pin data set/agent (default: first data set, first product-search agent); agent timeout (45 s) |
| `CHAT_SIGNING_SECRET` | Optional key for conversation refs (falls back to `NEXTAUTH_SECRET`, `ADMIN_TOKEN`, then a random per-process key) |
| `ADMIN_TOKEN` | Admin endpoints |
| `URL`, `STORE_NAME`, `STORE_BRAND`, `DATA_DIR` | Absolute URLs, branding, store file location |
| `AI_TRAINING_BOTS` | `allow` (default) / `disallow` for training crawlers |
| `RETURN_DAYS`, `SHIPPING_COUNTRY` | Optional return policy in JSON-LD (`SHIPPING_FREE_OVER_GBP` appears in a code comment but is not read) |

Values are never reproduced here.

## 6. Non-functional requirements (current vs target)

| NFR | Current | Target proposal |
|---|---|---|
| Availability of shopping when AI fails | Met (fallbacks) | Keep; add alerting |
| Latency, AI search | Up to 45 s on the LLM path | p95 < 3 s via retrieval + smaller prompt + streaming |
| Cost control | Rate limit only | Budget cap, per-agent quotas, usage metrics |
| Data integrity of price | Met for products (always from catalog) | Also fact-check free text |
| Persistence | Not met (in-memory) | Real DB for catalog, carts, proposals, audit |
| Security | Demo grade | See doc 07 checklist |
| Accessibility | Partly addressed | WCAG audit |
| Test coverage | 77 unit/contract tests | Add route-level, e2e and LLM-eval runs |

## 7. Tests (evidence)

`npm test` → 10 files, 77 tests passing: config and types, validator, categories and dump contract, classic search and normalisation, evaluation dataset (`evaluation-data.ts`, classic smoke tests and an AI-readiness check), agent API + MCP + discovery files, chat, enrichment, JSON-LD, Enthusiast backend (mocked Enthusiast API: name matching, signed refs, fallbacks). **LLM calls are mocked**; no test runs a live model. No end-to-end, load or security tests. No CI configuration exists in the repository.
