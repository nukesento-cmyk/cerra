"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not subscribe.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <h2 className="text-3xl font-light text-white mb-3">Join the list</h2>
      <p className="text-gray-400 mb-8">
        Early access to new drops. No noise.
      </p>

      {state === "done" ? (
        <p className="text-amber-400">
          You&apos;re on the list. We&apos;ll be in touch.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="px-6 py-3 bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-60 transition-colors"
          >
            {state === "loading" ? "Joining…" : "Join"}
          </button>
        </form>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-3" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}