import { NextResponse } from "next/server";
import { mockPrisma } from "@/lib/db/mock-db";
import { toAgentProduct } from "@/lib/agentApi";
import { STORE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = (await mockPrisma.product.findMany()).map(toAgentProduct);
  return NextResponse.json(
    { store: STORE_NAME, url: absoluteUrl("/"), generated_at: new Date().toISOString(), count: products.length, products },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
