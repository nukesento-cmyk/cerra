"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  User as UserIcon,
  X,
} from "lucide-react";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Blog", href: "/admin/posts", icon: BookOpen },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Account", href: "/admin/account", icon: UserIcon },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open + close on Esc
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const panel = open && (
    <div
      className="fixed inset-0 z-[999]"
      role="dialog"
      aria-modal="true"
      aria-label="Admin navigation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel from the right */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-black/90 backdrop-blur-md border-l border-amber-400/20 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 border-b border-amber-400/10">
          <span className="text-lg font-light tracking-wide">
            Cerrá <span className="text-amber-400">Admin</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-200 hover:text-white transition-colors p-2 -mr-2 touch-manipulation"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {ADMIN_LINKS.map((l) => {
            const active = isActivePath(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-6 py-4 text-lg border-b border-amber-400/5 border-l-2 transition-colors ${
                  active
                    ? "text-amber-400 border-l-amber-400 bg-amber-400/5"
                    : "text-gray-100 hover:text-amber-400 border-l-transparent"
                }`}
              >
                <l.icon size={18} />
                {l.label}
              </Link>
            );
          })}

          <div className="px-6 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-amber-400 transition-colors"
            >
              View site ↗
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-gray-300 hover:text-amber-400 transition-colors p-2 -mr-2 touch-manipulation"
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls="admin-menu"
      >
        <Menu size={24} />
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}