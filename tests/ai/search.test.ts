import { describe, it, expect, beforeAll } from "vitest";
import { classicSearch, toNormalized } from "@/lib/ai/search";

beforeAll(() => {
  process.env.AI_ENABLED = "false";
});

describe("M3: Classic Search (Fallback)", () => {
  it("should find products by name", async () => {
    const results = await classicSearch("handbag", 10);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain("handbag");
  });

  it("should find products by description", async () => {
    const results = await classicSearch("polarized", 10);
    expect(results.length).toBeGreaterThan(0);
  });

  it("should respect max_results", async () => {
    const results = await classicSearch("bag", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should filter by category", async () => {
    const results = await classicSearch("bag", 10, ["Bags"]);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.categories).toContain("Bags");
    });
  });

  it("should filter by price range", async () => {
    const results = await classicSearch("bag", 10, undefined, 50000, 100000);
    results.forEach((r) => {
      expect(r.price).toBeGreaterThanOrEqual(50000);
      expect(r.price).toBeLessThanOrEqual(100000);
    });
  });

  it("should return empty for no matches", async () => {
    const results = await classicSearch("xyznonexistent", 10);
    expect(results).toHaveLength(0);
  });
});

describe("M3: Product Normalization", () => {
  it("should normalize product correctly", () => {
    const mockProduct = {
      id: "1",
      name: "Leather Handbag",
      description: "A nice handbag",
      price: 129900,
      imageUrl: "https://example.com/img.jpg",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    const normalized = toNormalized(mockProduct);
    expect(normalized.id).toBe("1");
    expect(normalized.price).toBe(129900);
    expect(normalized.price_formatted).toBe("£1,299.00");
    expect(normalized.currency).toBe("GBP");
    expect(normalized.in_stock).toBe(true);
    expect(normalized.source_of_truth).toBe("nodejs-mock-db");
    expect(normalized.categories).toContain("Bags");
  });
});
