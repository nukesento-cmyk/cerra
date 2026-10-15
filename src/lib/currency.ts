export type Currency = "KES" | "USD";

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "KES") {
    return `KSh ${amount.toLocaleString("en-KE")}`;
  }
  return `$${(amount / 100).toFixed(2)}`;
}

export function effectivePrice(
  product: {
    spKes: number;
    spUsd: number;
    salePriceKes: number | null;
    salePriceUsd: number | null;
    isOnOffer: boolean;
  },
  currency: Currency,
): { current: number; original: number | null; onSale: boolean } {
  if (currency === "KES") {
    if (product.isOnOffer && product.salePriceKes != null) {
      return {
        current: product.salePriceKes,
        original: product.spKes,
        onSale: true,
      };
    }
    return { current: product.spKes, original: null, onSale: false };
  }

  if (product.isOnOffer && product.salePriceUsd != null) {
    return {
      current: product.salePriceUsd,
      original: product.spUsd,
      onSale: true,
    };
  }
  return { current: product.spUsd, original: null, onSale: false };
}

export function formatMoney(amount: number, currency: "USD" | "KES"): string {
  if (currency === "USD") return `$${(amount / 100).toFixed(2)}`;
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function formatMoneyPair(t: { usd: number; kes: number }): string {
  const parts: string[] = [];
  if (t.usd > 0) parts.push(formatMoney(t.usd, "USD"));
  if (t.kes > 0) parts.push(formatMoney(t.kes, "KES"));
  return parts.length ? parts.join(" · ") : "—";
}