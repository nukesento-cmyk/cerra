"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export function AddToCartButton({
  productId,
  disabled = false,
  className = "",
}: {
  productId: string;
  disabled?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add(productId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 font-medium tracking-wide transition-colors flex items-center justify-center gap-2 ${
        disabled
          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
          : added
            ? "bg-green-500 text-white"
            : "bg-amber-400 text-black hover:bg-amber-300"
      } ${className}`}
    >
      {added ? (
        <>
          <Check size={18} /> Added
        </>
      ) : (
        <>
          <ShoppingBag size={18} /> Add to cart
        </>
      )}
    </button>
  );
}