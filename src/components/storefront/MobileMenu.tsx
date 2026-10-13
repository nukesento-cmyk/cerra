"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { AuthButtons } from "./AuthButtons";
import { useCart } from "./CartContext";

export type NavUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "buyer";
} | null;

const COLLECTIONS = [
  { label: "Women Collection", href: "/collections/women" },
  { label: "Men Collection", href: "/collections/men" },
  { label: "Unisex", href: "/collections/unisex" },
];

const MAIN_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

export function MobileMenu({ user }: { user: NavUser }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const panel = open && (
    <div className="fixed inset-0 z-[999] lg:hidden">
      {/* Blurred backdrop — shows the page behind, blurred */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={() => setOpen(false)}
      />

      {/* Panel — semi-transparent so the blur shows through */}
      <div className="relative h-full w-full flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 border-b border-amber-400/10 bg-black/40 backdrop-blur-md">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-xl font-light tracking-widest text-white"
          >
            CERRÁ
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-200 hover:text-white transition-colors p-2 -mr-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 bg-black/30 backdrop-blur-md">
          {MAIN_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-lg text-gray-100 hover:text-amber-400 border-b border-amber-400/5 transition-colors block"
            >
              {l.label}
            </Link>
          ))}

          <div className="border-b border-amber-400/5">
            <button
              onClick={() => setCollectionsOpen((v) => !v)}
              className="w-full px-6 py-4 text-lg text-gray-100 hover:text-amber-400 flex items-center justify-between transition-colors"
            >
              Perfume Collections
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  collectionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {collectionsOpen && (
              <div className="pl-4 pb-2">
                {COLLECTIONS.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="block px-6 py-3 text-base text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="px-6 py-4 text-lg text-gray-100 hover:text-amber-400 border-b border-amber-400/5 flex items-center justify-between transition-colors"
          >
            <span>Cart</span>
            {count > 0 && (
              <span className="bg-amber-400 text-black text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setOpen(false)}
                  className="block px-6 py-4 text-lg text-amber-400 border-b border-amber-400/5 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block px-6 py-4 text-lg text-gray-100 hover:text-amber-400 border-b border-amber-400/5 transition-colors"
              >
                Account
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-6 py-4 text-lg text-gray-100 hover:text-amber-400 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="px-6 py-4 space-y-3">
              <AuthButtons mobile />
            </div>
          )}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden text-gray-300 hover:text-amber-400 transition-colors p-2 -mr-2"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}