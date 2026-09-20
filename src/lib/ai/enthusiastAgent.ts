import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { askAgent, enthusiastBackendEnabled } from "./client";

/** Enthusiast answers in Markdown; the shop UI shows plain text. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^[ \t]*\|?[ \t:|-]*-{3,}[ \t:|-]*\|?[ \t]*$/gm, "") // table separator rows
    .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_, row: string) =>
      row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(" — ")
    )
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)\*(?!\s)(.+?)\*(?=\s|$)/g, "$1$2")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * The agent answers in free text. Products are recovered by finding catalog names in the reply,
 * in order of appearance: only products that exist in the catalog can ever be shown, and their data
 * (price, image, description) is always read from the catalog, never from the agent's text.
 */
export function matchCatalogProducts<T extends { id: string; name: string }>(reply: string, catalog: T[]): T[] {
  const lower = reply.toLowerCase();
  const hits: Array<{ p: T; start: number; end: number }> = [];
  for (const p of catalog) {
    const name = p.name.toLowerCase();
    const start = lower.indexOf(name);
    if (start >= 0) hits.push({ p, start, end: start + name.length });
  }
  // A short name inside a longer matched name ("Handbag" in "Leather Handbag") is not a second product.
  return hits
    .filter((h) => !hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start))
    .sort((a, b) => a.start - b.start)
    .map((h) => h.p);
}

// --- Conversation references -------------------------------------------------------------------
// Enthusiast conversations are reached with one shared service token, so a raw conversation id from
// the browser would let anyone read or write other visitors' conversations. The id is signed instead.

const fallbackKey = randomBytes(32).toString("hex");

function signingKey(): string {
  return process.env.CHAT_SIGNING_SECRET || process.env.NEXTAUTH_SECRET || process.env.ADMIN_TOKEN || fallbackKey;
}

function sign(id: number): string {
  return createHmac("sha256", signingKey()).update(`conv:${id}`).digest("base64url").slice(0, 22);
}

export function makeConversationRef(id: number): string {
  return `${id}.${sign(id)}`;
}

export function parseConversationRef(ref: unknown): number | null {
  if (typeof ref !== "string") return null;
  const [rawId, sig] = ref.split(".");
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0 || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

export { enthusiastBackendEnabled };

export interface EnthusiastTurn {
  reply: string;
  conversationRef: string;
  agent: { name: string; type: string };
}

/** One customer message to the Enthusiast agent; `ref` continues an earlier conversation. */
export async function enthusiastTurn(message: string, ref?: unknown): Promise<EnthusiastTurn> {
  const conversationId = parseConversationRef(ref) ?? undefined;
  const answer = await askAgent(message, { conversationId });
  return {
    reply: stripMarkdown(answer.reply),
    conversationRef: makeConversationRef(answer.conversationId),
    agent: { name: answer.agent.name, type: answer.agent.agent_type },
  };
}
