import { Product } from "@prisma/client";
import { getStore } from "./store";

const CATEGORY_RULES: Array<{
  pattern: RegExp;
  categories: string[];
}> = [
  // Bags
  { pattern: /handbag|bag|tote|clutch|backpack|bucket|hobo|crossbody|satchel/i, categories: ["Bags", "Accessories"] },
  // Sunglasses
  { pattern: /sunglasses|aviator|wayfarer|cat-eye|clubmaster|shield|wrap|oval|square|driving|floating|sport/i, categories: ["Sunglasses", "Eyewear", "Accessories"] },
  // Scarves
  { pattern: /scarf|foulard|twilly|stole|kerchief/i, categories: ["Scarves", "Accessories"] },
  // Wallets
  { pattern: /wallet|card holder|bifold|coin|money clip|key case|phone wallet/i, categories: ["Wallets", "Accessories"] },
  // Watches
  { pattern: /watch|chronograph|dive|pilot|field|skeleton|gmt|moonphase|solar|hybrid/i, categories: ["Watches", "Accessories"] },
  // Belts
  { pattern: /belt|grommet/i, categories: ["Belts", "Accessories"] },
  // Shoes
  { pattern: /shoe|boot|loafer|oxford|monk|sneaker|espadrille|sandal|trainer|chelsea|desert|wingtip|brogue/i, categories: ["Shoes", "Footwear"] },
  // Ties
  { pattern: /tie|bolo|bow tie/i, categories: ["Ties", "Accessories"] },
];

export const ALL_CATEGORIES: string[] = Array.from(
  new Set(CATEGORY_RULES.flatMap((r) => r.categories))
);

export function deriveCategories(product: Product): string[] {
  const approved = getStore().seo[product.id]?.categories;
  if (approved && approved.length > 0) return approved;

  const text = `${product.name} ${product.description}`;
  const categories = new Set<string>();

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) {
      rule.categories.forEach((c) => categories.add(c));
    }
  }

  if (categories.size === 0) {
    categories.add("Uncategorized");
  }

  return Array.from(categories);
}

export function deriveSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function deriveSku(product: Product): string {
  const prefix = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `${prefix}-${product.id.padStart(4, "0")}`;
}

export function deriveProperties(product: Product): string {
  const props: string[] = [];
  const cats = deriveCategories(product);
  props.push(`category: ${cats.join(", ")}`);
  props.push(`price: ${(product.price / 100).toFixed(2)}`);
  return props.join("; ");
}
