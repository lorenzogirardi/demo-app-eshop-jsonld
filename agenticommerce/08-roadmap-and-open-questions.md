# 08 — Roadmap and Open Questions

All roadmap items below are **Proposed**. The repository contains no roadmap file; priorities are derived from gaps observed in docs 02–07.

## 1. Current state

| Status | Items |
|---|---|
| **Available** | AI search + assistant (catalog-grounded, with fallback); REST/OpenAPI/MCP agent surface; cart preview + human handoff; JSON-LD, llms.txt, feeds, robots policy; bot log; enrichment with validation, approval and revert; 68 passing unit/contract tests |
| **Implemented (opt-in)** | Enthusiast Product Search agent behind AI search and chat (`AI_BACKEND=enthusiast`), with fallbacks |
| **In development / partial** | Embeddings (deliberately excluded); enrichment and other Enthusiast agents not connected; Helm chart with TODOs |
| **Proposed / future** | Retrieval (embeddings), LLM tool calling, real checkout and orders, accounts and OAuth, agent keys, human escalation, analytics, persistence |

## 2. Gaps

| Area | Gap |
|---|---|
| Agentic | No orchestrator, tool calling, retrieval or memory beyond 12 client turns |
| Commerce | No checkout, orders, payment, stock, shipping, tax, post-sale |
| Identity | Mock session; shared admin token; no agent identity |
| Data | In-memory catalog/carts; JSON file store; Prisma/Mongo schema unused |
| Observability | No logs, metrics, traces, AI audit, cost tracking (`tokens_used` = 0) |
| Quality | Free-text answers unverified; synthetic scores; ASCII-only sanitiser; false-positive filter |
| Ops | No CI/CD; broken/unclear health check; port mismatch (12000 vs 3000); CSP hard-codes localhost; Helm lacks AI env |

## 3. Technical debt

1. Two LLM configuration systems (`config.ts` vs `llm.ts`); unused `provider` block and `OPENAI_API_KEY` vs OpenRouter base URL mismatch.
2. ~~Mislabelled response metadata~~ (fixed: real provider/model reported). Enthusiast path returns no `reasons`/`followups`.
3. Duplicated price units (pence vs pounds) across APIs.
4. `CatalogUpdateEvent` type without producer/consumer.
5. Leftover upstream sample code (`@auth/prisma-adapter`, Mongo schema, `mergeAnonymousCartIntoUserAccount`).
6. Global mutable singletons (`store.ts`, `mock-db.ts`) tied to a single process.
7. Doc/code drift in `docs/threat-model.md` and `docs/data-classification.md`.
8. `enthusiast/` vendored and untracked; no version pin.
9. Uncommitted work: most agent features exist only in the working tree.

## 4. Roadmap (Now / Next / Later)

### Now — make the demo safe and honest (days)
| # | Item | Why |
|---|---|---|
| N1 | Validate assistant turns for injection; move history validation server-side | T1 |
| N2 | Close `/add-product`; fail closed for admin and dump tokens; drop hard-coded secret | T5, T9, T10 |
| N3 | Report real token usage in responses (provider/model labels are now correct) | Accuracy |
| N4 | Fix Dockerfile health check and port alignment; make CSP `connect-src` environment-driven | Ops |
| N5 | Unicode-aware sanitiser; narrower sensitive-word logic | Multilingual UX |
| N6 | Surface "availability not guaranteed" in OpenAPI/MCP descriptions | T6 |
| N7 | Commit the work; add CI running `npm test`, lint, build | Governance |
| N8 | Update threat model and data classification to match code | Drift |

