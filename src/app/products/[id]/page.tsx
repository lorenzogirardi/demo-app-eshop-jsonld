import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import PriceTag from "@/components/PriceTag";
import { Metadata } from "next";
import { cache } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import { incrementProductQuantity } from "./actions";
import { headers } from "next/headers";
import { getStore } from "@/lib/ai/store";
import { recordBotVisit } from "@/lib/bots";
import { STORE_NAME, absoluteUrl } from "@/lib/site";
import { productJsonLd, productBreadcrumbJsonLd, safeJsonLd } from "@/lib/seo/jsonld";

interface ProductPageProps {
  params: {
    id: string;
  };
}

const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return product;
});

export async function generateMetadata({
  params: { id },
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(id);
  const seo = getStore().seo[id];
  const title = seo?.seo_title || `${product.name} - ${STORE_NAME}`;
  const description = seo?.seo_description || product.description;
  const url = absoluteUrl(`/products/${id}`);

  return {
    title,
    description,
    keywords: seo?.seo_tags,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: STORE_NAME,
      images: [{ url: product.imageUrl }],
    },
    twitter: { card: "summary_large_image", title, description, images: [product.imageUrl] },
  };
}

export default async function ProductPage({
  params: { id },
}: ProductPageProps) {
  const product = await getProduct(id);
  recordBotVisit(headers().get("user-agent"), `/products/${id}`);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productBreadcrumbJsonLd(product)) }}
      />
      <Image
        unoptimized
        src={product.imageUrl}
        alt={product.name}
        width={500}
        height={500}
        className="rounded-lg"
        priority
      />
      <div>
        <h1 className="text-5xl font-bold">{product.name}</h1>
        <PriceTag price={product.price} className="mt-4" />
        <p className="py-6">{product.description}</p>
        <AddToCartButton
          productId={product.id}
          incrementProductQuantity={incrementProductQuantity}
        />
      </div>
    </div>
  );
}
