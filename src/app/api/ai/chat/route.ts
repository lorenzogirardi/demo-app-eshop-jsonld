import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAIEnabled } from "@/lib/ai/config";
import { assistantChat, validateTurns } from "@/lib/ai/chat";

export async function POST(request: Request) {
  if (!isAIEnabled()) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const turns = validateTurns(body);
    if (turns[turns.length - 1].role !== "user") {
      return NextResponse.json({ error: "Last message must come from the user" }, { status: 400 });
    }
    return NextResponse.json(await assistantChat(turns, (body as { conversation_ref?: unknown })?.conversation_ref));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Assistant failed" }, { status: 500 });
  }
}
