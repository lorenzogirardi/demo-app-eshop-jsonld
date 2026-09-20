import { NextResponse } from "next/server";
import { getAgentProduct } from "@/lib/agentApi";
import { recordBotVisit } from "@/lib/bots";

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const product = await getAgentProduct(params.id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404, headers: CORS });
  recordBotVisit(request.headers.get("user-agent"), `/api/products/${params.id}`);
  return NextResponse.json(product, { headers: CORS });
}
