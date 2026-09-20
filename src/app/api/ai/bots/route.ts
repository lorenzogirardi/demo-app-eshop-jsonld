import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { KNOWN_BOTS } from "@/lib/bots";
import { getStore } from "@/lib/ai/store";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin token required" }, { status: 401 });
  }
  const visits = getStore().botVisits;
  const counts: Record<string, number> = {};
  for (const v of visits) counts[v.bot] = (counts[v.bot] ?? 0) + 1;
  return NextResponse.json({ known_bots: KNOWN_BOTS, counts, visits: visits.slice(0, 100) });
}
