export interface TestCase {
  id: string;
  query: string;
  expected_categories?: string[];
  expected_product_names?: string[];
  min_results?: number;
  max_results?: number;
  max_latency_ms?: number;
  description: string;
}

export const TEST_DATASET: TestCase[] = [
  {
    id: "tc-001",
    query: "handbag under 500 pounds",
    expected_categories: ["Bags"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Price-filtered category search",
  },
  {
    id: "tc-002",
    query: "something for summer",
    expected_categories: ["Sunglasses", "Scarves"],
    min_results: 2,
    max_latency_ms: 5000,
    description: "Seasonal intent query",
  },
  {
    id: "tc-003",
    query: "gift for dad who likes watches",
    expected_categories: ["Watches"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Gift intent with category",
  },
  {
    id: "tc-004",
    query: "leather shoes for formal events",
    expected_categories: ["Shoes"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Material + occasion query",
  },
  {
    id: "tc-005",
    query: "cheap accessories under 100",
    min_results: 1,
    max_latency_ms: 5000,
    description: "Budget query with category",
  },
  {
    id: "tc-006",
    query: "red tie for wedding",
    expected_product_names: ["Silk Tie", "Polka Dot Tie", "Striped Repp Tie"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Color + occasion query",
  },
  {
    id: "tc-007",
    query: "wallet that fits in pocket",
    expected_categories: ["Wallets"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Size constraint query",
  },
  {
    id: "tc-008",
    query: "sunglasses with UV protection",
    expected_categories: ["Sunglasses"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Feature-based query",
  },
  {
    id: "tc-009",
    query: "belt for jeans",
    expected_categories: ["Belts"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Use-case query",
  },
  {
    id: "tc-010",
    query: "silk scarf with pattern",
    expected_categories: ["Scarves"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Material + attribute query",
  },
  {
    id: "tc-011",
    query: "birthday present for wife",
    min_results: 1,
    max_latency_ms: 5000,
    description: "Generic gift intent (should return diverse results)",
  },
  {
    id: "tc-012",
    query: "luxury watch over 2000",
    expected_categories: ["Watches"],
    min_results: 1,
    max_latency_ms: 5000,
    description: "Premium category + price floor",
  },
];

export interface EvaluationResult {
  test_case_id: string;
  query: string;
  success: boolean;
  fallback_used: boolean;
  latency_ms: number;
  results_count: number;
  categories_matched: boolean;
  product_names_matched: boolean;
  grounding_score: number;
  error?: string;
}

export function evaluateResults(
  tc: TestCase,
  result: {
    products: Array<{ categories: string[]; name: string }>;
    fallback_used: boolean;
    grounding_score: number;
    metadata: { latency_ms: number };
  }
): EvaluationResult {
  const latencyOk = result.metadata.latency_ms <= (tc.max_latency_ms ?? 5000);
  const countOk =
    (!tc.min_results || result.products.length >= tc.min_results) &&
    (!tc.max_results || result.products.length <= tc.max_results);

  let categoriesMatched = true;
  if (tc.expected_categories && tc.expected_categories.length > 0) {
    categoriesMatched = result.products.some((p) =>
      p.categories.some((pc) =>
        tc.expected_categories!.some((ec) =>
          pc.toLowerCase().includes(ec.toLowerCase())
        )
      )
    );
  }

  let productNamesMatched = true;
  if (tc.expected_product_names && tc.expected_product_names.length > 0) {
    productNamesMatched = result.products.some((p) =>
      tc.expected_product_names!.some((en) =>
        p.name.toLowerCase().includes(en.toLowerCase())
      )
    );
  }

  return {
    test_case_id: tc.id,
    query: tc.query,
    success: latencyOk && countOk && categoriesMatched && productNamesMatched,
    fallback_used: result.fallback_used,
    latency_ms: result.metadata.latency_ms,
    results_count: result.products.length,
    categories_matched: categoriesMatched,
    product_names_matched: productNamesMatched,
    grounding_score: result.grounding_score,
  };
}
