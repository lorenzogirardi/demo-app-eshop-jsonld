"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatProduct {
  id: string;
  name: string;
  price_formatted: string;
  image_url: string;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
  reasons?: Record<string, string>;
  quickReplies?: string[];
}

const STORAGE_KEY = "assistant-chat-v1";
const GREETING: Turn = {
  role: "assistant",
  content:
    "Hi, I'm the shopping assistant. Tell me what you're looking for, or how you'll use it, and I'll narrow it down.",
  quickReplies: ["A gift", "Something for the evening", "A bag for work"],
};

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convRef, setConvRef] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setTurns(JSON.parse(saved));
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    } catch {
      /* storage unavailable */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setInput("");
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The greeting is UI copy, not conversation.
          messages: next
            .filter((t) => t !== GREETING)
            .slice(-12)
            .map((t) => ({ role: t.role, content: t.content })),
          ...(convRef ? { conversation_ref: convRef } : {}),
        }),
      });
      if (res.status === 429) throw new Error("Too many requests, wait a minute and try again.");
      if (!res.ok) throw new Error("The assistant could not answer. Try rephrasing.");
      const data = await res.json();
      setConvRef(data.conversation_ref ?? null);
      setTurns([
        ...next,
        {
          role: "assistant",
          content: data.reply,
          products: data.products,
          reasons: data.reasons,
          quickReplies: data.quick_replies,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function reset() {
    setTurns([GREETING]);
    setConvRef(null);
    setError(null);
  }

  const lastAssistant = [...turns].reverse().find((t) => t.role === "assistant");
  const showChips = !busy && turns[turns.length - 1]?.role === "assistant";

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="btn btn-primary fixed bottom-4 right-4 z-40 shadow-lg"
        aria-expanded={open}
        aria-controls="assistant-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close assistant" : "Ask the assistant"}
      </button>

      {open && (
        <section
          id="assistant-panel"
          role="dialog"
          aria-label="Shopping assistant"
          className="fixed bottom-20 right-4 z-40 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-md flex-col rounded-xl border border-base-300 bg-base-100 shadow-2xl"
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <header className="flex items-center justify-between border-b border-base-300 px-4 py-2">
            <h2 className="font-bold">Shopping assistant</h2>
            <button type="button" className="btn btn-ghost btn-xs" onClick={reset}>
              New chat
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "text-right" : ""}>
                <p
                  className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm ${
                    t.role === "user" ? "bg-primary text-primary-content" : "bg-base-200"
                  }`}
                >
                  {t.content}
                </p>
                {t.products && t.products.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {t.products.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.id}`}
                          className="flex gap-3 rounded-lg border border-base-300 p-2 text-left hover:bg-base-200"
                        >
                          <Image
                            unoptimized
                            src={p.image_url}
                            alt=""
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded object-cover"
                          />
                          <span className="text-sm">
                            <span className="block font-semibold">
                              {p.name} <span className="font-normal">· {p.price_formatted}</span>
                            </span>
                            {t.reasons?.[p.id] && (
                              <span className="block text-xs opacity-70">{t.reasons[p.id]}</span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {busy && (
              <p className="inline-block rounded-lg bg-base-200 px-3 py-2 text-sm" role="status">
                <span className="loading loading-dots loading-xs" aria-hidden="true" /> Thinking…
              </p>
            )}
            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}
          </div>

          {showChips && lastAssistant?.quickReplies && lastAssistant.quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {lastAssistant.quickReplies.map((q) => (
                <button key={q} type="button" className="btn btn-outline btn-xs" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-base-300 p-3">
            <label htmlFor="assistant-input" className="sr-only">
              Your message
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. a gift for my father"
              className="input input-bordered input-sm flex-1"
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
          <p className="px-4 pb-2 text-xs opacity-60">AI suggestions. Verify prices before purchasing.</p>
        </section>
      )}
    </>
  );
}
