"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminFirstLogin() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      router.push(data.redirectTo ?? "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-gradient-to-br from-zinc-900 to-black border border-amber-400/20 rounded-lg p-8 space-y-6"
      >
        <div>
          <h1 className="text-3xl font-light text-white mb-2">
            Secure your account
          </h1>
          <p className="text-gray-400 text-sm">
            You're using a temporary password. Choose a new one to continue.
          </p>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-60 transition-colors"
        >
          {loading ? "Saving…" : "Save & continue"}
        </button>
      </form>
    </div>
  );
}