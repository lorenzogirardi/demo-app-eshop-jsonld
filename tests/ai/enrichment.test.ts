import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/ai/llm", () => ({
  chatJSON: vi.fn(),
  llmModel: () => "test-model",
  hasLLM: () => true,
}));

import { chatJSON } from "@/lib/ai/llm";
import {
  ReviewError,
  approveProposal,
  checkProposal,
  generateEnrichment,
  getAllProposals,
  rejectProposal,
  revertProposal,
} from "@/lib/ai/enrichment";
import { resetStoreForTests, getStore } from "@/lib/ai/store";
import { mockPrisma } from "@/lib/db/mock-db";

const mocked = vi.mocked(chatJSON);

const GOOD = {
  description:
    "Full-grain calfskin handbag with a brushed gold clasp and an interior zip pocket. The structured silhouette fits a tablet, a wallet and daily essentials.",
  seo_title: "Leather Handbag in Full-Grain Calfskin",
  seo_description: "Structured calfskin handbag with brushed gold clasp and interior zip pocket.",
  seo_tags: ["leather handbag", "calfskin", "gold clasp"],
  attributes: { material: "full-grain calfskin" },
  categories: ["Bags", "Accessories"],
};

beforeEach(() => {
  resetStoreForTests();
  mocked.mockReset();
});

describe("Catalog enrichment", () => {
  it("creates a draft proposal from the model output with real checks", async () => {
    mocked.mockResolvedValue(GOOD);
    const p = await generateEnrichment("1", ["description", "seo_title", "seo_tags"], "cid");

    expect(p.status).toBe("draft");
    expect(p.product_id).toBe("1");
    expect(p.proposed_values.description).toBe(GOOD.description);
    expect(p.proposed_values.seo_description).toBeUndefined(); // not requested
    expect(p.validation.auto_checks.length_valid).toBe(true);
    expect(p.metadata.model).toBe("test-model");
  });

  it("throws for a missing product and when the model returns nothing usable", async () => {
    await expect(generateEnrichment("99999", ["description"], "x")).rejects.toThrow("Product 99999 not found");
    mocked.mockResolvedValue({});
    await expect(generateEnrichment("1", ["description"], "x")).rejects.toThrow("nothing usable");
  });

  it("flags invented facts: numbers and claims that are not in the source", () => {
    const source = { name: "Leather Handbag", description: "Calfskin handbag with a gold clasp.", price: 129900 };
    const r = checkProposal({ description: "Calfskin handbag with a 2 year warranty and free shipping." }, source);
    expect(r.auto_checks.grounded).toBe(false);
    expect(r.issues.join(" ")).toContain("warranty");
    expect(r.issues.join(" ")).toContain("2");
  });

  it("flags marketing claims the source does not make, but allows those it does", () => {
    const source = { name: "Designer Watch", description: "Elegant watch with a steel case.", price: 100 };
    const bad = checkProposal({ seo_tags: ["luxury watch", "premium"] }, source);
    expect(bad.auto_checks.grounded).toBe(false);
    const fine = checkProposal({ seo_tags: ["designer watch", "steel case"] }, source);
    expect(fine.auto_checks.grounded).toBe(true);
  });

  it("flags out-of-range lengths, placeholders and unknown categories", () => {
    const source = { name: "Bag", description: "A bag.", price: 100 };
    const r = checkProposal({ seo_title: "x".repeat(70), description: "lorem ipsum dolor sit amet, consectetur", categories: ["Spaceships"] }, source);
    expect(r.auto_checks.length_valid).toBe(false);
    expect(r.auto_checks.no_placeholder).toBe(false);
    expect(r.auto_checks.category_coherent).toBe(false);
  });

  it("approval writes to the product, revert restores it, and both are audited", async () => {
    const before = (await mockPrisma.product.findUnique({ where: { id: "1" } }))!.description;
    mocked.mockResolvedValue(GOOD);
    const p = await generateEnrichment("1", ["description", "seo_title", "seo_tags"], "cid");

    const approved = await approveProposal(p.proposal_id, "admin", "ok", { override: true });
    expect(approved!.status).toBe("approved");
    expect((await mockPrisma.product.findUnique({ where: { id: "1" } }))!.description).toBe(GOOD.description);
    expect(getStore().seo["1"].seo_title).toBe(GOOD.seo_title);

    const reverted = await revertProposal(p.proposal_id, "admin");
    expect(reverted!.status).toBe("reverted");
    expect((await mockPrisma.product.findUnique({ where: { id: "1" } }))!.description).toBe(before);
    expect(getStore().seo["1"]).toBeUndefined();
    expect(getStore().audit.map((a) => a.action)).toEqual(expect.arrayContaining(["generated", "approved", "reverted"]));
  });

  it("refuses to approve failed checks without override, and accepts reviewer edits", async () => {
    mocked.mockResolvedValue({ ...GOOD, description: "Handbag with a 5 year warranty and free shipping worldwide today." });
    const p = await generateEnrichment("2", ["description"], "cid");
    expect(p.validation.auto_checks.grounded).toBe(false);

    await expect(approveProposal(p.proposal_id, "admin")).rejects.toThrow(ReviewError);

    const source = (await mockPrisma.product.findUnique({ where: { id: "2" } }))!;
    const fixed = await approveProposal(p.proposal_id, "admin", undefined, {
      edits: { description: source.description },
    });
    expect(fixed!.status).toBe("approved");
    expect(fixed!.review?.action).toBe("modified");
    await revertProposal(p.proposal_id, "admin");
  });

  it("rejects, blocks a second review, and returns null for unknown ids", async () => {
    mocked.mockResolvedValue(GOOD);
    const p = await generateEnrichment("3", ["description"], "cid");
    expect(rejectProposal(p.proposal_id, "admin", "no")!.status).toBe("rejected");
    expect(() => rejectProposal(p.proposal_id, "admin")).toThrow(ReviewError);
    await expect(approveProposal("nope", "admin")).resolves.toBeNull();
    expect(getAllProposals().length).toBe(1);
  });
});
