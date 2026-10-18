"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import { AuthButtons } from "@/components/storefront/AuthButtons";
import { useCart } from "@/components/storefront/CartContext";
import { MagneticBrandMark } from "@/components/storefront/MagneticBrandMark";

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

/* -------------------------------------------------------------------------- */
/*                              Active helper                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns true when `href` matches the current path.
 * - "/" only matches exactly (so it doesn't stay active everywhere).
 * - Other hrefs match exactly OR as a parent of a nested route.
 */
function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* -------------------------------------------------------------------------- */
/*                            Collections dropdown                            */
/* -------------------------------------------------------------------------- */

function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const collectionsActive = COLLECTIONS.some((c) =>
    isActivePath(pathname, c.href)
  );
  const allActive = isActivePath(pathname, "/collections");

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="collections-menu"
        className={`relative flex items-center gap-1 text-sm transition-colors py-5 touch-manipulation ${
          collectionsActive
            ? "text-amber-400"
            : "text-gray-300 hover:text-amber-400"
        }`}
      >
        Perfume Collections
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        {/* Active underline */}
        <span
          aria-hidden
          className={`pointer-events-none absolute left-0 right-0 -bottom-0 h-px bg-amber-400 transition-all duration-300 ${
            collectionsActive ? "opacity-100 w-full" : "opacity-0 w-0"
          }`}
        />
      </button>

      {open && (
        <div
          id="collections-menu"
          className="absolute left-0 top-full min-w-[200px] bg-zinc-900 border border-amber-400/20 rounded-md shadow-lg overflow-hidden z-[110]"
        >
          {COLLECTIONS.map((c) => {
            const active = isActivePath(pathname, c.href);
            return (
              <Link
                key={c.href}
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={`block px-4 py-3 text-sm transition-colors ${
                  active
                    ? "text-amber-400 bg-amber-400/10 border-l-2 border-amber-400"
                    : "text-gray-300 hover:bg-amber-400/10 hover:text-amber-400"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
          <Link
            href="/collections"
            aria-current={allActive ? "page" : undefined}
            className={`block px-4 py-3 text-sm transition-colors border-t border-amber-400/10 ${
              allActive
                ? "text-amber-400 bg-amber-400/10"
                : "text-amber-400 hover:bg-amber-400/10"
            }`}
          >
            All collections →
          </Link>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Shared logout                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                          Cart button (shared)                              */
/* -------------------------------------------------------------------------- */

export function CartButton({ mobile = false }: { mobile?: boolean }) {
  const { count } = useCart();
  const pathname = usePathname();
  const active = isActivePath(pathname, "/cart");

  if (mobile) {
    return (
      <Link
        href="/cart"
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-between w-full text-lg transition-colors ${
          active ? "text-amber-400" : "text-gray-100 hover:text-amber-400"
        }`}
      >
        <span>Cart</span>
        {count > 0 && (
          <span className="bg-amber-400 text-black text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      aria-current={active ? "page" : undefined}
      className={`relative transition-colors ${
        active ? "text-amber-400" : "text-gray-300 hover:text-amber-400"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Desktop nav                                 */
/* -------------------------------------------------------------------------- */

export function DesktopNav({ user }: { user: NavUser }) {
  const { logout } = useLogout();
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {MAIN_LINKS.map((l) => {
        const active = isActivePath(pathname, l.href);
        return (
          <Fragment key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative text-sm transition-colors ${
                active
                  ? "text-amber-400"
                  : "text-gray-300 hover:text-amber-400"
              }`}
            >
              {l.label}
              {/* Active underline */}
              <span
                aria-hidden
                className={`pointer-events-none absolute left-0 right-0 -bottom-1 h-px bg-amber-400 transition-all duration-300 ${
                  active ? "opacity-100 w-full" : "opacity-0 w-0"
                }`}
              />
            </Link>
            {l.href === "/about" && <CollectionsDropdown />}
          </Fragment>
        );
      })}

      <span className="w-px h-5 bg-amber-400/20" />

      <CartButton />

      {user ? (
        <>
          <Link
            href="/account"
            title={user.email}
            aria-current={
              isActivePath(pathname, "/account") ? "page" : undefined
            }
            className={`text-sm transition-colors ${
              isActivePath(pathname, "/account")
                ? "text-amber-400"
                : "text-gray-400 hover:text-amber-400"
            }`}
          >
            <UserIcon size={18} />
          </Link>
          <button
            type="button"
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

/* -------------------------------------------------------------------------- */
/*                                Mobile menu                                 */
/* -------------------------------------------------------------------------- */

export function MobileMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useLogout();

  const collectionsActive = COLLECTIONS.some((c) =>
    isActivePath(pathname, c.href)
  );

  useEffect(() => {
    setOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const panel = open && (
    <div
      className="fixed inset-0 z-[999] lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={() => setOpen(false)}
      />

      <div className="relative h-full w-full flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 border-b border-amber-400/10 bg-black/40 backdrop-blur-md">
          <MagneticBrandMark href="/" onClick={() => setOpen(false)} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-200 hover:text-white transition-colors p-2 -mr-2 touch-manipulation"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 bg-black/30 backdrop-blur-md">
          {MAIN_LINKS.map((l) => {
            const active = isActivePath(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`px-6 py-4 text-lg border-b border-amber-400/5 transition-colors block border-l-2 ${
                  active
                    ? "text-amber-400 border-l-amber-400 bg-amber-400/5"
                    : "text-gray-100 hover:text-amber-400 border-l-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          <div className="border-b border-amber-400/5">
            <button
              type="button"
              onClick={() => setCollectionsOpen((v) => !v)}
              aria-expanded={collectionsOpen}
              aria-controls="mobile-collections"
              className={`w-full px-6 py-4 text-lg flex items-center justify-between transition-colors touch-manipulation border-l-2 ${
                collectionsActive
                  ? "text-amber-400 border-l-amber-400 bg-amber-400/5"
                  : "text-gray-100 hover:text-amber-400 border-l-transparent"
              }`}
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
              <div id="mobile-collections" className="pl-4 pb-2">
                {COLLECTIONS.map((c) => {
                  const active = isActivePath(pathname, c.href);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block px-6 py-3 text-base transition-colors border-l-2 ${
                        active
                          ? "text-amber-400 border-l-amber-400"
                          : "text-gray-300 hover:text-amber-400 border-l-transparent"
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
                <Link
                  href="/collections"
                  onClick={() => setOpen(false)}
                  aria-current={
                    isActivePath(pathname, "/collections")
                      ? "page"
                      : undefined
                  }
                  className={`block px-6 py-3 text-base transition-colors border-l-2 ${
                    isActivePath(pathname, "/collections")
                      ? "text-amber-400 border-l-amber-400"
                      : "text-amber-400 hover:text-amber-300 border-l-transparent"
                  }`}
                >
                  All collections →
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                aria-current={
                  isActivePath(pathname, "/account") ? "page" : undefined
                }
                className={`block px-6 py-4 text-lg border-b border-amber-400/5 transition-colors border-l-2 ${
                  isActivePath(pathname, "/account")
                    ? "text-amber-400 border-l-amber-400 bg-amber-400/5"
                    : "text-gray-100 hover:text-amber-400 border-l-transparent"
                }`}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-6 py-4 text-lg text-gray-100 hover:text-amber-400 transition-colors touch-manipulation"
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
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden relative z-[101] text-gray-300 hover:text-amber-400 transition-colors p-2 -mr-2 touch-manipulation"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}