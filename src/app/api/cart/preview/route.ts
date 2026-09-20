import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_CART_LINES, MAX_LINE_QUANTITY, buildCartPreview } from "@/lib/agentApi";

const Body = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1).max(20),
        quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
      })
    )
    .min(1)
    .max(MAX_CART_LINES),
});

/** Prices a cart and returns a link for the customer to confirm. It does not create or modify any cart. */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 400 }
    );
  }
  return NextResponse.json(await buildCartPreview(parsed.data.items));
}
