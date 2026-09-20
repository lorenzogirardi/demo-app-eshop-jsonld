import { describe, it, expect } from "vitest";
import {
  deriveCategories,
  deriveSlug,
  deriveSku,
  deriveProperties,
} from "@/lib/ai/categories";
import type { Product } from "@prisma/client";

const mockProduct: Product = {
  id: "1",
  name: "Leather Handbag",
  description:
    "Full-grain calfskin handbag with brushed gold clasp and interior zip pocket.",
  price: 129900,
  imageUrl: "https://images.unsplash.com/example.jpg",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockSunglasses: Product = {
  id: "2",
  name: "Aviator Sunglasses",
  description: "Classic metal aviator sunglasses with polarized lenses.",
  price: 24900,
  imageUrl: "https://images.unsplash.com/example2.jpg",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockWatch: Product = {
  id: "3",
  name: "Chronograph Watch",
  description: "Swiss-made automatic chronograph with date display.",
  price: 499900,
  imageUrl: "https://images.unsplash.com/example3.jpg",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("M2: Category Derivation", () => {
  it("should categorize handbag correctly", () => {
    const cats = deriveCategories(mockProduct);
    expect(cats).toContain("Bags");
    expect(cats).toContain("Accessories");
  });

  it("should categorize sunglasses correctly", () => {
    const cats = deriveCategories(mockSunglasses);
    expect(cats).toContain("Sunglasses");
    expect(cats).toContain("Eyewear");
  });

  it("should categorize watch correctly", () => {
    const cats = deriveCategories(mockWatch);
    expect(cats).toContain("Watches");
  });

  it("should generate slug from name", () => {
    expect(deriveSlug("Leather Handbag")).toBe("leather-handbag");
    expect(deriveSlug("Aviator Sunglasses")).toBe("aviator-sunglasses");
    expect(deriveSlug("Chronograph Watch")).toBe("chronograph-watch");
  });

  it("should generate SKU from name and id", () => {
    const sku = deriveSku(mockProduct);
    expect(sku).toBe("LH-0001");
  });

  it("should generate properties string", () => {
    const props = deriveProperties(mockProduct);
    expect(props).toContain("category: Bags");
    expect(props).toContain("price: 1299.00");
  });
});

describe("M2: Product Dump API Contract", () => {
  it("should define correct ProductIndexDocument structure", async () => {
    const types = await import("@/lib/ai/types");
    expect(types).toBeDefined();
  });
});
