import type { Product } from "@prisma/client";
import { mockPrisma } from "@/lib/db/mock-db";
import { deriveCategories, deriveSku } from "@/lib/ai/categories";
import { STORE_CURRENCY, absoluteUrl } from "@/lib/site";

/** Product as agents see it: prices in GBP (not pence), absolute URLs. */
export interface AgentProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categories: string[];
  image_url: string;
  url: string;
  in_stock: boolean;
}

export function toAgentProduct(p: Product): AgentProduct {
  return {
    id: p.id,
    sku: deriveSku(p),
    name: p.name,
    description: p.description,
    price: Math.round(p.price) / 100,
    currency: STORE_CURRENCY,
    categories: deriveCategories(p),
    image_url: p.imageUrl,
    url: absoluteUrl(`/products/${p.id}`),
    // The demo catalog has no stock data: every listed product is treated as available.
    in_stock: true,
  };
}

export interface SearchParams {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export const MAX_LIMIT = 50;

/** Word-based match (name counts double), so "evening bag" finds "Metallic Evening Bag". */
export async function searchProducts(params: SearchParams): Promise<{ total: number; products: AgentProduct[] }> {
  const all = await mockPrisma.product.findMany();
  const words = (params.q ?? "")
    .toLowerCase()
    .split(/[^a-z0-9£]+/)
    .filter((w) => w.length > 1);
  const category = params.category?.toLowerCase();

  const scored = all
    .map((p) => {
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      const cats = deriveCategories(p).map((c) => c.toLowerCase());
      const score = words.reduce(
        (s, w) => s + (name.includes(w) ? 2 : 0) + (desc.includes(w) ? 1 : 0) + (cats.some((c) => c.includes(w)) ? 1 : 0),
        0
      );
      return { p, score, cats };
    })
    .filter(({ p, score, cats }) => {
      if (words.length > 0 && score === 0) return false;
      if (category && !cats.some((c) => c === category)) return false;
      const price = p.price / 100;
      if (params.min_price !== undefined && price < params.min_price) return false;
      if (params.max_price !== undefined && price > params.max_price) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || Number(a.p.id) - Number(b.p.id));

  const limit = Math.min(Math.max(params.limit ?? 10, 1), MAX_LIMIT);
  const offset = Math.max(params.offset ?? 0, 0);
  return {
    total: scored.length,
    products: scored.slice(offset, offset + limit).map(({ p }) => toAgentProduct(p)),
  };
}

export async function getAgentProduct(id: string): Promise<AgentProduct | null> {
  const p = await mockPrisma.product.findUnique({ where: { id } });
  return p ? toAgentProduct(p) : null;
}

export const MAX_CART_LINES = 10;
export const MAX_LINE_QUANTITY = 10;

export interface CartLineInput {
  product_id: string;
  quantity: number;
}

export function parseItemsParam(raw: string | null | undefined): CartLineInput[] {
  if (!raw) return [];
  return raw
    .split(",")
    .slice(0, MAX_CART_LINES)
    .map((part) => {
      const [product_id, qty] = part.split(":");
      return { product_id: (product_id ?? "").trim(), quantity: parseInt(qty ?? "1", 10) };
    })
    .filter((l) => l.product_id && Number.isInteger(l.quantity));
}

export function itemsParam(lines: CartLineInput[]): string {
  return lines.map((l) => `${l.product_id}:${l.quantity}`).join(",");
}

/**
 * Prices the cart from the catalog. The caller never supplies a price: totals always come from here.
 * Nothing is stored; the customer confirms and pays on the shop's own pages (handoff_url).
 */
export async function buildCartPreview(lines: CartLineInput[]) {
  const errors: string[] = [];
  const merged = new Map<string, number>();
  for (const l of lines.slice(0, MAX_CART_LINES)) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > MAX_LINE_QUANTITY) {
      errors.push(`Quantity for product ${l.product_id} must be between 1 and ${MAX_LINE_QUANTITY}.`);
      continue;
    }
    merged.set(l.product_id, Math.min((merged.get(l.product_id) ?? 0) + l.quantity, MAX_LINE_QUANTITY));
  }

  const items: Array<{ product: AgentProduct; quantity: number; line_total: number }> = [];
  const valid: CartLineInput[] = [];
  for (const [id, quantity] of Array.from(merged.entries())) {
    const product = await getAgentProduct(id);
    if (!product) {
      errors.push(`Product ${id} not found.`);
      continue;
    }
    items.push({ product, quantity, line_total: Math.round(product.price * quantity * 100) / 100 });
    valid.push({ product_id: id, quantity });
  }

  const subtotal = Math.round(items.reduce((s, i) => s + i.line_total, 0) * 100) / 100;
  return {
    currency: STORE_CURRENCY,
    items,
    subtotal,
    errors,
    requires_customer_confirmation: true,
    handoff_url: valid.length ? absoluteUrl(`/cart/handoff?items=${encodeURIComponent(itemsParam(valid))}`) : null,
    note: "Prices are read from the shop's catalog. Shipping and taxes, if any, are shown at checkout. The customer must open handoff_url to review and confirm.",
  };
}
