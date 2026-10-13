import Link from "next/link";
import { effectivePrice, formatPrice } from "@/lib/currency";
import { getCurrency } from "@/lib/currency-server";
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
  const { current, original, onSale } = effectivePrice(product, currency);

  return (
        <Link
        href={`/perfumes/${product.slug}`}
        className={`group block ${
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