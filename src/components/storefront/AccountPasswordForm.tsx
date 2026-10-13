"use client";

import { useState } from "react";

export function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
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
    <form
      onSubmit={onSubmit}
      className="border border-amber-400/10 rounded-lg p-6 space-y-5 max-w-md"
    >
      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Current password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
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
          required
          className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
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
          required
          className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white focus:outline-none focus:border-amber-400 transition-colors"
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
  );
}