"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      onClose();
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center px-4 py-8 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-gradient-to-br from-zinc-900 to-black border border-amber-400/20 rounded-lg p-6 sm:p-8 max-w-md w-full my-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-light text-white mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="block text-sm text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm" role="alert">
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 text-black font-medium tracking-wide hover:bg-amber-300 transition-colors disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Register
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}