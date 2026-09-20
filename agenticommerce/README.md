# Agentic Commerce — Documentation

**Project:** GD Platform Engineering demo e-shop (`package.json` name `demo-app`, v0.1.0)
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind/daisyUI · Zod · Vitest
**Documentation version:** 1.1 · **Date:** 2026-09-20 · **Basis:** branch `feature/agentic-commerce` (commit `c239d77`); the vendored `enthusiast/` checkout is not part of the commit

## What this project is

A Node.js/Next.js demo storefront (clothing and accessories, 96 products, GBP) that has been made *agent-ready*. It does three things on top of a classic e-shop:

1. **Assists human shoppers with an LLM** — natural-language search (`/search?ai=true`) and a floating conversational assistant (`AssistantChat`).
2. **Exposes the shop to external AI agents** — REST catalog API, OpenAPI description, an MCP server, `llms.txt`, product feeds, schema.org JSON-LD, and a bot-aware `robots.txt`.
3. **Uses an LLM for catalog enrichment with human approval** — an admin workflow that proposes descriptions/SEO/categories, validates them against the source text, and requires a human to approve or revert.

[Enthusiast](https://github.com/upsidelab/enthusiast) is used as a **conceptual and technical reference** and as a **sidecar** that can answer AI search and chat (`AI_BACKEND=enthusiast`). See the honesty note below.

## Honesty note: what is and is not implemented

This documentation separates **facts observed in code**, **reasonable inferences**, and **proposals**. Labels used throughout:

| Label | Meaning |
|---|---|
| **Implemented** | Present in the code and exercised by tests or manual validation |
| **Partial** | Present but limited, mocked, or with known gaps |
| **Not implemented** | Not in the repository (often expected of "agentic commerce") |
| **Proposed** | Idea or roadmap item; *not* a feature |
| **To validate** | Cannot be derived from the repository; needs an owner's answer |

Key facts a reader must not miss:

- Two AI backends exist, chosen by `AI_BACKEND`: **`enthusiast`** (search and chat go to Enthusiast's *Product Search* agent, which does its own tool calling over the catalog) and **`direct`** (single-shot, JSON-mode completion with the whole catalog in the prompt: `src/lib/ai/llm.ts`). The Node app itself has **no agent loop, no embeddings, no vector search**.
- **Enthusiast is in the request path when `AI_BACKEND=enthusiast`** (and `ENTHUSIAST_TOKEN` is set) for **search and chat**: `src/lib/ai/client.ts` creates a conversation, asks the agent, polls the Celery task and reads the reply; `src/lib/ai/enthusiastAgent.ts` maps the reply back to catalog products. On any failure it falls back to the direct LLM, then to keyword search. Catalog import (`/api/products/dump` → `enthusiast/server/eshop_source/__init__.py`) and `/api/ai/health` (which also reports the agent) are unchanged. **Enrichment still calls the LLM directly**: Enthusiast's enrichment agent processes vendor product sheets, not existing descriptions, and is not registered in the sidecar.
- **Embeddings are deliberately not part of this integration.** The registered agent searches with SQL tools (`ProductSQLSearchTool`, `ProductExamplesTool`), so it works without them. Latency is much higher (~25 s vs ~2 s direct).
- **There is no checkout, order, or payment.** The cart page's "Checkout" button has no handler (`src/app/cart/page.tsx:27`). Agents can only *price* a cart and hand the customer a review link.
- **Data is mocked**: an in-memory catalog and carts (`src/lib/db/mock-db.ts`), a mock always-on session (`src/lib/authOptions.ts`), and a JSON file store for AI artefacts (`src/lib/ai/store.ts`). The Prisma/MongoDB schema exists but is not used at runtime (`src/lib/db/prisma.ts` re-exports the mock).
- **No GPT Actions/OAuth integration exists.** An OpenAPI document and an MCP endpoint are published, which is what a Custom GPT or MCP client would consume, but both are unauthenticated and read-only.

## Reading guide

| Read this | If you are | Time |
|---|---|---|
| [01-product-overview.md](01-product-overview.md) | Product, business, stakeholders | 10 min |
| [02-user-experience-and-commerce-flows.md](02-user-experience-and-commerce-flows.md) | Product, UX, QA | 15 min |
| [03-system-architecture.md](03-system-architecture.md) | Architects, engineers, DevOps | 20 min |
| [04-llm-and-agent-architecture.md](04-llm-and-agent-architecture.md) | AI/ML engineers, architects | 20 min |
| [05-gpt-bots-integration.md](05-gpt-bots-integration.md) | Partner/integration teams | 10 min |
| [06-functional-specification.md](06-functional-specification.md) | Engineers, QA, analysts | 25 min |
| [07-security-privacy-and-governance.md](07-security-privacy-and-governance.md) | Security, legal, compliance | 15 min |
| [08-roadmap-and-open-questions.md](08-roadmap-and-open-questions.md) | Everyone deciding what is next | 10 min |
| [presentation.html](presentation.html) | Stakeholder briefing (open in a browser; arrow keys) | 15 min |

## Maturity snapshot

| Area | State |
|---|---|
| AI-assisted search and chat (grounded by catalog id) | **Implemented**, demo grade |
| Agent surfaces (REST, OpenAPI, MCP, llms.txt, feeds, JSON-LD, robots, bot log) | **Implemented**, unauthenticated read-only |
| Cart preview + customer-confirmed handoff | **Implemented** |
| Enrichment with validation, review, revert, audit | **Implemented**, in-memory + JSON file |
| Enthusiast integration | **Implemented for search and chat** (agent conversation, signed conversation refs, fallbacks); **not used** for enrichment; embeddings excluded |
| Agent orchestration | **Delegated to Enthusiast** (Product Search agent). RAG / embeddings / vector search: **Not implemented** |
| Checkout, orders, payments, customer accounts | **Not implemented** |
| Real authentication / per-user authorization | **Not implemented** (mock session; shared admin token) |
| Production readiness | **Not production ready** (see doc 07 and 08) |

Automated tests: 77 Vitest tests in 10 files, all passing at the documentation date (`npm test`).

## Main assumptions

1. The code on the branch above is the source of truth. Runtime observations (container health, Enthusiast data set/agent, ~25 s agent latency) come from the local Docker stack on 2026-09-19/20 and are marked as such.
2. `enthusiast/` is an untracked local checkout of the upstream repository plus one custom plugin (`eshop_source`). Because it is not committed, `compose.enthusiast.yml` cannot start the sidecar from a fresh clone.
3. `docs/threat-model.md` and `docs/data-classification.md` describe intended controls; several differ from the code (see doc 07, "Documentation drift").
4. Real deployment topology beyond `compose.yaml`, `compose.enthusiast.yml` and `helm/` is **Not documented in the repository**.

No secret values were read or reproduced. `.env` files exist locally and are git-ignored (`.gitignore`).
