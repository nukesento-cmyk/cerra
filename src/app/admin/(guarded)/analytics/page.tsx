import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  dailyRevenue,
  orderStats,
  revenueByCollection,
  revenueInRange,
  totalRevenue,
  emptyTotals,
  addToTotals,
} from "@/lib/revenue";
import { formatMoney, formatMoneyPair } from "@/lib/currency";
import { RevenueChart } from "./RevenueChart";

export const instant = false;
export const metadata = { title: "Analytics — Cerrá Admin" };

export default async function AnalyticsPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(startOfMonth.getTime() - 1);

  const [
    allTime,
    thisMonth,
    lastMonth,
    stats,
    daily,
    topSellers,
    byCollection,
    recentOrders,
  ] = await Promise.all([
    totalRevenue(),
    revenueInRange(startOfMonth, now),
    revenueInRange(startOfLastMonth, endOfLastMonth),
    orderStats(),
    dailyRevenue(30),
    prisma.orderItem.findMany({
      where: { order: { status: "paid" } },
      select: {
        quantity: true,
        unitPrice: true,
        order: { select: { currency: true } },
        product: {
          select: { id: true, name: true, slug: true, imageUrl: true },
        },
      },
    }),
    revenueByCollection(),
    prisma.order.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        total: true,
        currency: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  // Aggregate top sellers by product, per currency
  const topMap = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      units: number;
      usd: number;
      kes: number;
    }
  >();
  for (const item of topSellers) {
    const key = item.product.id;
    const existing =
      topMap.get(key) ??
      {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        units: 0,
        usd: 0,
        kes: 0,
      };
    existing.units += item.quantity;
    const amount = item.unitPrice * item.quantity;
    if (item.order.currency === "USD") existing.usd += amount;
    if (item.order.currency === "KES") existing.kes += amount;
    topMap.set(key, existing);
  }
  const top = Array.from(topMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);

  // Currency totals from collection breakdown
  const collectionTotals = byCollection.reduce(
    (acc, row) => addToTotals(acc, "USD", row.usd),
    emptyTotals(),
  );
  const collectionTotalsKes = byCollection.reduce(
    (acc, row) => addToTotals(acc, "KES", row.kes),
    emptyTotals(),
  );

  const avgOrder = stats.paid
    ? {
        usd: Math.round(allTime.usd / stats.paid),
        kes: Math.round(allTime.kes / stats.paid),
      }
    : { usd: 0, kes: 0 };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-light mb-2">Analytics</h1>
        <p className="text-gray-400 text-sm">
          Revenue, orders, and product performance.
        </p>
      </header>

      {/* Top-level stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard
          label="Total revenue"
          value={formatMoneyPair(allTime)}
          sub={`${stats.paid} paid orders`}
        />
        <StatCard
          label="This month"
          value={formatMoneyPair(thisMonth)}
          sub={`Last month: ${formatMoneyPair(lastMonth)}`}
        />
        <StatCard
          label="Average order"
          value={formatMoneyPair(avgOrder)}
          sub={`Across ${stats.paid} paid orders`}
        />
        <StatCard
          label="Orders"
          value={`${stats.total}`}
          sub={`${stats.paid} paid · ${stats.pending} pending · ${stats.cancelled} failed`}
        />
      </section>

      {/* Chart */}
      <section className="border border-amber-400/20 rounded-lg p-6 mb-10">
        <header className="mb-4">
          <h2 className="text-xl font-light text-white">Last 30 days</h2>
          <p className="text-gray-500 text-sm">
            Paid order revenue per day
          </p>
        </header>
        <RevenueChart data={daily} />
      </section>

      {/* Two-column: top sellers + collection breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <section className="border border-amber-400/20 rounded-lg p-6">
          <h2 className="text-xl font-light text-white mb-5">Top sellers</h2>
          {top.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {top.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-5">
                    {i + 1}.
                  </span>
                  <div className="w-10 h-10 shrink-0 bg-zinc-900 rounded overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products`}
                      className="text-white text-sm hover:text-amber-400 transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    <p className="text-gray-500 text-xs">
                      {p.units} sold
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap">
                    {p.usd > 0 && (
                      <p className="text-amber-400">{formatMoney(p.usd, "USD")}</p>
                    )}
                    {p.kes > 0 && (
                      <p className="text-gray-400">{formatMoney(p.kes, "KES")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border border-amber-400/20 rounded-lg p-6">
          <h2 className="text-xl font-light text-white mb-5">
            Revenue by collection
          </h2>
          {byCollection.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-4">
              {byCollection.map((row) => (
                <div key={row.collection}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white capitalize">
                      {row.collection}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatMoneyPair(row)}
                    </span>
                  </div>
                  <div className="h-1 bg-amber-400/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{
                        width: `${percentOf(
                          row.usd + row.kes,
                          collectionTotals.usd + collectionTotalsKes.kes,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent paid orders */}
      <section className="border border-amber-400/20 rounded-lg overflow-hidden">
        <header className="px-6 py-4 border-b border-amber-400/10">
          <h2 className="text-xl font-light text-white">Recent orders</h2>
        </header>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-8">
            No paid orders yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-400/10 text-gray-400 text-left">
                <th className="px-6 py-3 font-normal">Order</th>
                <th className="px-6 py-3 font-normal">Customer</th>
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-amber-400/5 hover:bg-white/5"
                >
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">
                    {o.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3 text-gray-300">
                    {o.user.name || o.user.email}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 text-right text-amber-400">
                    {formatMoney(o.total, o.currency as "USD" | "KES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border border-amber-400/20 rounded-lg p-5">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-xl font-light text-amber-400 mb-1 break-words">
        {value}
      </p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  );
}

function percentOf(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}