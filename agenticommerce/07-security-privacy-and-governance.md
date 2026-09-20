# 07 — Security, Privacy and Governance

Scope: the Node app as of 2026-09-20 (commit `c239d77`). This is a review of the *code*, not a penetration test. No secret values are reproduced.

## 1. Threat overview

| # | Threat | Where it applies | Existing measure (evidence) | Gap | Severity |
|---|---|---|---|---|---|
| T1 | **Prompt injection** via user text | `/api/ai/chat`, `/api/ai/search` (on the Enthusiast backend assistant turns are not forwarded) | 13-pattern regex, markup stripping, prompt says content is data (`validator.ts`, prompts) | Regex evasion; **client-supplied `assistant` turns skip the injection check** (`validateTurns`); AI-search page calls `aiSearch` without the validator | High |
| T2 | Injection via catalog/enrichment text | Prompts include descriptions | Data/instruction rule; ids re-resolved | Product text from `add-product` (open) or enrichment flows into prompts and pages | Medium |
| T3 | **PII leakage** to LLM provider | Chat/search text sent to OpenRouter-compatible API, and on the Enthusiast backend also stored in Enthusiast's Postgres as conversation history | Filter blocks words like "password", "credit card"; no cart/session data in prompts | Users can type names, addresses, emails; no redaction, no privacy notice, provider retention unknown | High |
| T4 | **Abuse of tool calling** by agents | REST/MCP | Read-only tools; validation; caps | No auth, no quotas; scraping and cost via the shared IP bucket | Medium |
| T5 | Unauthorized data access | Admin APIs/UIs | `ADMIN_TOKEN` with constant-time compare (`adminAuth.ts`) | If token unset, endpoints are open outside production; single shared secret; token kept in `sessionStorage`; `/add-product` open (mock session) | High |
| T6 | Price/stock errors | Agent and AI answers | Server-side pricing; ids from catalog | `in_stock` is always true; free-text may quote wrong facts | Medium |
| T7 | **Unconfirmed commerce actions** | Cart | Preview is stateless; handoff needs human click | Checkout not built — must be designed with confirmation | Low today |
| T8 | Rate-limit bypass / DoS | Middleware | 10/min AI, 60/min agent per IP | Trusts `x-forwarded-for` (spoofable if not behind a trusted proxy); per replica; memory map | Medium |
| T9 | Secrets exposure | Repo | `.env`, `.env.*` git-ignored | Hard-coded NextAuth secret string `"mock-secret"` in `authOptions.ts`; compose defaults (`change-me-in-production`, `changeme`, DB defaults) | High if deployed |
| T10 | Catalog exfiltration | `/api/products/dump` | `Authorization: Token` check | Auth **skipped when `ENTHUSIAST_TOKEN` is unset**; non-constant-time comparison; middleware still rate limits; the same data is public via `/api/products` and feeds | Low (data is public) |
| T11 | XSS | JSON-LD, AI text | `safeJsonLd`; React escaping; CSP | CSP allows `unsafe-inline` and `unsafe-eval` scripts | Medium |
| T12 | Clickjacking / transport | Headers | `X-Frame-Options: DENY`, `frame-ancestors 'none'`, HSTS, `nosniff` | — | Low |
| T13 | Untrusted proxy of MCP from a browser | `/api/mcp` | Origin must equal site URL | No CORS headers; fine | Low |
| T15 | **Enthusiast shared service token** | `client.ts` | Conversation ids are HMAC-signed before reaching the browser; only the newest user message is forwarded | One token gives full access to the sidecar; `ENTHUSIAST_TOKEN` doubles as the dump token; default sidecar credentials in compose | Medium |
| T14 | Supply chain / config | Dockerfile, Helm | Standalone build, non-root user | `npm install --legacy-peer-deps` (not `ci`); vendored `enthusiast/` unpinned checkout | Low |

## 2. Findings worth immediate attention

1. **Forged assistant turns.** `validateTurns` applies `SearchQuerySchema` (injection/sensitive checks) only to `role: "user"`; `role: "assistant"` content goes to the model after markup stripping. A client can therefore inject instruction-like text as a *fake prior assistant message*. Mitigation: check assistant turns too, or keep history server-side and sign it.
2. **`/add-product` is effectively public** because `getServerSession` always returns a user (`authOptions.ts`). Anyone can mutate the in-memory catalog, and that text is later sent to the LLM and rendered.
3. **Admin token fallback:** with no `ADMIN_TOKEN`, admin APIs are open when `NODE_ENV !== "production"`. Container builds run with `NODE_ENV=production`, but local/staging deployments may not.
4. **Hard-coded auth secret** (`authOptions.ts`) — replace with `NEXTAUTH_SECRET` before any real auth.
5. **Dump endpoint auth** should fail closed when the token is not configured and use a constant-time compare (`adminAuth.ts` already has one).
6. **False-positive sensitive-word filter** blocks legitimate queries and leaks internal wording to users; conversely it gives false comfort against real PII.
7. **Sanitiser strips non-ASCII letters** (`\w`), harming multilingual users and degrading LLM input.

