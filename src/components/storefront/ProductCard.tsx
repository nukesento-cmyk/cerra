"use client";

import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { effectivePrice, formatPrice, type Currency } from "@/lib/currency";
import { useCart } from "./CartContext";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  imageUrl: string | null;
  spKes: number;
  spUsd: number;
  salePriceKes: number | null;
  salePriceUsd: number | null;
  isOnOffer: boolean;
};

export function ProductCard({
  product,
  currency,
  variant = "row",
}: {
  product: ProductCardData;
  currency: Currency;
  variant?: "row" | "grid";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const { current, original, onSale } = effectivePrice(product, currency);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/perfumes/${product.slug}`}
      className={`group block relative ${
        variant === "row" ? "w-[240px] shrink-0" : "w-full"
      }`}
    >
      <div className="relative aspect-[3/4] bg-zinc-900 rounded overflow-hidden mb-4">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}

        {onSale && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] uppercase tracking-wider font-medium">
            Sale
          </span>
        )}

        {/* Quick-add button:
            - hidden by default, shown on group-hover (desktop)
            - always shown on coarse pointers (mobile/touch) */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${
              added
                ? "bg-green-500 text-white opacity-100"
                : "bg-amber-400 text-black hover:bg-amber-300"
            }
            opacity-0 translate-y-2
            group-hover:opacity-100 group-hover:translate-y-0
            pointer-fine:opacity-0 pointer-fine:translate-y-2 pointer-fine:group-hover:opacity-100 pointer-fine:group-hover:translate-y-0
            pointer-coarse:opacity-100 pointer-coarse:translate-y-0
          `}
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          {product.collection}
        </p>
        <h3 className="text-white font-light truncate group-hover:text-amber-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-amber-400 text-sm">
            {formatPrice(current, currency)}
          </span>
          {onSale && original != null && (
            <span className="text-gray-500 text-xs line-through">
              {formatPrice(original, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}