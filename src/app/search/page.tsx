import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import { classicSearch, aiSearch } from "@/lib/ai/search";
import { isAIEnabled } from "@/lib/ai/config";
import Link from "next/link";
import { ALL_CATEGORIES } from "@/lib/ai/categories";
import { productToJsonLdInput } from "@/lib/seo/searchList";
import { itemListJsonLd, safeJsonLd } from "@/lib/seo/jsonld";

interface SearchPageProps {
  searchParams: { query: string; ai?: string };
}

export function generateMetadata({
  searchParams: { query },
}: SearchPageProps): Metadata {
  return {
    title: `Search: ${query} - GD Platform Engineering`,
  };
}

export default async function SearchPage({
  searchParams: { query, ai },
}: SearchPageProps) {
  const useAI = ai === "true" && isAIEnabled();

  if (useAI) {
    const response = await aiSearch({
      schema_version: "1.0.0",
      query,
      correlation_id: crypto.randomUUID(),
      filters: {},
      options: { max_results: 20, include_ai_answer: true, timeout_ms: 45000 },
    });
    const results = response.products;
    const aiAnswer = response.ai_answer;
    const ai_list = results.map(productToJsonLdInput);
    return (
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(itemListJsonLd(`Search: ${query}`, ai_list, `/search?query=${encodeURIComponent(query)}`)),
          }}
        />
        <div className="alert alert-info mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>AI-powered search results. Verify prices before purchasing.</span>
        </div>
        {aiAnswer && (
          <div className="bg-base-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">AI Response</h3>
            <p className="whitespace-pre-wrap">{aiAnswer}</p>
          </div>
        )}
        {response.followups && response.followups.length > 0 && (
          <nav aria-label="Refine your search" className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm opacity-70">Refine:</span>
            {response.followups.map((f) => (
              <Link
                key={f}
                href={`/search?query=${encodeURIComponent(`${query}, ${f}`)}&ai=true`}
                className="btn btn-outline btn-xs"
              >
                {f}
              </Link>
            ))}
          </nav>
        )}
        {results.length === 0 ? (
          <div className="rounded-lg border border-base-300 p-6 text-center">
            <p className="mb-3 font-semibold">We found no match for “{query}”.</p>
            <p className="mb-4 text-sm opacity-70">Try a product type, or browse by category:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {ALL_CATEGORIES.filter((c) => c !== "Accessories").map((c) => (
                <Link key={c} href={`/search?query=${encodeURIComponent(c)}`} className="btn btn-outline btn-sm">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard
                product={productToJsonLdInput(product)}
                reason={response.reasons?.[product.id]}
                key={product.id}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { id: "desc" },
  });
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 p-6 text-center">
        <p className="mb-3 font-semibold">No products match “{query}”.</p>
        <p className="mb-4 text-sm opacity-70">
          {isAIEnabled()
            ? "Try the AI search: it understands descriptions like “something for the evening”."
            : "Try a product type, or browse by category:"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {isAIEnabled() && (
            <Link href={`/search?query=${encodeURIComponent(query)}&ai=true`} className="btn btn-primary btn-sm">
              Search with AI
            </Link>
          )}
          {ALL_CATEGORIES.filter((c) => c !== "Accessories").map((c) => (
            <Link key={c} href={`/search?query=${encodeURIComponent(c)}`} className="btn btn-outline btn-sm">
              {c}
            </Link>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
