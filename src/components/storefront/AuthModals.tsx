"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";

export function AuthModals() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const loginOpen = searchParams.get("login") === "1";
  const registerOpen = searchParams.get("register") === "1";

  function close() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("register");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function switchToRegister() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.set("register", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function switchToLogin() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("register");
    params.set("login", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <LoginModal
        isOpen={loginOpen}
        onClose={close}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={close}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}