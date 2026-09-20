import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  MAX_LIMIT,
  buildCartPreview,
  getAgentProduct,
  searchProducts,
} from "@/lib/agentApi";
import { recordBotVisit } from "@/lib/bots";
import { STORE_NAME, siteUrl } from "@/lib/site";

/**
 * Minimal MCP server (JSON-RPC 2.0 over HTTP POST, "streamable HTTP" without SSE).
 * Read-only tools plus a cart preview: it never creates orders or takes payment.
 */
const SUPPORTED_PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const TOOLS = [
  {
    name: "search_products",
    description:
      "Search the shop catalog by free text, category and price range (GBP). Returns products with id, price and url.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text such as 'evening bag' or 'leather watch'" },
        category: { type: "string", description: "One category, e.g. Bags, Watches, Shoes, Scarves, Sunglasses, Belts" },
        min_price: { type: "number", description: "Minimum price in GBP" },
        max_price: { type: "number", description: "Maximum price in GBP" },
        limit: { type: "integer", minimum: 1, maximum: MAX_LIMIT, default: 10 },
      },
    },
  },
  {
    name: "get_product",
    description: "Get one product by id, with description, price, categories and availability.",
    inputSchema: {
      type: "object",
      properties: { product_id: { type: "string" } },
      required: ["product_id"],
    },
  },
  {
    name: "build_cart",
    description:
      "Price a cart. Returns line totals, subtotal and a handoff_url the customer must open to review and confirm. Nothing is purchased by this call.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          maxItems: MAX_CART_LINES,
          items: {
            type: "object",
            properties: {
              product_id: { type: "string" },
              quantity: { type: "integer", minimum: 1, maximum: MAX_LINE_QUANTITY },
            },
            required: ["product_id", "quantity"],
          },
        },
      },
      required: ["items"],
    },
  },
];

const SearchArgs = z.object({
  query: z.string().max(200).optional(),
  category: z.string().max(40).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});
const GetArgs = z.object({ product_id: z.string().min(1).max(20) });
const CartArgs = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1).max(20),
        quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
      })
    )
    .min(1)
    .max(MAX_CART_LINES),
});

type RpcId = string | number | null;
const ok = (id: RpcId, result: unknown) => ({ jsonrpc: "2.0", id, result });
const fail = (id: RpcId, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
const toolText = (data: unknown, isError = false) => ({
  content: [{ type: "text", text: JSON.stringify(data) }],
  structuredContent: isError ? undefined : data,
  isError,
});

async function callTool(name: string, args: unknown) {
  switch (name) {
    case "search_products": {
      const a = SearchArgs.parse(args ?? {});
      const r = await searchProducts({
        q: a.query,
        category: a.category,
        min_price: a.min_price,
        max_price: a.max_price,
        limit: a.limit,
      });
      return toolText(r);
    }
    case "get_product": {
      const a = GetArgs.parse(args ?? {});
      const p = await getAgentProduct(a.product_id);
      return p ? toolText(p) : toolText({ error: `Product ${a.product_id} not found` }, true);
    }
    case "build_cart": {
      const a = CartArgs.parse(args ?? {});
      return toolText(await buildCartPreview(a.items));
    }
    default:
      return null;
  }
}

async function handle(msg: any) {
  const id: RpcId = msg?.id ?? null;
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return fail(id, -32600, "Invalid Request");
  }
  // Notifications have no id and get no response.
  const isNotification = msg.id === undefined;

  switch (msg.method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      return ok(id, {
        protocolVersion: SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: `${STORE_NAME} shop`, version: "1.0.0" },
        instructions:
          "Search and read the catalog, then use build_cart to price a basket. Never claim a purchase was made: the customer confirms through handoff_url.",
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      try {
        const result = await callTool(msg.params?.name, msg.params?.arguments);
        return result ? ok(id, result) : fail(id, -32602, `Unknown tool: ${msg.params?.name}`);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return ok(id, toolText({ error: "Invalid arguments", details: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, true));
        }
        return fail(id, -32603, "Internal error");
      }
    }
    default:
      return isNotification ? null : fail(id, -32601, `Method not found: ${msg.method}`);
  }
}

function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === siteUrl();
}

export async function POST(request: Request) {
  // Non-browser agents send no Origin; a foreign browser origin is refused (DNS-rebinding guard).
  if (!originAllowed(request)) {
    return NextResponse.json(fail(null, -32000, "Origin not allowed"), { status: 403 });
  }
  recordBotVisit(request.headers.get("user-agent"), "/api/mcp");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error"), { status: 400 });
  }

  if (Array.isArray(body)) {
    if (body.length === 0 || body.length > 20) {
      return NextResponse.json(fail(null, -32600, "Invalid Request"), { status: 400 });
    }
    const responses = (await Promise.all(body.map(handle))).filter((r) => r !== null);
    return responses.length ? NextResponse.json(responses) : new NextResponse(null, { status: 202 });
  }

  const response = await handle(body);
  return response ? NextResponse.json(response) : new NextResponse(null, { status: 202 });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
