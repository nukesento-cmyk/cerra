"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: "shipped" | "delivered" | "cancelled") {
    if (!confirm(`Mark this order as ${next}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-amber-400/20 rounded-lg p-6">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
        Actions
      </h3>
      <div className="space-y-2">
        {status === "paid" && (
          <button
            onClick={() => setStatus("shipped")}
            disabled={busy}
            className="w-full py-2 bg-amber-400 text-black text-sm font-medium hover:bg-amber-300 disabled:opacity-60 transition-colors rounded"
          >
            Mark as shipped
          </button>
        )}
        {status === "shipped" && (
          <button
            onClick={() => setStatus("delivered")}
            disabled={busy}
            className="w-full py-2 bg-green-500 text-white text-sm font-medium hover:bg-green-400 disabled:opacity-60 transition-colors rounded"
          >
            Mark as delivered
          </button>
        )}
        {(status === "paid" || status === "shipped") && (
          <button
            onClick={() => setStatus("cancelled")}
            disabled={busy}
            className="w-full py-2 border border-red-500/40 text-red-400 text-sm hover:border-red-500 disabled:opacity-60 transition-colors rounded"
          >
            Cancel order
          </button>
        )}
        {(status === "cancelled" || status === "delivered") && (
          <p className="text-gray-500 text-xs">
            No further actions available.
          </p>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
}