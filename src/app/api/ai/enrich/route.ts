import { NextResponse } from "next/server";
import { z } from "zod";
import { isAIEnabled } from "@/lib/ai/config";
import { isAdminRequest } from "@/lib/adminAuth";
import { hasLLM } from "@/lib/ai/llm";
import {
  ENRICHMENT_FIELDS,
  ReviewError,
  approveProposal,
  generateBatch,
  getAllProposals,
  rejectProposal,
  revertProposal,
} from "@/lib/ai/enrichment";
import { generateCorrelationId } from "@/lib/ai/client";
import { mockPrisma } from "@/lib/db/mock-db";
import { getStore } from "@/lib/ai/store";

const GenerateSchema = z.object({
  product_ids: z.array(z.string().min(1)).min(1).max(20),
  fields: z.array(z.enum(ENRICHMENT_FIELDS)).min(1),
});

const ReviewSchema = z.object({
  proposal_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "revert"]),
  notes: z.string().max(500).optional(),
  override: z.boolean().optional(),
  edits: z
    .object({
      description: z.string().max(700).optional(),
      seo_title: z.string().max(80).optional(),
      seo_description: z.string().max(200).optional(),
      seo_tags: z.array(z.string().max(40)).max(12).optional(),
      attributes: z.record(z.string().max(60), z.string().max(120)).optional(),
      categories: z.array(z.string().max(40)).max(8).optional(),
    })
    .optional(),
});

const ACTOR = "admin";

function guard(request: Request): NextResponse | null {
  if (!isAIEnabled()) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 403 });
  }
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Admin token required" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const products = await mockPrisma.product.findMany();
  const store = getStore();
  return NextResponse.json({
    proposals: getAllProposals(),
    audit: store.audit.slice(0, 50),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      description_length: p.description.length,
      enriched: Boolean(store.seo[p.id]),
    })),
    llm_configured: hasLLM(),
  });
}

export async function POST(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const correlationId = generateCorrelationId();
  try {
    const body = await request.json();

    if (body.proposal_id && body.action) {
      const v = ReviewSchema.parse(body);
      const result =
        v.action === "approve"
          ? await approveProposal(v.proposal_id, ACTOR, v.notes, { edits: v.edits, override: v.override })
          : v.action === "reject"
            ? rejectProposal(v.proposal_id, ACTOR, v.notes)
            : await revertProposal(v.proposal_id, ACTOR, v.notes);

      if (!result) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      return NextResponse.json({ success: true, proposal: result, correlation_id: correlationId });
    }

    // Accept the single-product form used by earlier clients.
    const normalized = body.product_id ? { ...body, product_ids: [body.product_id] } : body;
    const v = GenerateSchema.parse(normalized);
    if (!hasLLM()) {
      return NextResponse.json({ error: "No LLM configured (set OPENAI_API_KEY)" }, { status: 503 });
    }
    const { proposals, errors } = await generateBatch(v.product_ids, v.fields, correlationId);
    return NextResponse.json({
      success: errors.length === 0,
      proposals,
      proposal: proposals[0],
      errors,
      correlation_id: correlationId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    if (error instanceof ReviewError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      {
        error: "Enrichment failed",
        details: error instanceof Error ? error.message : "unknown",
        correlation_id: correlationId,
      },
      { status: 500 }
    );
  }
}
