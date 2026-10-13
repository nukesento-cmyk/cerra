"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export function CartButton({ mobile = false }: { mobile?: boolean }) {
  const { count, open } = useCart();

  return (
    <button
      onClick={open}
      className={`relative flex items-center gap-2 ${
        mobile
          ? "w-full px-4 py-3 text-base text-gray-300 hover:text-amber-400 transition-colors"
          : "text-gray-300 hover:text-amber-400 transition-colors"
      }`}
    >
      <ShoppingBag size={20} />
      {mobile && <span>Cart</span>}
      {count > 0 && (
        <span
          className={`${
            mobile
              ? "ml-auto bg-amber-400 text-black text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
              : "absolute -top-2 -right-3 bg-amber-400 text-black text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}