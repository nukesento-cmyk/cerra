"use client";

import { useEffect, useState } from "react";

export function CheckoutClient({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        setState("error");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  useEffect(() => {
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Redirecting to secure payment…</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 space-y-4">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={startCheckout}
        className="w-full py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
      >
        Retry checkout
      </button>
    </div>
  );
}