## 3. Documentation drift (`docs/threat-model.md`, `docs/data-classification.md`)

The documents describe intentions that the code does not yet fulfil:

| Document claims | Code reality |
|---|---|
| "Log all AI interactions with correlation ID, timestamp, query, response" | Not implemented; only enrichment actions and bot visits are audited |
| "Enthusiast unavailable → circuit breaker" | No circuit breaker; each request tries Enthusiast (up to the 45 s timeout) and then falls back to the direct LLM or keyword search |
| "Token auth between Node and Enthusiast for search" | **True** on the `enthusiast` backend (`Authorization: Token`); the same variable also guards the dump endpoint |
| "Re-verify price from source before display" | **True** (ids re-resolved; prices from catalog) |
| "Timeout 5 s for search" | Search page uses up to 45 s; API default 5 s, max 30 s |
| "Admin-only auth check on `/api/ai/enrich`" | **True**, via shared token |
| "Only PUBLIC data sent to LLM" | True for product data; **user free text is not classified as PII-safe** |
| "Sanitize: strip control chars" | Only HTML tags and non-listed characters are stripped |
| Data classification: search queries = PUBLIC | Should be at least INTERNAL: queries can contain personal data |

Update these documents or the code so they agree.

## 4. Privacy

| Topic | Current | Requirement |
|---|---|---|
| Personal data processed | Chat/search text (browser → shop → LLM provider); cart cookie; bot UA strings; mock user | Record purposes and lawful basis (**To validate with Legal**) |
| Third-party processor | OpenRouter (and the model vendor behind it); Enthusiast sidecar stores conversations (retention not configured) | DPA, retention/training opt-out, region, conversation retention in Enthusiast (**To validate**) |
| Client storage | Chat history in `sessionStorage` (cleared on tab close); admin token in `sessionStorage` | Disclose; keep out of persistent storage |
| Server logs of prompts | None (no logging) | If added: redact PII, short retention, access control |
| Consent | No banner/notice for AI use | Provide "AI assistant" notice and link to policy before first message |
| Data subject rights | No user data store exists | Define when accounts/orders arrive |
| Bot log | Stores UA and path (≤200 entries) | Low risk; keep bounded |

## 5. Irreversible or economically significant actions

Design rule (**Proposed** for when checkout exists; **enforced today** only for cart addition):

| Action | Rule |
|---|---|
| Add to cart | Explicit user click on the shop page (Implemented: handoff) |
| Place order, pay | Explicit, separate confirmation showing items, total, delivery, tax — performed by the human in the shop UI, never by an agent tool |
| Cancel, refund, address change | Authenticated user + confirmation + audit entry; no LLM-initiated execution |
| Price/stock claims | Always sourced from the system of record at confirmation time |
| Idempotency | Every write gets an idempotency key; agent retries must not duplicate orders |

## 6. Governance for AI content

- **Human-in-the-loop for catalog changes:** implemented (draft → approve/edit/reject/revert; override is explicit and audited).
- **Audit:** `AuditEntry` with actor, action, product, proposal (500 kept). Actor is always the literal `"admin"` → cannot attribute to a person.
- **Model/version traceability:** proposals record provider, model and correlation id.
- **Evaluation:** deterministic checks only; an evaluation dataset exists (`tests/ai/evaluation-data.ts`) but no live LLM evaluation runs.
- **Kill switch:** `AI_ENABLED=false` disables UI, chat and enrichment; requires restart to change.
- **Change control:** no CI, no code owners, no release process in the repo.

## 7. Checklist

Security
- [ ] Replace mock session; real authN/authZ, RBAC for admin and product creation
- [ ] Remove hard-coded secret; load from environment/secret manager
- [ ] Admin and dump endpoints fail closed without a token
- [ ] Validate assistant turns on the direct backend (the Enthusiast backend does not forward them) or hold history server-side
- [ ] Give the Enthusiast agent an injection-resistant prompt; separate `ENTHUSIAST_TOKEN` from the dump token; change sidecar default credentials
- [ ] Trusted-proxy handling for client IP; shared rate limiter (Redis) for multi-replica
- [ ] Tighten CSP (remove `unsafe-eval`, nonce scripts, environment-driven `connect-src`)
- [ ] Fix `HEALTHCHECK`; run image scan; use `npm ci`
- [ ] Per-agent API keys and quotas (if agent access should be attributable)

Privacy
- [ ] AI-use notice and privacy policy link in the widget
- [ ] Processor agreement and retention settings for the LLM provider
- [ ] PII redaction before sending text to the LLM (or refusal UX)
- [ ] Update `docs/data-classification.md` for user free text

AI governance
- [ ] Log AI requests/responses (redacted) with correlation id, model, tokens, latency, `fallback_used`
- [ ] Fact-check free text against returned products
- [ ] Live evaluation set with pass thresholds in CI
- [ ] Named reviewer identity in audit; export of audit trail
- [ ] Human escalation path
- [ ] Documented incident procedure (bad recommendation, leaked data)
