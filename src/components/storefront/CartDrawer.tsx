"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartContext";

type DrawerProduct = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  spUsd: number;
  salePriceUsd: number | null;
  isOnOffer: boolean;
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function unitPrice(p: DrawerProduct): number {
  if (p.isOnOffer && p.salePriceUsd != null) return p.salePriceUsd;
  return p.spUsd;
}

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const [products, setProducts] = useState<DrawerProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch product data when the drawer opens
  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const ids = items.map((i) => i.productId).join(",");
    fetch(`/api/cart/products?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, items]);

  // Close on Escape
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, close]);

  // Build lines: join cart items with fetched product data
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items
    .map((i) => {
      const product = byId.get(i.productId);
      return product ? { product, quantity: i.quantity } : null;
    })
    .filter((l): l is { product: DrawerProduct; quantity: number } => l !== null);

  const subtotal = lines.reduce(
    (sum, l) => sum + unitPrice(l.product) * l.quantity,
    0,
  );

  const totalCount = items.reduce((n, i) => n + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-amber-400/20 flex flex-col">
        <header className="flex items-center justify-between px-6 h-16 border-b border-amber-400/10">
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag size={18} />
            <span className="font-light">Cart ({totalCount})</span>
          </div>
          <button
            onClick={close}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={40} className="text-gray-700 mb-4" />
            <p className="text-gray-400 mb-6">Your cart is empty.</p>
            <button
              onClick={close}
              className="px-6 py-3 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              Continue shopping
            </button>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading…</p>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-gray-400 mb-6">
              Some items in your cart are no longer available.
            </p>
            <button
              onClick={close}
              className="px-6 py-3 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4">
                  <Link
                    href={`/perfumes/${product.slug}`}
                    onClick={close}
                    className="w-20 h-20 shrink-0 bg-zinc-900 rounded overflow-hidden"
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/perfumes/${product.slug}`}
                      onClick={close}
                      className="text-white text-sm font-light hover:text-amber-400 transition-colors block truncate"
                    >
                      {product.name}
                    </Link>
                    <p className="text-amber-400 text-sm mt-1">
                      {formatUsd(unitPrice(product))}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-700 rounded">
                        <button
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-white text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => remove(product.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-amber-400/10 px-6 py-6 space-y-4">
              <div className="flex items-center justify-between text-white">
                <span className="text-sm text-gray-400">Subtotal</span>
                <span className="text-lg font-light">
                  {formatUsd(subtotal)}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                Shipping and taxes calculated at checkout.
              </p>

              <Link
                href="/cart"
                onClick={close}
                className="block w-full py-3 text-center border border-amber-400/40 text-amber-400 hover:border-amber-400 transition-colors text-sm"
              >
                View full cart
              </Link>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full py-3 text-center bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
              >
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}