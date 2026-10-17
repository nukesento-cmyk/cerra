import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import {
  DesktopNav,
  MobileMenu,
  type NavUser,
} from "@/components/storefront/NavbarClient";

export async function Navbar() {
  const session = await getSession();

  const user: NavUser = session
    ? {
        id: session.sub,
        email: session.email,
        name: session.email.split("@")[0],
        role: session.role,
      }
    : null;

  return (
    <header className="fixed top-0 inset-x-0 z-[100] isolate border-b border-amber-400/10 bg-black/95 supports-[backdrop-filter]:bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* ---------- Brand ---------- */}
        <Link
          href="/"
          aria-label="Cerrá – Home of Scents"
          className="group relative inline-flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-md px-1"
        >
          {/* Floating scent wisps (decorative) */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <span className="w-1 h-1 rounded-full bg-amber-400/70 animate-wisp" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-amber-400/70 animate-wisp" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-amber-400/70 animate-wisp" style={{ animationDelay: "300ms" }} />
          </span>

          {/* Wordmark — letter-by-letter lift on hover */}
          <span className="font-serif text-3xl md:text-4xl font-medium tracking-wide text-white transition-colors duration-500 group-hover:text-amber-400 inline-flex">
            {"Cerrá".split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {ch}
              </span>
            ))}
          </span>

          {/* Tagline — slides up + widens letter-spacing */}
          <span className="mt-1 text-[0.6rem] md:text-xs uppercase font-medium text-amber-400/70 transition-all duration-500 group-hover:text-amber-400 group-hover:tracking-[0.4em] tracking-[0.3em]">
            Home of Scents
          </span>

          {/* Expanding underline */}
          <span
            aria-hidden
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-px w-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-500 group-hover:w-full"
          />
        </Link>

        <DesktopNav user={user} />
        <MobileMenu user={user} />
      </div>
    </header>
  );
}