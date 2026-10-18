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
        variant === "row" ? "w-[160px] sm:w-[200px] md:w-[240px] shrink-0" : "w-full"
      }`}
    >
      <div className="relative aspect-[3/4] bg-zinc-900 rounded overflow-hidden mb-2 sm:mb-4">
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
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500 text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">
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
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200
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
          {added ? <Check size={16} className="sm:hidden" /> : <ShoppingBag size={16} className="sm:hidden" />}
          {added ? <Check size={18} className="hidden sm:block" /> : <ShoppingBag size={18} className="hidden sm:block" />}
        </button>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 truncate">
          {product.collection}
        </p>
        <h3 className="text-sm sm:text-base text-white font-light truncate group-hover:text-amber-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-amber-400 text-xs sm:text-sm">
            {formatPrice(current, currency)}
          </span>
          {onSale && original != null && (
            <span className="text-gray-500 text-[10px] sm:text-xs line-through">
              {formatPrice(original, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}