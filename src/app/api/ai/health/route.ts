import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/ai/client";
import { isAIEnabled } from "@/lib/ai/config";

export async function GET() {
  if (!isAIEnabled()) {
    return NextResponse.json({
      status: "disabled",
      details: "AI features are disabled (AI_ENABLED=false)",
    });
  }

  const health = await checkHealth();
  return NextResponse.json(health, {
    status: health.status === "ok" ? 200 : 503,
  });
}
