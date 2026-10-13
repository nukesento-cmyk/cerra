"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { AuthButtons } from "@/components/storefront/AuthButtons";
import { CartButton } from "@/components/storefront/CartButton";


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

function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-gray-300 hover:text-amber-400 transition-colors py-5"
        aria-expanded={open}
      >
        Perfume Collections
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full min-w-[200px] bg-zinc-900 border border-amber-400/20 rounded-md shadow-lg overflow-hidden z-50">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block px-4 py-3 text-sm text-gray-300 hover:bg-amber-400/10 hover:text-amber-400 transition-colors"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/collections"
            className="block px-4 py-3 text-sm text-amber-400 hover:bg-amber-400/10 border-t border-amber-400/10 transition-colors"
          >
            All collections →
          </Link>
        </div>
      )}
    </div>
  );
}

export function DesktopNav({ user }: { user: NavUser }) {
  const { logout } = useLogout();

  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link
        href="/"
        className="text-sm text-gray-300 hover:text-amber-400 transition-colors"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="text-sm text-gray-300 hover:text-amber-400 transition-colors"
      >
        About
      </Link>
      <CollectionsDropdown />
      <Link
        href="/blogs"
        className="text-sm text-gray-300 hover:text-amber-400 transition-colors"
      >
        Blogs
      </Link>
      <Link
        href="/contact"
        className="text-sm text-gray-300 hover:text-amber-400 transition-colors"
      >
        Contact
      </Link>

      <span className="w-px h-5 bg-amber-400/20" />

      <CartButton />

      {user ? (
        <>
          {user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Admin
            </Link>
          )}
          <Link
            href="/account"
            className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
            title={user.email}
          >
            <UserIcon size={18} />
          </Link>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-amber-400 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </>
      ) : (
        <AuthButtons />
      )}
    </nav>
  );
}

export function MobileMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useLogout();

  useEffect(() => {
    setOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden text-gray-300 hover:text-amber-400 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="flex items-center justify-between px-6 h-16 border-b border-amber-400/10">
            <span className="text-xl font-light tracking-widest text-white">
              CERRÁ
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col py-4">
            {MAIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-6 py-4 text-lg text-gray-300 hover:text-amber-400 border-b border-amber-400/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-b border-amber-400/5">
              <button
                onClick={() => setCollectionsOpen((v) => !v)}
                className="w-full px-6 py-4 text-lg text-gray-300 hover:text-amber-400 flex items-center justify-between transition-colors"
              >
                Perfume Collections
                <ChevronDown
                  size={16}
                  className={`transition-transform ${collectionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {collectionsOpen && (
                <div className="pl-4">
                  {COLLECTIONS.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-6 py-3 text-base text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-b border-amber-400/5">
              <CartButton mobile />
            </div>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-4 text-lg text-amber-400 border-b border-amber-400/5 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="px-6 py-4 text-lg text-gray-300 hover:text-amber-400 border-b border-amber-400/5 transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="px-6 py-4 text-lg text-gray-300 hover:text-amber-400 text-left transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="px-6 py-4 space-y-2">
                <AuthButtons mobile />
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function useLogout() {
  const router = useRouter();
  return {
    logout: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    },
  };
}