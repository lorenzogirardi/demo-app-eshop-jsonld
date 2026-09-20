import type { Product } from "@prisma/client";
import { deriveCategories, deriveSku } from "@/lib/ai/categories";
import { getStore } from "@/lib/ai/store";
import { STORE_CURRENCY, STORE_NAME, absoluteUrl, siteUrl } from "@/lib/site";

type Json = Record<string, unknown>;

/** JSON-LD is injected as raw HTML: escape `<` so text (possibly AI-written) can never close the script tag. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: STORE_NAME,
    url: siteUrl(),
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: STORE_NAME,
    url: siteUrl(),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl()}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

/**
 * Return and shipping terms are business facts we do not know: they are emitted only when configured
 * (RETURN_DAYS, SHIPPING_FREE_OVER_GBP, SHIPPING_COUNTRY) and never guessed.
 */
function policyBlocks(): Json {
  const out: Json = {};
  const returnDays = parseInt(process.env.RETURN_DAYS || "");
  if (returnDays > 0) {
    out.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: process.env.SHIPPING_COUNTRY || "GB",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: returnDays,
    };
  }
  return out;
}

export function productJsonLd(product: Product): Json {
  const seo = getStore().seo[product.id];
  const categories = deriveCategories(product);
  const url = absoluteUrl(`/products/${product.id}`);
  const brand = process.env.STORE_BRAND;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: product.name,
    description: product.description,
    image: [product.imageUrl],
    sku: deriveSku(product),
    category: categories.join(" > "),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(seo?.seo_tags?.length ? { keywords: seo.seo_tags.join(", ") } : {}),
    ...(seo?.attributes && Object.keys(seo.attributes).length
      ? {
          additionalProperty: Object.entries(seo.attributes).map(([name, value]) => ({
            "@type": "PropertyValue",
            name,
            value,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: (product.price / 100).toFixed(2),
      priceCurrency: STORE_CURRENCY,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#organization") },
      ...policyBlocks(),
    },
  };
}

export function productBreadcrumbJsonLd(product: Product): Json {
  const category = deriveCategories(product)[0];
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(category && category !== "Uncategorized"
      ? [{ name: category, path: `/search?query=${encodeURIComponent(category)}` }]
      : []),
    { name: product.name },
  ]);
}

export function itemListJsonLd(name: string, products: Product[], path: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.id}`),
      name: p.name,
      image: p.imageUrl,
    })),
  };
}
