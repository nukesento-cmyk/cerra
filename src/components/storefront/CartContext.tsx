"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const CART_COOKIE = "cerra_cart";
const MAX_QTY = 99;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  count: number;
  ready: boolean;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartState | null>(null);

function readCookie(): CartLine[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CART_COOKIE}=`));
  if (!match) return [];
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter(
      (i: unknown) =>
        i &&
        typeof i === "object" &&
        typeof (i as CartLine).productId === "string" &&
        typeof (i as CartLine).quantity === "number" &&
        (i as CartLine).quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeCookie(items: CartLine[]) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ items }));
  document.cookie = `${CART_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Read on mount (SSR can't read document.cookie)
  useEffect(() => {
    setItems(readCookie());
    setReady(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!ready) return;
    writeCookie(items);
  }, [items, ready]);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + qty) }
            : i,
        );
      }
      return [...prev, { productId, quantity: Math.min(MAX_QTY, qty) }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      const clamped = Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
      if (clamped === 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: clamped } : i,
      );
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    return {
      items,
      count,
      ready,
      add,
      remove,
      setQuantity,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, ready, add, remove, setQuantity, clear, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}