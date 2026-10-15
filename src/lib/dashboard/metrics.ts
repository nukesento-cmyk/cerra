// lib/dashboard/metrics.ts
import { prisma } from "@/lib/db";
import { totalRevenue, revenueInRange } from "@/lib/revenue";

export type RangeKey = "24h" | "7d" | "30d" | "90d" | "ytd";

export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "24h", label: "24h", days: 1 },
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "ytd", label: "YTD", days: 0 }, // computed
];

export function resolveRange(key: RangeKey, now = new Date()) {
  const end = now;
  let start: Date;
  if (key === "ytd") start = new Date(now.getFullYear(), 0, 1);
  else {
    const days = RANGES.find((r) => r.key === key)?.days ?? 30;
    start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
  const spanMs = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - spanMs);
  const prevEnd = start;
  return { start, end, prevStart, prevEnd };
}

export type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

export async function getDashboardMetrics(range: RangeKey = "30d") {
  const now = new Date();
  const { start, end, prevStart, prevEnd } = resolveRange(range, now);

  const [
    productCount,
    collectionCount,
    postCount,
    orderCount,
    revenue,
    periodRevenue,
    prevRevenue,
    periodOrders,
    prevOrders,
    lowStockCount,
    pendingOrderCount,
    draftPostCount,
    recentOrders,
    recentPosts,
    dailySeries,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.collectionMeta.count(),
    prisma.post.count(),
    prisma.order.count(),
    totalRevenue(),
    revenueInRange(start, end),
    revenueInRange(prevStart, prevEnd),
    prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.order.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { published: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, total: true, currency: true, status: true, createdAt: true, email: true },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true, published: true },
    }),
    // Daily revenue buckets for the sparkline. Adjust the raw SQL to your schema.
    prisma.$queryRaw<{ day: Date; total: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, SUM("total")::float AS total
      FROM "Order"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const periodAov = periodOrders > 0 ? periodRevenue / periodOrders : 0;
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  return {
    range,
    generatedAt: now,
    counts: {
      products: productCount,
      collections: collectionCount,
      posts: postCount,
      orders: orderCount,
    },
    revenue: {
      total: revenue,
      period: periodRevenue,
      prevPeriod: prevRevenue,
      delta: pctDelta(periodRevenue, prevRevenue),
      series: fillDailySeries(dailySeries, start, end),
    },
    orders: {
      period: periodOrders,
      prevPeriod: prevOrders,
      delta: pctDelta(periodOrders, prevOrders),
      aov: periodAov,
      aovDelta: pctDelta(periodAov, prevAov),
      pending: pendingOrderCount,
    },
    attention: {
      lowStock: lowStockCount,
      pendingOrders: pendingOrderCount,
      draftPosts: draftPostCount,
    },
    recent: {
      orders: recentOrders,
      posts: recentPosts,
    },
  };
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function fillDailySeries(
  rows: { day: Date; total: number }[],
  start: Date,
  end: Date,
) {
  const byDay = new Map(
    rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.total)]),
  );
  const out: number[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const stop = new Date(end);
  stop.setHours(0, 0, 0, 0);
  while (cursor <= stop) {
    out.push(byDay.get(cursor.toISOString().slice(0, 10)) ?? 0);
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}