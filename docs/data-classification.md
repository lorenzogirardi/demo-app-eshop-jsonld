# Data Classification — AI Integration

## Classification Levels

| Level | Description | handling |
|---|---|---|
| PUBLIC | Data visible to all users | Can be sent to LLM, indexed, cached |
| INTERNAL | Data for internal use only | Never send to external LLM |
| CONFIDENTIAL | Sensitive business data | Never leave the system |
| RESTRICTED | PII, payment, auth credentials | Never send anywhere, never log |

## Product Data Classification

| Field | Level | Rationale | AI Usage |
|---|---|---|---|
| `id` | PUBLIC | Sequential string, no sensitive info | ✅ Can index |
| `name` | PUBLIC | Product display name | ✅ Can index, embed |
| `description` | PUBLIC | Product description | ✅ Can index, embed, enrich |
| `price` | PUBLIC | Display price in cents | ✅ Can index, but always re-verify from source |
| `imageUrl` | PUBLIC | Public Unsplash URL | ✅ Can index |
| `createdAt` | INTERNAL | Business metadata | ❌ Do not send to LLM |
| `updatedAt` | INTERNAL | Business metadata | ❌ Do not send to LLM |

## User Data Classification

| Field | Level | Rationale | AI Usage |
|---|---|---|---|
| User session | RESTRICTED | Auth token | ❌ Never send |
| Cart contents | INTERNAL | Business data | ❌ Never send to LLM |
| Search queries | PUBLIC | User input for search | ✅ Can send for AI search (sanitized) |

## System Data Classification

| Field | Level | Rationale | AI Usage |
|---|---|---|---|
| API keys | RESTRICTED | Secrets | ❌ Never in prompts or logs |
| Database URLs | RESTRICTED | Infrastructure | ❌ Never expose |
| Enthusiast tokens | CONFIDENTIAL | Internal auth | ❌ Never in prompts |
| Feature flags | INTERNAL | Config | ❌ Never in prompts |

## Rules

1. **Only PUBLIC product data** may be sent to LLM providers
2. **Price is always re-verified** from mock DB before display — never trust LLM output for price
3. **No PII** in any AI interaction
4. **Search queries are sanitized** before sending to LLM (strip HTML, scripts, control chars)
5. **All AI responses are marked** as "AI-generated suggestion" with disclaimer
6. **Audit log** records all AI interactions with correlation IDs
