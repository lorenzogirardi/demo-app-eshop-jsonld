import type { Product } from "@prisma/client";
import type { NormalizedProduct } from "@/lib/ai/types";

/** Adapts an AI search result back to the Product shape used by cards and JSON-LD builders. */
export function productToJsonLdInput(p: NormalizedProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.image_url,
    createdAt: new Date(p.last_verified),
    updatedAt: new Date(p.last_verified),
  } as Product;
}
