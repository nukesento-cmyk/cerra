import "server-only";
import { headers } from "next/headers";
import type { Currency } from "./currency";

export async function getCurrency(): Promise<Currency> {
  if (process.env.FORCE_CURRENCY === "KES") return "KES";
  if (process.env.FORCE_CURRENCY === "USD") return "USD";

  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  return country === "KE" ? "KES" : "USD";
}