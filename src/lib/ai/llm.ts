export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function hasLLM(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}

export function llmModel(): string {
  return process.env.AI_SEARCH_MODEL || "~deepseek/deepseek-v4-flash-latest";
}

/**
 * Calls the chat model and parses a JSON object out of the reply.
 * Reasoning is disabled: it makes DeepSeek several times slower and we only need a structured answer.
 */
export async function chatJSON<T = Record<string, unknown>>(
  messages: ChatMessage[],
  opts: { timeoutMs?: number; maxTokens?: number; temperature?: number } = {}
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("LLM api key missing");

  const res = await fetch(
    `${process.env.OPENROUTER_API_BASE || "https://openrouter.ai/api/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: llmModel(),
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? parseInt(process.env.LLM_MAX_TOKENS || "2048"),
        response_format: { type: "json_object" },
        reasoning: { enabled: false },
        messages,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 45000),
    }
  );
  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);

  const content: string = (await res.json()).choices?.[0]?.message?.content ?? "";
  return JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, "")) as T;
}
