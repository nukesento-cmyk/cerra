import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney, formatMoneyPair } from "@/lib/currency";
import { totalRevenue } from "@/lib/revenue";
import { OrderStatusBadge } from "./OrderStatusBadge";

export const instant = false;

export const metadata = { title: "Orders — Cerrá Admin" };

type Search = Promise<{ status?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { status } = await searchParams;

  const where = status ? { status: status as "pending" | "paid" | "shipped" | "delivered" | "cancelled" } : {};

  const [orders, allOrders, revenue] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.findMany({ select: { status: true } }),
    totalRevenue(),
  ]);

  const counts: Record<string, number> = {
    all: allOrders.length,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of allOrders) {
    if (o.status in counts) counts[o.status]++;
  }

  const tabs = [
    { key: "", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "paid", label: "Paid", count: counts.paid },
    { key: "shipped", label: "Shipped", count: counts.shipped },
    { key: "delivered", label: "Delivered", count: counts.delivered },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light mb-1">Orders</h1>
            <p className="text-gray-400 text-sm">
              {counts.all} total · Revenue: {formatMoneyPair(revenue)}
            </p>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const isActive = (status ?? "") === t.key;
          const href = t.key ? `/admin/orders?status=${t.key}` : "/admin/orders";
          return (
            <Link
              key={t.key}
              href={href}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                isActive
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <div className="border border-amber-400/20 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            {status ? `No ${status} orders.` : "No orders yet."}
          </p>
        </div>
      ) : (
        <div className="border border-amber-400/20 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-400/20 text-gray-400 text-left">
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal text-right">Items</th>
                <th className="px-4 py-3 font-normal text-right">Total</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-amber-400/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      {o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="truncate max-w-[180px]">
                      {o.user.name || o.user.email}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                      {o.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-400 whitespace-nowrap">
                    {formatMoney(o.total, o.currency as "USD" | "KES")}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-amber-400 hover:text-amber-300 text-xs transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}