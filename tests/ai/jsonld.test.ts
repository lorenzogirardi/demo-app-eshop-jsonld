import { describe, it, expect, afterEach } from "vitest";
import { mockPrisma } from "@/lib/db/mock-db";
import {
  breadcrumbJsonLd,
  itemListJsonLd,
  productJsonLd,
  productBreadcrumbJsonLd,
  safeJsonLd,
  websiteJsonLd,
} from "@/lib/seo/jsonld";

afterEach(() => {
  delete process.env.RETURN_DAYS;
  delete process.env.STORE_BRAND;
});

describe("JSON-LD", () => {
  it("escapes markup so text can never close the script tag", () => {
    const out = safeJsonLd({ description: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).description).toBe("</script><script>alert(1)</script>");
  });

  it("describes a product with sku, category, absolute urls and a priced offer", async () => {
    const p = (await mockPrisma.product.findUnique({ where: { id: "1" } }))!;
    const ld: any = productJsonLd(p);
    expect(ld["@type"]).toBe("Product");
    expect(ld.sku).toMatch(/^[A-Z]+-0001$/);
    expect(ld.category).toContain("Bags");
    expect(ld.url).toMatch(/^https?:\/\/.+\/products\/1$/);
    expect(ld.offers.price).toBe((p.price / 100).toFixed(2));
    expect(ld.offers.priceCurrency).toBe("GBP");
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
  });

  it("does not invent reviews, brand or return terms", async () => {
    const p = (await mockPrisma.product.findUnique({ where: { id: "1" } }))!;
    const ld: any = productJsonLd(p);
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
    expect(ld.brand).toBeUndefined();
    expect(ld.offers.hasMerchantReturnPolicy).toBeUndefined();

    process.env.RETURN_DAYS = "30";
    process.env.STORE_BRAND = "Acme";
    const configured: any = productJsonLd(p);
    expect(configured.brand.name).toBe("Acme");
    expect(configured.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(30);
  });

  it("builds breadcrumb, item list and a search action", async () => {
    const p = (await mockPrisma.product.findUnique({ where: { id: "1" } }))!;
    const crumbs: any = productBreadcrumbJsonLd(p);
    expect(crumbs.itemListElement.map((i: any) => i.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[2].item).toBeUndefined();
    expect((breadcrumbJsonLd([{ name: "Home", path: "/" }]) as any)["@type"]).toBe("BreadcrumbList");

    const list: any = itemListJsonLd("All", [p], "/");
    expect(list.numberOfItems).toBe(1);
    expect((websiteJsonLd() as any).potentialAction.target.urlTemplate).toContain("{search_term_string}");
  });
});