### Next — build the agentic core (weeks)
| # | Item | Outcome |
|---|---|---|
| X1 | Structured logging + metrics (latency, tokens, fallback rate, zero-result rate) | KPIs measurable |
| X2 | Retrieval: generate embeddings (Enthusiast or provider) and retrieve top-k before ranking; keep id re-resolution | Scales beyond 96 products |
| X3 | Single tool registry (Zod) shared by MCP and internal function calling | One contract |
| X4 | Fact-check step for free text; live LLM evaluation set in CI | Trust |
| X5 | Real persistence (catalog, carts, proposals, audit) and shared rate limiter | Multi-replica correctness |
| X6 | Agent API keys, quotas, per-agent audit; publish a reference Custom GPT | Attributable agent channel |
| X7 | Feedback controls and AI-use notice; escalation stub (email/ticket) | UX trust |

### Later — transactions and service (quarters)
| # | Item | Notes |
|---|---|---|
| L1 | Real authentication and accounts | Prerequisite for orders |
| L2 | Checkout, payment provider, order management, stock | Must keep explicit human confirmation |
| L3 | Authenticated agent scopes (OAuth) for order status and reorder | Consent screens |
| L4 | Post-sale assistant (tracking, returns) using Enthusiast agents or native tools | Requires OMS |
| L5 | Catalog enrichment at scale with scheduled batches and reviewer workflow | Multi-user reviewers |
| L6 | Personalisation and merchandising analytics | Privacy review |

## 5. Open questions (to validate)

**Product**
1. Which outcome matters for the demo: internal showcase, customer pilot, or a reference architecture for other brands?
2. Is checkout in scope? If yes, which platform (headless commerce, existing ERP/OMS)?
3. Which languages must the assistant support? (Current sanitiser breaks accented input.)
4. Should training crawlers be allowed (`AI_TRAINING_BOTS=allow` is the default)?

**Engineering**
5. Is Enthusiast the default backend given ~25 s agent latency and a serial Celery worker, or should `direct` stay default? Should embeddings be enabled later for retrieval?
6. Target LLM providers and models; is OpenRouter acceptable in production?
7. Target runtime: single container or Kubernetes with HPA (which forces external state)?
8. Why does the Dockerfile expose 3000 while `npm start` uses 12000? Which is canonical?
9. Which token name is canonical for the dump (`ENTHUSIAST_TOKEN` in Node vs `ESHOP_DUMP_TOKEN` in the Enthusiast compose)? They must hold the same value.

**Legal / Privacy / Brand**
10. Is sending shopper text to a third-party LLM permitted; what DPA, region, retention?
11. Who is accountable for AI-written product copy and claims?
12. Are the enrichment blocklist words (warranty, made in, luxury, …) aligned with brand and regulatory rules?
13. What disclosures are required for AI-assisted recommendations?

**Business**
14. Which KPIs and targets define success (conversion, AOV, support deflection)?
15. Who owns bot-traffic policy and which vendors are strategic?

## 6. Risks and dependencies

| Risk | Impact | Mitigation |
|---|---|---|
| LLM provider outage/latency | Slower or degraded search | Existing fallback; add SLO alerting |
| Model cost growth with whole-catalog prompts | Budget | Retrieval; token accounting |
| Prompt injection or misleading AI copy harms brand | Reputation | N1, X4, human review |
| In-memory state loss on restart/scale-out | Wrong carts, lost approvals | X5 |
| Agent traffic without attribution | Scraping, cost | X6 |
| Standards churn (MCP versions, agent checkout protocols) | Rework | Keep contracts thin; version the API |
| Dependency on a vendored upstream (Enthusiast) | Drift | Pin version; decide role (Q5) |
| Demo mistaken for production | Security exposure | Label and gate deployments |

Dependencies: LLM provider account; decision on commerce platform; identity provider; observability stack; Legal review of AI notices.

## 7. Architectural decisions needed

1. **Source of truth** for catalog/stock/price (PIM/ERP/commerce engine) and sync model (pull dump vs events).
2. **Agent boundary**: which capabilities agents may ever call without a human click (recommend: none that spend money).
3. **Retrieval layer**: in-app (pgvector/managed) vs Enthusiast service.
4. **Identity and consent model** for agents acting on behalf of shoppers.
5. **Observability and audit** standard for AI interactions, with retention and access rules.
