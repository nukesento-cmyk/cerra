"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { effectivePrice, formatPrice, type Currency } from "@/lib/currency";

export type ExplorerProduct = {
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
  notes: string[];   // parsed server-side
};

export function NoteExplorer({
  products,
  notes,
  currency,
}: {
  products: ExplorerProduct[];
  notes: string[];
  currency: Currency;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return products;
    return products.filter((p) =>
      // AND semantics: every selected note must be present
      selected.every((n) => p.notes.includes(n)),
    );
  }, [products, selected]);

  function toggle(note: string) {
    setSelected((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note],
    );
  }

  function clear() {
    setSelected([]);
  }

  return (
    <section id="note-picker" className="mx-auto max-w-7xl px-6 py-20">
      <header className="text-center mb-10">
        <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-3">
          Find your scent
        </p>
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          What are you in the mood for?
        </h2>
        <p className="text-gray-500 text-sm">
          Select notes to narrow the collection
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {notes.map((note) => {
          const active = selected.includes(note);
          return (
            <button
              key={note}
              onClick={() => toggle(note)}
              className={`px-4 py-2 rounded-full border text-sm transition-colors capitalize ${
                active
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              {note}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="text-center mb-10">
          <p className="text-gray-500 text-sm mb-2">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
          <button
            onClick={clear}
            className="text-amber-400 hover:text-amber-300 text-sm underline-offset-4 hover:underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border border-amber-400/10 rounded-lg p-16 text-center max-w-2xl mx-auto">
          <p className="text-gray-400 mb-4">
            No perfumes match those notes.
          </p>
          <button
            onClick={clear}
            className="text-amber-400 hover:text-amber-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ExplorerCard key={p.id} product={p} currency={currency} />
          ))}
        </div>
      )}
    </section>
  );
}

function ExplorerCard({
  product,
  currency,
}: {
  product: ExplorerProduct;
  currency: Currency;
}) {
  const { current, original, onSale } = effectivePrice(product, currency);
  const shownNotes = product.notes.slice(0, 3);

  return (
    <Link
      href={`/perfumes/${product.slug}`}
      className="group block border border-transparent hover:border-amber-400/40 rounded overflow-hidden transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative aspect-square bg-zinc-900 overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
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

      <div className="p-4">
        <h3 className="text-white font-light mb-1 group-hover:text-amber-400 transition-colors truncate">
          {product.name}
        </h3>
        {shownNotes.length > 0 && (
          <p className="text-gray-500 text-xs mb-3 truncate capitalize">
            {shownNotes.join(" · ")}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-amber-400 text-sm">
            {formatPrice(current, currency)}
          </span>
          {onSale && original != null && (
            <span className="text-gray-600 text-xs line-through">
              {formatPrice(original, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}