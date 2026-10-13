import { ProductCard, type ProductCardData } from "./ProductCard";
import type { Currency } from "@/lib/currency";

export function ProductRow({
  title,
  subtitle,
  products,
  currency,
  href,
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  currency: Currency;
  href?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <header className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">{title}</h2>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {href && (
            <a
              href={href}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              View all →
            </a>
          )}
        </header>

        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} currency={currency} />
          ))}
        </div>
      </div>
    </section>
  );
}