"use client";

import { CartProvider } from "./CartContext";
import { CartDrawer } from "./CartDrawer";

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}