# 01 — Product Overview

## 1. Vision

Let a shopper — or an AI agent acting for a shopper — go from *"something for the evening, under £900"* to a priced, reviewable cart, **without the shop giving up control of prices, facts or the purchase decision**.

The project is a demo of *Agentic Commerce* for a luxury-style clothing and accessories catalog. Its stance: the LLM **proposes and explains**; the shop's catalog **is the source of truth**; the human **confirms**.

## 2. Problem and opportunity

| Problem | Evidence in the project | Response |
|---|---|---|
| Keyword search fails on intent ("a gift", "for the evening") | Classic search is a substring match on name/description (`src/app/search/page.tsx`, `classicSearch` in `src/lib/ai/search.ts`) | AI search and assistant chat rank catalog products by intent (**Implemented**) |
| Shoppers increasingly ask AI assistants (ChatGPT, Claude, Perplexity) instead of browsing | `KNOWN_BOTS` lists 11 AI crawlers/agents (`src/lib/bots.ts`) | Make the shop readable and queryable by agents: JSON-LD, llms.txt, feeds, OpenAPI, MCP (**Implemented**) |
| Agents must not buy on the shopper's behalf without control | `buildCartPreview` never stores anything and returns `requires_customer_confirmation: true` (`src/lib/agentApi.ts`) | Cart preview + `handoff_url` where the human confirms (**Implemented**) |
| Catalog copy is thin and unstructured | Enrichment feature (`src/lib/ai/enrichment.ts`) | LLM proposals validated against the source text, approved by a human, revertible (**Implemented**) |
| Merchants cannot see AI-agent traffic | `recordBotVisit`, `/admin/bots` | Bot visit log and dashboard (**Implemented**, in-memory/JSON, last 200 visits) |

## 3. Target users and stakeholders

| Persona | Goal | Touchpoint today | Status |
|---|---|---|---|
| **Browsing shopper** ("Giulia", gift-buyer) | Find something fitting an occasion and budget quickly | `AssistantChat`, `/search?ai=true` | **Implemented** |
| **Delegating shopper** (uses ChatGPT/Claude/Perplexity) | Ask an assistant to shop and get a link to confirm | REST/MCP/OpenAPI, cart handoff | **Implemented** (agent side is external; no bot was validated end-to-end in a real third-party GPT — **To validate**) |
| **Merchant / catalog manager** | Better product copy and SEO without brand risk | `/admin/enrichment` | **Implemented** |
| **Digital/AI owner** | Know which AI agents visit; control training vs search bots | `/admin/bots`, `robots.ts`, `AI_TRAINING_BOTS` | **Implemented** |
| **Customer-support team** | Handle escalations from the assistant | — | **Not implemented** (no handoff to a human; see doc 02) |
| **Platform engineering** (the demo's audience) | Reusable pattern for agent-ready shops | Repo, Helm, compose | **Partial** |

Stakeholders to involve: Product, E-commerce, Brand/Legal (AI-generated copy and claims), Security/Privacy, Platform Engineering, Support.

## 4. Jobs to be Done

1. *When I don't know the exact product name, I want to describe the occasion, so I can see a short list I can trust.* → AI search / chat.
2. *When I ask my AI assistant for a product, I want it to give me accurate price and link, so I can decide on the shop's site.* → `/api/products`, MCP `search_products`, `get_product`.
3. *When an assistant prepares a basket for me, I want to review it and confirm myself, so nothing is bought without me.* → `/cart/handoff`.
4. *When I manage the catalog, I want AI-written copy that never invents facts, so I can publish faster with low risk.* → enrichment with grounding checks and approval.
5. *When AI crawlers visit, I want to allow discovery but decide about training, so I keep control of the brand's content.* → `robots.ts`.

## 5. Value proposition

| For | Benefit | How (in this repo) |
|---|---|---|
| Shopper | Faster, intent-based discovery; on the direct backend a stated reason per product | `reasons` (≤15 words each) + follow-up chips (empty on the Enthusiast backend) |
| Shopper | Trust: displayed products and prices always from the catalog | Direct backend: LLM returns ids, re-resolved from the catalog. Enthusiast backend: catalog names found in the agent's reply (`matchCatalogProducts`). The free-text answer itself is not fact-checked |
| Merchant | Discoverability by AI assistants | JSON-LD, `llms.txt`, feeds (Google Merchant RSS), sitemap |
| Merchant | Safer AI copy | Deterministic checks: length, placeholders, category whitelist, numbers/claims must exist in source |
| Merchant | Control and auditability | Approve/edit/reject/revert; audit trail (last 500 entries) |
| Business | Cost and abuse control | Feature flag `AI_ENABLED`, rate limiting, classic-search fallback |

**Differentiation:** a *human-confirmation boundary* is built into the protocol surface (`requires_customer_confirmation`, `handoff_url`, MCP `instructions` telling clients never to claim a purchase). The demo deliberately stops before checkout.

## 6. Main use cases (summary)

Detailed in [06-functional-specification.md](06-functional-specification.md).

| ID | Use case | Status |
|---|---|---|
| UC-01 | Classic keyword search | Implemented |
| UC-02 | AI-assisted search (reasons and follow-ups on the direct backend) | Implemented |
| UC-03 | Conversational assistant (ask ≤2 clarifying questions, then recommend ≤4) | Implemented |
| UC-04 | Agent catalog search/read via REST | Implemented |
| UC-05 | Agent tool use via MCP | Implemented |
| UC-06 | Cart preview → customer handoff → add to cart | Implemented |
| UC-07 | Product page with JSON-LD for crawlers | Implemented |
| UC-08 | Enrichment generate → review → approve/revert | Implemented |
| UC-09 | Bot traffic monitoring | Implemented |
| UC-10 | Checkout / order / payment | **Not implemented** |
| UC-11 | Post-sale (tracking, returns, support) | **Not implemented** |

## 7. Success metrics (suggested KPIs)

The repository **does not measure any of these** (no analytics; AI interactions are not logged — see doc 07). They are proposals.

| Category | KPI | Note |
|---|---|---|
| Discovery | Zero-result rate of classic vs AI search | Needs query logging |
| Discovery | Assistant → product click-through; recommendation acceptance | Needs client events |
| Trust | % of AI answers with fallback (`fallback_used`) | Field already in every response |
| Quality | Enrichment first-pass acceptance rate; override rate; revert rate | Derivable from `audit` |
| Quality | Grounding failures per 100 proposals | Derivable from `validation.issues` |
| Agent channel | Visits by bot kind (search / user-agent / training); agent→handoff conversion | `botVisits` exists; handoff opens are not tracked |
| Cost | LLM cost per session; latency p95 (about 25 s on the Enthusiast backend vs about 2 s direct) | `tokens_used` is always 0 today — **Partial** |
| Business | Conversion and AOV of assisted vs unassisted sessions | Needs checkout and analytics |

## 8. Feature status at a glance

| Existing | Partial / not connected | Hypothesised (not a commitment) |
|---|---|---|
| AI search and chat (Enthusiast agent or direct LLM), agent API, MCP, feeds, JSON-LD, bot log, enrichment, handoff | Embeddings (deliberately excluded); other Enthusiast agents; config cleanup; CSP/health-check fixes | Real checkout, accounts, order status tools, human escalation, OAuth for agents, GPT Actions |

The middle column is inferred from `compose.enthusiast.yml`, the Enthusiast plugins and the unused `OLLAMA_EMBEDDING_MODEL` setting. **No roadmap document exists in the repository**: priorities are set in doc 08 as proposals.
