import { describe, it, expect } from "vitest";
import { buildCartPreview, getAgentProduct, parseItemsParam, searchProducts } from "@/lib/agentApi";
import { GET as listProducts } from "@/app/api/products/route";
import { POST as cartPreview } from "@/app/api/cart/preview/route";
import { POST as mcp, GET as mcpGet } from "@/app/api/mcp/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as feedXml } from "@/app/feed/products.xml/route";
import { GET as openapi } from "@/app/openapi.json/route";

const rpc = (body: unknown, headers: Record<string, string> = {}) =>
  mcp(new Request("http://localhost/api/mcp", { method: "POST", body: JSON.stringify(body), headers }));

describe("agent API", () => {
  it("searches by words, category and price in GBP", async () => {
    const evening = await searchProducts({ q: "evening bag" });
    expect(evening.products[0].name).toBe("Metallic Evening Bag");

    const cheap = await searchProducts({ category: "Bags", max_price: 1000 });
    expect(cheap.products.length).toBeGreaterThan(0);
    cheap.products.forEach((p) => {
      expect(p.categories).toContain("Bags");
      expect(p.price).toBeLessThanOrEqual(1000);
    });
    expect((await searchProducts({ q: "zzzz-nothing" })).total).toBe(0);
  });

  it("prices carts from the catalog and never trusts the caller", async () => {
    const p = (await getAgentProduct("1"))!;
    const preview = await buildCartPreview([
      { product_id: "1", quantity: 2 },
      { product_id: "1", quantity: 1 },
      { product_id: "nope", quantity: 1 },
      { product_id: "2", quantity: 99 },
    ]);
    expect(preview.items).toHaveLength(1);
    expect(preview.items[0].quantity).toBe(3);
    expect(preview.subtotal).toBeCloseTo(p.price * 3, 2);
    expect(preview.errors.join(" ")).toContain("nope");
    expect(preview.errors.join(" ")).toContain("Quantity");
    expect(preview.requires_customer_confirmation).toBe(true);
    expect(preview.handoff_url).toContain("/cart/handoff?items=");
  });

  it("parses the handoff items parameter defensively", () => {
    expect(parseItemsParam("1:2,3:1")).toEqual([
      { product_id: "1", quantity: 2 },
      { product_id: "3", quantity: 1 },
    ]);
    expect(parseItemsParam("1:abc,:2")).toEqual([]);
    expect(parseItemsParam(null)).toEqual([]);
  });

  it("REST: validates input", async () => {
    const bad = await listProducts(new Request("http://localhost/api/products?limit=9999"));
    expect(bad.status).toBe(400);
    const good = await listProducts(new Request("http://localhost/api/products?q=watch&limit=3"));
    expect((await good.json()).products.length).toBeLessThanOrEqual(3);

    const cart = await cartPreview(
      new Request("http://localhost/api/cart/preview", { method: "POST", body: JSON.stringify({ items: [{ product_id: "1", quantity: 0 }] }) })
    );
    expect(cart.status).toBe(400);
  });
});

describe("MCP server", () => {
  it("initializes, lists tools and calls them", async () => {
    const init = await (await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } })).json();
    expect(init.result.protocolVersion).toBe("2025-03-26");
    expect(init.result.capabilities.tools).toBeDefined();

    const tools = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json();
    expect(tools.result.tools.map((t: any) => t.name)).toEqual(["search_products", "get_product", "build_cart"]);

    const found = await (
      await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_products", arguments: { query: "evening bag" } } })
    ).json();
    expect(found.result.structuredContent.products[0].name).toBe("Metallic Evening Bag");

    const cart = await (
      await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "build_cart", arguments: { items: [{ product_id: "15", quantity: 1 }] } } })
    ).json();
    expect(cart.result.structuredContent.requires_customer_confirmation).toBe(true);
  });

  it("reports bad arguments as tool errors and unknown methods as JSON-RPC errors", async () => {
    const badArgs = await (
      await rpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "get_product", arguments: {} } })
    ).json();
    expect(badArgs.result.isError).toBe(true);

    const unknown = await (await rpc({ jsonrpc: "2.0", id: 6, method: "nope" })).json();
    expect(unknown.error.code).toBe(-32601);
    const tool = await (await rpc({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "delete_everything" } })).json();
    expect(tool.error.code).toBe(-32602);
  });

  it("accepts notifications without a body, refuses foreign origins and GET", async () => {
    expect((await rpc({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    expect((await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await mcpGet()).status).toBe(405);
  });
});

describe("discovery files", () => {
  it("robots: keeps private paths closed and repeats them for every bot group", () => {
    const rules: any[] = robots().rules as any[];
    const star = rules.find((r) => r.userAgent === "*");
    expect(star.disallow).toEqual(expect.arrayContaining(["/admin", "/api/", "/api/products/dump"]));
    expect(star.allow).toEqual(expect.arrayContaining(["/api/mcp", "/api/products"]));
    const oai = rules.find((r) => r.userAgent === "OAI-SearchBot");
    expect(oai.disallow).toContain("/admin");
    expect(robots().sitemap).toMatch(/sitemap\.xml$/);
  });

  it("robots: training bots can be opted out with AI_TRAINING_BOTS", () => {
    process.env.AI_TRAINING_BOTS = "disallow";
    const rules: any[] = robots().rules as any[];
    expect(rules.find((r) => r.userAgent === "GPTBot").disallow).toBe("/");
    expect(rules.find((r) => r.userAgent === "OAI-SearchBot").allow).toBeDefined();
    delete process.env.AI_TRAINING_BOTS;
  });

  it("sitemap lists every product; llms.txt, feed and openapi respond", async () => {
    expect((await sitemap()).length).toBeGreaterThan(90);
    expect(await (llms() as Response).text()).toContain("/openapi.json");
    const xml = await (await feedXml()).text();
    expect(xml).toContain("<g:price>");
    expect(xml).toContain("xmlns:g=");
    const spec = await (openapi() as any).json();
    expect(Object.keys(spec.paths)).toEqual(["/api/products", "/api/products/{id}", "/api/cart/preview"]);
  });
});
