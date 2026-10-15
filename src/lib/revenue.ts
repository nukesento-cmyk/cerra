import "server-only";
import { prisma } from "./db";

export type CurrencyTotals = {
  usd: number; // cents
  kes: number; // whole shillings
};

export function emptyTotals(): CurrencyTotals {
  return { usd: 0, kes: 0 };
}

export function addToTotals(t: CurrencyTotals, currency: string, amount: number): CurrencyTotals {
  if (currency === "USD") return { ...t, usd: t.usd + amount };
  if (currency === "KES") return { ...t, kes: t.kes + amount };
  return t;
}

/** Total revenue across all paid orders. */
export async function totalRevenue(): Promise<CurrencyTotals> {
  const orders = await prisma.order.findMany({
    where: { status: "paid" },
    select: { total: true, currency: true },
  });
  return orders.reduce(
    (acc, o) => addToTotals(acc, o.currency, o.total),
    emptyTotals(),
  );
}

/** Revenue for paid orders created in the given window. */
export async function revenueInRange(from: Date, to: Date): Promise<CurrencyTotals> {
  const orders = await prisma.order.findMany({
    where: { status: "paid", createdAt: { gte: from, lte: to } },
    select: { total: true, currency: true },
  });
  return orders.reduce(
    (acc, o) => addToTotals(acc, o.currency, o.total),
    emptyTotals(),
  );
}

/** Order status counts. */
export async function orderStats() {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count._all;
  return {
    pending: counts.pending ?? 0,
    paid: counts.paid ?? 0,
    shipped: counts.shipped ?? 0,
    delivered: counts.delivered ?? 0,
    cancelled: counts.cancelled ?? 0,
    total: Object.values(counts).reduce((n, c) => n + c, 0),
  };
}

/** Paid orders bucketed by day for the last N days. */
export async function dailyRevenue(days: number): Promise<
  { date: string; usd: number; kes: number }[]
> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: "paid", createdAt: { gte: from } },
    select: { total: true, currency: true, createdAt: true },
  });

  const buckets = new Map<string, CurrencyTotals>();
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, emptyTotals());
  }

  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const prev = buckets.get(key) ?? emptyTotals();
    buckets.set(key, addToTotals(prev, o.currency, o.total));
  }

  return Array.from(buckets.entries()).map(([date, t]) => ({
    date,
    usd: t.usd,
    kes: t.kes,
  }));
}

/** Top products by units sold and revenue, over paid orders. */
export async function topProducts(limit: number) {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: "paid" } },
    _sum: { quantity: true, unitPrice: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((r) => r.productId) } },
    select: { id: true, name: true, slug: true, imageUrl: true, collection: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  return rows
    .map((r) => {
      const p = byId.get(r.productId);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        collection: p.collection,
        unitsSold: r._sum.quantity ?? 0,
        revenueMinor: r._sum.unitPrice ?? 0, // NOTE: only valid if all orders same currency
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/** Revenue broken down by collection. */
export async function revenueByCollection() {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: "paid" } },
    select: {
      quantity: true,
      unitPrice: true,
      order: { select: { currency: true } },
      product: { select: { collection: true } },
    },
  });

  const map = new Map<string, CurrencyTotals>();
  for (const it of items) {
    const key = it.product.collection;
    const prev = map.get(key) ?? emptyTotals();
    const amount = it.unitPrice * it.quantity;
    map.set(key, addToTotals(prev, it.order.currency, amount));
  }

  return Array.from(map.entries()).map(([collection, totals]) => ({
    collection,
    ...totals,
  }));
}