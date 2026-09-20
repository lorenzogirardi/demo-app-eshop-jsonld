# Threat Model — AI Integration

## STRIDE Analysis

### Spoofing
| Threat | Mitigation |
|---|---|
| Attacker impersonates Node.js backend to Enthusiast | Token-based auth (ENTHUSIAST_TOKEN) on internal network |
| Attacker impersonates Enthusiast to Node.js | Enthusiast runs on Docker internal network, not exposed publicly |

### Tampering
| Threat | Mitigation |
|---|---|
| Prompt injection via user search query | Sanitize input: strip HTML, scripts, control chars; max 500 chars |
| LLM returns manipulated product data | Always re-verify price/stock from mock DB; never trust LLM output for critical fields |
| Malicious catalog content injected into Enthusiast | Only ingest from trusted source (our mock DB); validate schema on ingestion |

### Repudiation
| Threat | Mitigation |
|---|---|
| AI gives wrong product advice, no audit trail | Log all AI interactions with correlation ID, timestamp, query, response |
| Admin approves bad enrichment | Audit trail: who approved, when, what changed |

### Information Disclosure
| Threat | Mitigation |
|---|---|
| LLM leaks internal data in responses | Only PUBLIC data in prompts; no internal IDs, URLs, or system info |
| LLM provider logs our data | Use self-hosted Ollama for development; review OpenRouter data policy for production |
| Search queries reveal user intent to third party | Sanitize queries; consider anonymization for external providers |

### Denial of Service
| Threat | Mitigation |
|---|---|
| Flooding AI search endpoint | Rate limit: 10 req/min per IP |
| Enthusiast unavailable → cascading failure | Feature flag (AI_ENABLED=false by default); circuit breaker; fallback to classic search |
| LLM timeout blocks requests | Timeout 5s for search, 60s for enrichment; async for long operations |

### Elevation of Privilege
| Threat | Mitigation |
|---|---|
| User accesses admin enrichment endpoint | Admin-only auth check on `/api/ai/enrich` |
| User triggers catalog sync | Sync endpoints protected by internal token only |

## Prompt Injection Defenses

1. **Input sanitization**: Strip `<script>`, HTML tags, control characters, max 500 chars
2. **System prompt hardening**: Clear instructions to only answer product-related questions
3. **Output validation**: Check response format matches expected schema
4. **Grounding verification**: Cross-reference LLM output against actual product data
5. **Content filtering**: Reject queries containing injection patterns (ignore previous instructions, you are now, etc.)

## Data Flow Security

```
User Query → [Sanitize] → [Rate Limit] → Node.js → [Token Auth] → Enthusiast → LLM
                                                                                    ↓
User ← [Mark as AI] ← [Re-verify prices] ← Node.js ← [Grounding check] ← Response
```

## Secrets Management

| Secret | Storage | Access |
|---|---|---|
| OPENROUTER_API_KEY | .env (local), K8s secret (prod) | Backend only, never in browser |
| ENTHUSIAST_TOKEN | .env (local), K8s secret (prod) | Backend only |
| NEXTAUTH_SECRET | .env (local), K8s secret (prod) | NextAuth only |

## Kill Switch

Feature flag `AI_ENABLED=false` disables all AI features instantly. The app continues to function with classic search. This can be toggled at runtime via env var without redeployment (requires pod restart in K8s).
