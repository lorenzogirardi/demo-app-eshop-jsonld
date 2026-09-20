import { z } from "zod";

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /system\s*:\s*/i,
  /override\s+(all\s+)?(safety|content|filter)/i,
  /jailbreak/i,
  /developer\s+mode/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(if|a|an)/i,
  /bypass\s+(all\s+)?(filter|restriction|limit)/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\{\{system\}\}/i,
];

const FORBIDDEN_CONTENT = [
  /password/i,
  /secret/i,
  /api[_\s]?key/i,
  /token/i,
  /credit[_\s]?card/i,
  /ssn/i,
  /social[_\s]?security/i,
];

export const SearchQuerySchema = z
  .string()
  .min(1, "Query cannot be empty")
  .max(500, "Query too long (max 500 characters)")
  .refine(
    (val) => !INJECTION_PATTERNS.some((p) => p.test(val)),
    "Query contains potentially unsafe content"
  )
  .refine(
    (val) => !FORBIDDEN_CONTENT.some((p) => p.test(val)),
    "Query contains sensitive information"
  );

export const AISearchRequestSchema = z.object({
  query: SearchQuerySchema,
  filters: z
    .object({
      categories: z.array(z.string()).optional(),
      price_min: z.number().min(0).optional(),
      price_max: z.number().min(0).optional(),
    })
    .optional(),
  options: z
    .object({
      max_results: z.number().min(1).max(50).default(10),
      timeout_ms: z.number().min(1000).max(30000).default(5000),
      include_ai_answer: z.boolean().default(true),
    })
    .optional(),
});

export type ValidatedSearchRequest = z.infer<typeof AISearchRequestSchema>;

export function sanitizeQuery(query: string): string {
  return query
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\w\s?!,.\-€£$¥%+@&()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
