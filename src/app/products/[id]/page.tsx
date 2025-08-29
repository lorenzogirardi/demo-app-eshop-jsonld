import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import PriceTag from "@/components/PriceTag";
import { Metadata } from "next";
import { cache } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import { incrementProductQuantity } from "./actions";

interface ProductPageProps {
  params: {
    id: string;
  };
}

const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { reviews: true },
  });
  if (!product) notFound();
  return product;
});

export async function generateMetadata({
  params: { id },
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(id);
  const url = process.env.URL + "/products/" + id

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: url,
      images: [{ url: product.imageUrl }],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params: { id },
}: ProductPageProps) {
  const product = await getProduct(id);
  const { name, description, imageUrl, price, brand, sku, mpn, rating, reviewCount, reviews } = product;
  const url = process.env.URL + "/products/" + id;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: imageUrl,
    description,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    sku: sku,
    mpn: mpn,
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "GBP",
      price: (price / 100).toString(),
      priceValidUntil: "2025-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
    },
    review: reviews.map((review: any) => {
      return {
        "@type": "Review",
        author: review.author,
        datePublished: review.datePublished.toISOString(),
        reviewBody: review.reviewBody,
        name: review.name,
        reviewRating: {
          "@type": "Rating",
          bestRating: "5",
          ratingValue: review.ratingValue.toString(),
          worstRating: "1",
        },
      };
    }),
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
