"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AuthButtons({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function openLogin() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("login", "1");
    params.delete("register");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openRegister() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("register", "1");
    params.delete("login");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const base = mobile ? "w-full text-left px-4 py-3 text-base" : "text-sm";

  return (
    <>
      <button
        onClick={openLogin}
        className={`${base} text-gray-300 hover:text-amber-400 transition-colors`}
      >
        Sign In
      </button>
      <button
        onClick={openRegister}
        className={
          mobile
            ? "w-full px-4 py-3 bg-amber-400 text-black text-base font-medium hover:bg-amber-300 transition-colors text-left"
            : "px-4 py-2 bg-amber-400 text-black text-sm font-medium hover:bg-amber-300 transition-colors"
        }
      >
        Register
      </button>
    </>
  );
}