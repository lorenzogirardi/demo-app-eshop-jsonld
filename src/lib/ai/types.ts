export interface ProductIndexDocument {
  schema_version: "1.0.0";
  entry_id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  properties: string;
  categories: string;
  price: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  source: {
    system: "nodejs-eshop";
    version: string;
    exported_at: string;
  };
}

export interface CatalogUpdateEvent {
  schema_version: "1.0.0";
  event_id: string;
  event_type: "product.created" | "product.updated" | "product.deleted";
  timestamp: string;
  correlation_id: string;
  payload: {
    product_id: string;
    changes?: Partial<ProductIndexDocument>;
  };
  source: {
    system: "nodejs-eshop";
    version: string;
  };
}

export interface AISearchRequest {
  schema_version: "1.0.0";
  query: string;
  user_id?: string;
  correlation_id: string;
  filters?: {
    categories?: string[];
    price_min?: number;
    price_max?: number;
  };
  options?: {
    max_results?: number;
    timeout_ms?: number;
    include_ai_answer?: boolean;
  };
}

export interface NormalizedProduct {
  schema_version: "1.0.0";
  id: string;
  name: string;
  description: string;
  price: number;
  price_formatted: string;
  currency: string;
  image_url: string;
  in_stock: boolean;
  categories: string[];
  source_of_truth: "nodejs-mock-db";
  last_verified: string;
}

export interface AISearchResponse {
  schema_version: "1.0.0";
  correlation_id: string;
  success: boolean;
  fallback_used: boolean;
  ai_answer?: string;
  /** One-line reason per recommended product id. */
  reasons?: Record<string, string>;
  /** Suggested refinements the customer can click. */
  followups?: string[];
  disclaimer: string;
  products: NormalizedProduct[];
  citations: Array<{
    product_id: string;
    relevance_score: number;
    source_chunk_id?: string;
  }>;
  grounding_score: number;
  metadata: {
    provider: string;
    model: string;
    latency_ms: number;
    tokens_used: number;
    cost_estimate_usd?: number;
  };
}

export interface EnrichmentRequest {
  schema_version: "1.0.0";
  product_id: string;
  fields: Array<
    "description" | "seo_title" | "seo_description" | "seo_tags" | "attributes" | "categories"
  >;
  language?: string;
  context?: string;
  correlation_id: string;
}

export interface EnrichmentProposal {
  schema_version: "1.0.0";
  proposal_id: string;
  product_id: string;
  status: "draft" | "approved" | "rejected" | "reverted";
  proposed_values: {
    description?: string;
    seo_title?: string;
    seo_description?: string;
    seo_tags?: string[];
    attributes?: Record<string, string>;
    categories?: string[];
  };
  original_values: Record<string, unknown>;
  validation: {
    auto_checks: {
      length_valid: boolean;
      no_placeholder: boolean;
      category_coherent: boolean;
      /** No number or claim (warranty, shipping, origin...) that is absent from the source text. */
      grounded: boolean;
    };
    /** Human-readable reason for each failed check. */
    issues: string[];
    confidence_score: number;
  };
  metadata: {
    provider: string;
    model: string;
    generated_at: string;
    correlation_id: string;
  };
  review?: {
    reviewer_id: string;
    reviewed_at: string;
    action: "approved" | "rejected" | "modified" | "reverted";
    notes?: string;
  };
  /** Set when approved: the values were written to the product. */
  applied_at?: string;
  reverted_at?: string;
}
