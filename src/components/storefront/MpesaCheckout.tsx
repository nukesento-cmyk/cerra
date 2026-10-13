"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Phone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useCart } from "./CartContext";

type Stage = "form" | "pending" | "success" | "failed";

export function MpesaCheckout() {
  const router = useRouter();
  const { clear } = useCart();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not initiate payment");
        return;
      }
      setOrderId(data.orderId);
      setStage("pending");
      startPolling(data.orderId);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  function startPolling(id: string) {
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/mpesa/status?orderId=${id}`);
        const data = await res.json();
        if (data.status === "paid") {
          clearInterval(pollingRef.current!);
          clear();
          setStage("success");
          setTimeout(() => router.push("/checkout/success"), 1500);
        } else if (data.status === "cancelled") {
          clearInterval(pollingRef.current!);
          setStage("failed");
          setError("Payment was cancelled or failed.");
        }
      } catch {
        // keep polling on transient errors
      }
      // Stop after ~2 minutes
      if (attempts > 40) {
        clearInterval(pollingRef.current!);
        setStage("failed");
        setError("Payment timed out. Check your M-Pesa messages.");
      }
    }, 3000);
  }

  if (stage === "pending") {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white mb-2">Check your phone</p>
        <p className="text-gray-400 text-sm">
          Enter your M-Pesa PIN to complete the payment.
        </p>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-4" />
        <p className="text-white">Payment confirmed</p>
      </div>
    );
  }

  if (stage === "failed") {
    return (
      <div className="text-center py-8">
        <XCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p className="text-white mb-2">Payment failed</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => {
            setStage("form");
            setError(null);
          }}
          className="text-amber-400 hover:text-amber-300 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          M-Pesa phone number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            required
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          You&apos;ll receive a prompt on your phone to enter your PIN.
        </p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
      >
        Pay with M-Pesa
      </button>
    </form>
  );
}