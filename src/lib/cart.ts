import "server-only";
import { cookies } from "next/headers";

export const CART_COOKIE = "cerra_cart";

export type CartLine = {
  productId: string;
  quantity: number;
};

export type Cart = {
  items: CartLine[];
};

const MAX_LINES = 50;
const MAX_QTY = 99;

function sanitize(input: unknown): Cart {
  if (!input || typeof input !== "object") return { items: [] };
  const raw = (input as { items?: unknown }).items;
  if (!Array.isArray(raw)) return { items: [] };

  const items: CartLine[] = [];
  for (const item of raw.slice(0, MAX_LINES)) {
    if (!item || typeof item !== "object") continue;
    const productId = (item as { productId?: unknown }).productId;
    const quantity = (item as { quantity?: unknown }).quantity;
    if (typeof productId !== "string" || productId.length === 0) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;
    const q = Math.max(0, Math.min(MAX_QTY, Math.floor(quantity)));
    if (q === 0) continue;
    items.push({ productId, quantity: q });
  }
  return { items };
}

export async function readCart(): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    return sanitize(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return { items: [] };
  }
}

export function serializeCart(cart: Cart): string {
  return encodeURIComponent(JSON.stringify(sanitize(cart)));
}