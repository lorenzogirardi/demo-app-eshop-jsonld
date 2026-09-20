import type { MetadataRoute } from "next";
import { mockPrisma } from "@/lib/db/mock-db";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await mockPrisma.product.findMany();
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.id}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
