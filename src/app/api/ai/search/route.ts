import { NextResponse } from "next/server";
import { AISearchRequestSchema, sanitizeQuery } from "@/lib/ai/validator";
import { aiSearch } from "@/lib/ai/search";
import { isAIEnabled } from "@/lib/ai/config";
import { generateCorrelationId } from "@/lib/ai/client";

export async function POST(request: Request) {
  const correlationId = generateCorrelationId();

  if (!isAIEnabled()) {
    // Classic search fallback
    try {
      const body = await request.json();
      const query = sanitizeQuery(body.query || "");
      if (!query) {
        return NextResponse.json(
          { error: "Query is required" },
          { status: 400 }
        );
      }

      const { classicSearch } = await import("@/lib/ai/search");
      const products = await classicSearch(query, body.options?.max_results ?? 10);

      return NextResponse.json({
        schema_version: "1.0.0",
        correlation_id: correlationId,
        success: true,
        fallback_used: true,
        disclaimer: "AI is disabled. Showing classic search results.",
        products,
        citations: products.map((p: any, i: number) => ({
          product_id: p.id,
          relevance_score: Math.max(0.3, 0.8 - i * 0.1),
        })),
        grounding_score: 0,
        metadata: {
          provider: "classic-search",
          model: "none",
          latency_ms: 0,
          tokens_used: 0,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  }

  try {
    const body = await request.json();
    const validated = AISearchRequestSchema.parse({
      ...body,
      query: sanitizeQuery(body.query || ""),
    });

    const response = await aiSearch({
      schema_version: "1.0.0",
      query: validated.query,
      correlation_id: correlationId,
      filters: validated.filters,
      options: validated.options,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { error: "Invalid request", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        schema_version: "1.0.0",
        correlation_id: correlationId,
        success: false,
        fallback_used: true,
        disclaimer: "AI search encountered an error. Showing classic results.",
        products: [],
        citations: [],
        grounding_score: 0,
        metadata: {
          provider: "error",
          model: "none",
          latency_ms: 0,
          tokens_used: 0,
        },
      },
      { status: 500 }
    );
  }
}
