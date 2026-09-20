import { NextResponse } from "next/server";
import { mockPrisma } from "@/lib/db/mock-db";
import {
  deriveCategories,
  deriveSlug,
  deriveSku,
  deriveProperties,
} from "@/lib/ai/categories";
import type { ProductIndexDocument } from "@/lib/ai/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ENTHUSIAST_TOKEN;

  if (expectedToken && authHeader !== `Token ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await mockPrisma.product.findMany();

  const documents: ProductIndexDocument[] = products.map((product) => ({
    schema_version: "1.0.0" as const,
    entry_id: `product-${product.id}`,
    name: product.name,
    slug: deriveSlug(product.name),
    sku: deriveSku(product),
    description: product.description,
    properties: deriveProperties(product),
    categories: deriveCategories(product).join(", "),
    price: product.price,
    image_url: product.imageUrl,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
    source: {
      system: "nodejs-eshop" as const,
      version: "0.1.0",
      exported_at: new Date().toISOString(),
    },
  }));

  return NextResponse.json({
    schema_version: "1.0.0",
    count: documents.length,
    exported_at: new Date().toISOString(),
    documents,
  });
}
