"use client";

import { useEffect, useState } from "react";

type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminAccountPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not change password");
        return;
      }
      setSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-light mb-2">Account</h1>
        <p className="text-gray-400">
          {me?.name ?? "…"} · {me?.email ?? "…"}
        </p>
      </header>

      <section className="border border-amber-400/20 rounded-lg p-8">
        <h2 className="text-xl mb-6">Change password</h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}