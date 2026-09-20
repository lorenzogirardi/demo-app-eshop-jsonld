import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_LIMIT, searchProducts } from "@/lib/agentApi";
import { recordBotVisit } from "@/lib/bots";

const Query = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(40).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 400, headers: CORS }
    );
  }
  recordBotVisit(request.headers.get("user-agent"), "/api/products");
  const result = await searchProducts(parsed.data);
  return NextResponse.json(
    { ...result, limit: parsed.data.limit ?? 10, offset: parsed.data.offset ?? 0 },
    { headers: CORS }
  );
}
