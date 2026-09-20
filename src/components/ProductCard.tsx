import { Product } from "@prisma/client";
import Link from "next/link";
import PriceTag from "./PriceTag";
import Image from "next/image";

interface ProductCardProps {
    product: Product
    /** Why the assistant picked this product (AI search only). */
    reason?: string
}

export default function ProductCard({product, reason}: ProductCardProps) {
    const isNew = Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7

   return (
    <Link
    href={"/products/" + product.id}
    className="card w-full bg-base-100 hover:shadow-xl transition-shadow" 
    >
        <figure>
            <Image
              unoptimized
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={400}
              className="h-48 object-cover"
            />
        </figure>
        <div className="card-body">
            <h2 className="card-title">
                {product.name}
            </h2>
            {isNew && <div className="badge badge-secondary">NEW</div>}
            {reason && (
                <p className="rounded bg-primary/10 px-2 py-1 text-sm">
                    <span className="font-semibold">Why: </span>{reason}
                </p>
            )}
            <p>{product.description}</p>
            <PriceTag price={product.price} />
        </div>
    </Link>
   )
}