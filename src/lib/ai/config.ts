import { z } from "zod";

const LLMProviderSchema = z.object({
  name: z.string(),
  apiBase: z.string().url(),
  apiKey: z.string().optional(),
  model: z.string(),
  embeddingModel: z.string().optional(),
  maxTokens: z.number().default(2048),
  temperature: z.number().min(0).max(2).default(0.7),
  timeoutMs: z.number().default(30000),
});

export type LLMProvider = z.infer<typeof LLMProviderSchema>;

const AIConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: LLMProviderSchema,
  fallbackToClassicSearch: z.boolean().default(true),
  searchTimeoutMs: z.number().default(5000),
  rateLimitPerMinute: z.number().default(10),
  enthusiastUrl: z.string().url().default("http://localhost:10000"),
  enthusiastToken: z.string().default(""),
  /** "enthusiast": search and chat go through the Enthusiast agent first; "direct": straight to the LLM API. */
  backend: z.enum(["enthusiast", "direct"]).default("direct"),
  enthusiastAgentId: z.number().int().optional(),
  enthusiastDatasetId: z.number().int().optional(),
  agentTimeoutMs: z.number().default(45000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

function getProvider(): LLMProvider {
  const providerName = process.env.LLM_PROVIDER || "ollama";

  if (providerName === "openrouter") {
    return {
      name: "openrouter",
      apiBase: process.env.OPENROUTER_API_BASE || "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2048"),
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
      timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || "30000"),
    };
  }

  // Default: Ollama local
  return {
    name: "ollama",
    apiBase: process.env.OLLAMA_API_BASE || "http://localhost:11434/v1",
    apiKey: "ollama",
    model: process.env.OLLAMA_MODEL || "lfm2.5-1.2b-thinking:latest",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "",
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2048"),
    temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || "60000"),
  };
}

export function getAIConfig(): AIConfig {
  const config: AIConfig = {
    enabled: process.env.AI_ENABLED === "true",
    provider: getProvider(),
    fallbackToClassicSearch: process.env.AI_FALLBACK !== "false",
    searchTimeoutMs: parseInt(process.env.AI_SEARCH_TIMEOUT_MS || "5000"),
    rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT || "10"),
    enthusiastUrl: process.env.ENTHUSIAST_URL || "http://localhost:10000",
    enthusiastToken: process.env.ENTHUSIAST_TOKEN || "",
    backend: process.env.AI_BACKEND === "enthusiast" ? "enthusiast" : "direct",
    enthusiastDatasetId: process.env.ENTHUSIAST_DATASET_ID ? parseInt(process.env.ENTHUSIAST_DATASET_ID) : undefined,
    enthusiastAgentId: process.env.ENTHUSIAST_AGENT_ID ? parseInt(process.env.ENTHUSIAST_AGENT_ID) : undefined,
    agentTimeoutMs: parseInt(process.env.ENTHUSIAST_TIMEOUT_MS || "45000"),
    logLevel: (process.env.AI_LOG_LEVEL as AIConfig["logLevel"]) || "info",
  };

  return AIConfigSchema.parse(config);
}

export function isAIEnabled(): boolean {
  return process.env.AI_ENABLED === "true";
}
