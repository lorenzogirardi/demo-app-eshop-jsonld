import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildCartPreview, parseItemsParam, itemsParam } from "@/lib/agentApi";
import { createCart, getCart } from "@/lib/db/cart";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/format";

// A link prepared by an assistant is not a page for search engines.
export const metadata: Metadata = { title: "Review your cart", robots: { index: false, follow: false } };

async function confirmItems(items: string) {
  "use server";
  const lines = parseItemsParam(items);
  const preview = await buildCartPreview(lines);
  const cart = (await getCart()) ?? (await createCart());

  for (const line of preview.items) {
    const existing = cart.items.find((i) => i.productId === line.product.id);
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + line.quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId: line.product.id, quantity: line.quantity } });
    }
  }
  revalidatePath("/cart");
  redirect("/cart");
}

export default async function HandoffPage({ searchParams }: { searchParams: { items?: string } }) {
  const lines = parseItemsParam(searchParams.items);
  const preview = await buildCartPreview(lines);

  if (preview.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-4 text-3xl font-bold">Nothing to review</h1>
        <p>This link has no valid products. Ask the assistant to prepare the cart again.</p>
      </div>
    );
  }

  const confirm = confirmItems.bind(null, itemsParam(preview.items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Review your cart</h1>
      <p className="mb-6 text-sm opacity-70">
        An assistant prepared this list. Nothing is bought until you add it to your cart and check out.
      </p>
      <ul className="divide-y divide-base-300 rounded-lg border border-base-300">
        {preview.items.map((i) => (
          <li key={i.product.id} className="flex items-center justify-between gap-4 p-3">
            <span>
              <a href={`/products/${i.product.id}`} className="link font-semibold">
                {i.product.name}
              </a>
              <span className="block text-sm opacity-70">
                {i.quantity} × {formatPrice(Math.round(i.product.price * 100))}
              </span>
            </span>
            <span className="tabular-nums">{formatPrice(Math.round(i.line_total * 100))}</span>
          </li>
        ))}
      </ul>
      {preview.errors.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-warning" role="status">
          {preview.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-right font-bold">Total: {formatPrice(Math.round(preview.subtotal * 100))}</p>
      <form action={confirm} className="mt-4 flex justify-end">
        <button type="submit" className="btn btn-primary">
          Add to my cart
        </button>
      </form>
    </div>
  );
}
