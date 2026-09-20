import { mockPrisma } from "@/lib/db/mock-db";
import { toAgentProduct } from "@/lib/agentApi";
import { STORE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Google Merchant Center style RSS 2.0 feed. */
export async function GET() {
  const brand = process.env.STORE_BRAND;
  const items = (await mockPrisma.product.findMany()).map(toAgentProduct).map(
    (p) => `    <item>
      <g:id>${esc(p.sku)}</g:id>
      <title>${esc(p.name)}</title>
      <description>${esc(p.description)}</description>
      <link>${esc(p.url)}</link>
      <g:image_link>${esc(p.image_url)}</g:image_link>
      <g:availability>${p.in_stock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${p.price.toFixed(2)} ${p.currency}</g:price>
      <g:condition>new</g:condition>
      <g:product_type>${esc(p.categories.join(" > "))}</g:product_type>
      ${brand ? `<g:brand>${esc(brand)}</g:brand>` : "<g:identifier_exists>no</g:identifier_exists>"}
    </item>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(STORE_NAME)}</title>
    <link>${esc(absoluteUrl("/"))}</link>
    <description>Product feed</description>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
