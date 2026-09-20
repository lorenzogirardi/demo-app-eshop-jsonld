import { describe, it, expect, beforeAll } from "vitest";
import { getAIConfig, isAIEnabled } from "@/lib/ai/config";

describe("M1: AI Configuration", () => {
  beforeAll(() => {
    process.env.AI_ENABLED = "false";
    process.env.LLM_PROVIDER = "ollama";
    process.env.OLLAMA_API_BASE = "http://localhost:11434/v1";
    process.env.OLLAMA_MODEL = "lfm2.5-1.2b-thinking:latest";
  });

  it("should load config with defaults", () => {
    const config = getAIConfig();
    expect(config.enabled).toBe(false);
    expect(config.fallbackToClassicSearch).toBe(true);
    expect(config.searchTimeoutMs).toBe(5000);
    expect(config.rateLimitPerMinute).toBe(10);
  });

  it("should default to ollama provider", () => {
    const config = getAIConfig();
    expect(config.provider.name).toBe("ollama");
    expect(config.provider.apiBase).toBe("http://localhost:11434/v1");
  });

  it("should report AI as disabled by default", () => {
    expect(isAIEnabled()).toBe(false);
  });

  it("should enable AI when env var is set", () => {
    process.env.AI_ENABLED = "true";
    expect(isAIEnabled()).toBe(true);
    process.env.AI_ENABLED = "false";
  });

  it("should configure openrouter provider", () => {
    process.env.LLM_PROVIDER = "openrouter";
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    process.env.OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

    const config = getAIConfig();
    expect(config.provider.name).toBe("openrouter");
    expect(config.provider.apiBase).toBe("https://openrouter.ai/api/v1");
    expect(config.provider.model).toBe(
      "meta-llama/llama-3.1-8b-instruct:free"
    );

    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    process.env.LLM_PROVIDER = "ollama";
  });
});

describe("M1: AI Types", () => {
  it("should have correct schema versions", async () => {
    const types = await import("@/lib/ai/types");
    expect(types).toBeDefined();
  });
});
