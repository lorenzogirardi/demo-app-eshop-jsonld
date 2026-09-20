import { STORE_NAME, absoluteUrl } from "@/lib/site";
import { ALL_CATEGORIES } from "@/lib/ai/categories";

export const dynamic = "force-dynamic";

export function GET() {
  const body = `# ${STORE_NAME}

> Online shop for clothing and accessories: ${ALL_CATEGORIES.filter((c) => c !== "Footwear" && c !== "Eyewear" && c !== "Accessories").join(", ").toLowerCase()}. Prices are in GBP. Product pages carry schema.org JSON-LD.

## Catalog
- [Full catalog in Markdown](${absoluteUrl("/llms-full.txt")}): every product with id, price and link
- [Sitemap](${absoluteUrl("/sitemap.xml")}): all product pages
- [Product feed, JSON](${absoluteUrl("/feed/products.json")}): the whole catalog as structured data
- [Product feed, XML](${absoluteUrl("/feed/products.xml")}): same catalog in Google Merchant RSS format

## For agents
- [OpenAPI description](${absoluteUrl("/openapi.json")}): search products, read a product, price a cart
- [MCP server](${absoluteUrl("/api/mcp")}): the same tools over Model Context Protocol (POST, JSON-RPC)

## Notes
- Search: ${absoluteUrl("/search")}?query=<text> (add &ai=true for the AI-assisted search)
- A cart preview never creates an order. The customer opens the returned handoff link, reviews and confirms.
- Availability and shipping terms are shown on the product and cart pages; verify prices before purchasing.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
