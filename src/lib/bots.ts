import { getStore, saveStore } from "@/lib/ai/store";

export type BotKind = "search" | "user-agent" | "training";

/** Known AI crawlers/agents. `kind` drives the robots.txt policy. */
export const KNOWN_BOTS: Array<{ token: string; vendor: string; kind: BotKind; purpose: string }> = [
  { token: "OAI-SearchBot", vendor: "OpenAI", kind: "search", purpose: "Indexes pages for ChatGPT search" },
  { token: "ChatGPT-User", vendor: "OpenAI", kind: "user-agent", purpose: "Fetches a page when a ChatGPT user asks" },
  { token: "GPTBot", vendor: "OpenAI", kind: "training", purpose: "Collects content for model training" },
  { token: "Claude-SearchBot", vendor: "Anthropic", kind: "search", purpose: "Indexes pages for Claude search" },
  { token: "Claude-User", vendor: "Anthropic", kind: "user-agent", purpose: "Fetches a page when a Claude user asks" },
  { token: "ClaudeBot", vendor: "Anthropic", kind: "training", purpose: "Collects content for model training" },
  { token: "PerplexityBot", vendor: "Perplexity", kind: "search", purpose: "Indexes pages for Perplexity search" },
  { token: "Perplexity-User", vendor: "Perplexity", kind: "user-agent", purpose: "Fetches a page when a Perplexity user asks" },
  { token: "Google-Extended", vendor: "Google", kind: "training", purpose: "Controls use of content for Gemini training" },
  { token: "Applebot-Extended", vendor: "Apple", kind: "training", purpose: "Controls use of content for Apple AI training" },
  { token: "CCBot", vendor: "Common Crawl", kind: "training", purpose: "Open web crawl used by many models" },
];

export function detectBot(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  return KNOWN_BOTS.find((b) => ua.includes(b.token.toLowerCase()))?.token ?? null;
}

export function recordBotVisit(userAgent: string | null | undefined, path: string): void {
  const bot = detectBot(userAgent);
  if (!bot) return;
  const store = getStore();
  store.botVisits.unshift({
    at: new Date().toISOString(),
    bot,
    user_agent: (userAgent ?? "").slice(0, 200),
    path: path.slice(0, 200),
  });
  store.botVisits = store.botVisits.slice(0, 200);
  saveStore();
}
