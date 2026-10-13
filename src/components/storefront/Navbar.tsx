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
    <header className="fixed top-0 inset-x-0 z-50 border-b border-amber-400/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group inline-flex flex-col items-center">
          <span className="font-serif text-3xl md:text-4xl font-medium tracking-wide text-white hover:text-amber-400 transition-colors duration-500">
            Cerrá
          </span>
          <span className="my-1 h-[2px] w-full bg-blue-900 rounded-full" />
          <span className="text-[0.6rem] md:text-xs uppercase tracking-[0.3em] text-blue/80 font-medium">
            Home of Scents
          </span>
        </Link>

        <DesktopNav user={user} />
        <MobileMenu user={user} />
      </div>
    </header>
  );
}
