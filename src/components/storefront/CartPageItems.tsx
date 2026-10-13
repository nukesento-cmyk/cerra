"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { MpesaCheckout } from "./MpesaCheckout";

type Line = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  originalPrice: number | null;
  quantity: number;
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartPageItems({
  initialLines,
  initialSubtotal: _initialSubtotal,
}: {
  initialLines: Line[];
  initialSubtotal: number;
}) {
  const { setQuantity, remove, items } = useCart();
  const [method, setMethod] = useState<"stripe" | "mpesa">("stripe");

  // Merge server-rendered lines with current client cart state.
  // If the client removed a line, it disappears here immediately.
  const lines = initialLines
    .map((line) => {
      const clientLine = items.find((i) => i.productId === line.id);
      if (!clientLine) return null;
      return { ...line, quantity: clientLine.quantity };
    })
    .filter((l): l is Line => l !== null);

  const subtotal = lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0,
  );

  if (lines.length === 0) {
    return (
      <div className="border border-amber-400/10 rounded-lg p-16 text-center">
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <Link
          href="/collections"
          className="text-amber-400 hover:text-amber-300 transition-colors"
        >
          Continue shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
      {/* Item list */}
      <div className="space-y-6">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex gap-4 py-6 border-b border-amber-400/10"
          >
            <Link
              href={`/perfumes/${line.slug}`}
              className="w-24 h-24 shrink-0 bg-zinc-900 rounded overflow-hidden"
            >
              {line.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/perfumes/${line.slug}`}
                className="text-white font-light hover:text-amber-400 transition-colors"
              >
                {line.name}
              </Link>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-amber-400 text-sm">
                  {formatUsd(line.unitPrice)}
                </span>
                {line.originalPrice != null && (
                  <span className="text-gray-500 text-xs line-through">
                    {formatUsd(line.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border border-gray-700 rounded">
                  <button
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-white text-sm">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => remove(line.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>

            <div className="text-white text-right whitespace-nowrap">
              {formatUsd(line.unitPrice * line.quantity)}
            </div>
          </div>
        ))}

        <Link
          href="/collections"
          className="inline-block text-gray-400 hover:text-amber-400 text-sm transition-colors"
        >
          ← Continue shopping
        </Link>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 h-fit border border-amber-400/20 rounded-lg p-6 space-y-5">
        <h2 className="text-lg font-light text-white">Summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">{formatUsd(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shipping</span>
            <span className="text-gray-500 text-xs self-center">
              Calculated at checkout
            </span>
          </div>
        </div>

        <div className="border-t border-amber-400/10 pt-4 flex justify-between">
          <span className="text-white">Total</span>
          <span className="text-amber-400 text-lg font-light">
            {formatUsd(subtotal)}
          </span>
        </div>

        {/* Payment method toggle */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            Payment method
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`flex-1 py-2.5 text-sm rounded border transition-colors ${
                method === "stripe"
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => setMethod("mpesa")}
              className={`flex-1 py-2.5 text-sm rounded border transition-colors ${
                method === "mpesa"
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              M-Pesa
            </button>
          </div>
        </div>

        {method === "stripe" ? <StripeCheckoutButton /> : <MpesaCheckout />}

        <p className="text-gray-500 text-xs text-center">
          Secure checkout · Ships worldwide
        </p>
      </aside>
    </div>
  );
}

function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/?login=1";
          return;
        }
        setError(data.error ?? "Checkout failed");
        return;
      }
      window.location.href = `/checkout?orderId=${data.orderId}`;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={onClick}
        disabled={loading}
        className="w-full py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-60 transition-colors"
      >
        {loading ? "Redirecting…" : "Proceed to checkout"}
      </button>
      {error && (
        <p className="text-red-400 text-xs text-center" role="alert">
          {error}
        </p>
      )}
    </>
  );
}