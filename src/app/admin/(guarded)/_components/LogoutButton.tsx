"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className="text-gray-500 hover:text-amber-400 transition-colors text-sm disabled:opacity-60"
    >
      {loading ? "…" : "Log out"}
    </button>
  );
}