import { mockPrisma } from "@/lib/db/mock-db";
import { toAgentProduct } from "@/lib/agentApi";
import { STORE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = (await mockPrisma.product.findMany()).map(toAgentProduct);
  const lines = products.map(
    (p) => `- [${p.name}](${p.url}) | id ${p.id} | ${p.currency} ${p.price.toFixed(2)} | ${p.categories.join(", ")}\n  ${p.description}`
  );
  const body = `# ${STORE_NAME}: full catalog\n\n${products.length} products. Prices in GBP.\n\n${lines.join("\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
