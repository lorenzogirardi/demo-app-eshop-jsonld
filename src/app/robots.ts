import type { MetadataRoute } from "next";
import { KNOWN_BOTS } from "@/lib/bots";
import { absoluteUrl } from "@/lib/site";

const ALLOW = ["/", "/api/products", "/api/mcp", "/api/cart/preview", "/openapi.json", "/llms.txt", "/feed/"];
const DISALLOW = ["/api/", "/admin", "/cart", "/add-product", "/api/products/dump"];

/**
 * Policy by bot type. Search and on-demand agents may read the shop so it appears in AI answers.
 * Training crawlers follow AI_TRAINING_BOTS ("allow" by default for this demo; set "disallow" to opt out).
 * A bot with its own group ignores the "*" group, so the paths are repeated for every bot.
 */
export default function robots(): MetadataRoute.Robots {
  const trainingAllowed = (process.env.AI_TRAINING_BOTS || "allow") !== "disallow";

  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      ...KNOWN_BOTS.map((bot) =>
        bot.kind === "training" && !trainingAllowed
          ? { userAgent: bot.token, disallow: "/" }
          : { userAgent: bot.token, allow: ALLOW, disallow: DISALLOW }
      ),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
