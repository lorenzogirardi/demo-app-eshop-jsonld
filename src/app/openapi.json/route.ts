import { NextResponse } from "next/server";
import { MAX_CART_LINES, MAX_LIMIT, MAX_LINE_QUANTITY } from "@/lib/agentApi";
import { STORE_NAME, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const Product = {
  type: "object",
  properties: {
    id: { type: "string" },
    sku: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    price: { type: "number", description: "Price in GBP" },
    currency: { type: "string", example: "GBP" },
    categories: { type: "array", items: { type: "string" } },
    image_url: { type: "string", format: "uri" },
    url: { type: "string", format: "uri" },
    in_stock: { type: "boolean" },
  },
};

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: `${STORE_NAME} shop API`,
      version: "1.0.0",
      description:
        "Read-only catalog and cart pricing for shopping agents. Nothing here creates an order: the customer confirms on the shop.",
    },
    servers: [{ url: siteUrl() }],
    paths: {
      "/api/products": {
        get: {
          operationId: "searchProducts",
          summary: "Search products",
          parameters: [
            { name: "q", in: "query", schema: { type: "string", maxLength: 200 }, description: "Free text" },
            { name: "category", in: "query", schema: { type: "string" }, description: "Bags, Watches, Shoes, Scarves, Sunglasses, Belts, Wallets, Ties" },
            { name: "min_price", in: "query", schema: { type: "number" } },
            { name: "max_price", in: "query", schema: { type: "number" } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: MAX_LIMIT, default: 10 } },
            { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
          ],
          responses: {
            "200": {
              description: "Matching products",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                      products: { type: "array", items: Product },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid query" },
            "429": { description: "Rate limit exceeded" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          operationId: "getProduct",
          summary: "Get a product",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "The product", content: { "application/json": { schema: Product } } },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/cart/preview": {
        post: {
          operationId: "previewCart",
          summary: "Price a cart and get a confirmation link for the customer",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items"],
                  properties: {
                    items: {
                      type: "array",
                      minItems: 1,
                      maxItems: MAX_CART_LINES,
                      items: {
                        type: "object",
                        required: ["product_id", "quantity"],
                        properties: {
                          product_id: { type: "string" },
                          quantity: { type: "integer", minimum: 1, maximum: MAX_LINE_QUANTITY },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Priced cart. The customer must open handoff_url to confirm.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      currency: { type: "string" },
                      subtotal: { type: "number" },
                      handoff_url: { type: ["string", "null"], format: "uri" },
                      requires_customer_confirmation: { type: "boolean" },
                      errors: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid request" },
          },
        },
      },
    },
  });
}
