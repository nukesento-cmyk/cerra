import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { OrderStatusBadge } from "../OrderStatusBadge";
import { OrderActions } from "./OrderActions";

export const instant = false;

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const subtotal = order.items.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/admin/orders"
        className="text-gray-500 hover:text-amber-400 text-sm transition-colors inline-block mb-6"
      >
        ← All orders
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light mb-1">
            Order <span className="font-mono text-xl">{order.id.slice(0, 8)}</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date(order.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {order.failureReason && (
        <div className="mb-8 border border-red-500/20 bg-red-500/5 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{order.failureReason}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <section className="border border-amber-400/20 rounded-lg p-6">
          <h2 className="text-lg font-light text-white mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 bg-zinc-900 rounded overflow-hidden">
                  {item.product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/perfumes/${item.product.slug}`}
                    className="text-white hover:text-amber-400 transition-colors block truncate"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-500 text-sm">
                    Qty {item.quantity} · {formatMoney(item.unitPrice, order.currency as "USD" | "KES")}
                  </p>
                </div>
                <div className="text-right text-gray-300 whitespace-nowrap">
                  {formatMoney(item.unitPrice * item.quantity, order.currency as "USD" | "KES")}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-400/10 mt-6 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">
                {formatMoney(subtotal, order.currency as "USD" | "KES")}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-white">Total</span>
              <span className="text-amber-400">
                {formatMoney(order.total, order.currency as "USD" | "KES")}
              </span>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border border-amber-400/20 rounded-lg p-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Customer
            </h3>
            <p className="text-white">{order.user.name}</p>
            <p className="text-gray-400 text-sm break-all">{order.user.email}</p>
            <p className="text-gray-500 text-xs mt-2 font-mono">
              {order.userId.slice(0, 12)}
            </p>
          </div>

          <div className="border border-amber-400/20 rounded-lg p-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Payment
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Method</dt>
                <dd className="text-white capitalize">{order.paymentMethod ?? "stripe"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Currency</dt>
                <dd className="text-white">{order.currency}</dd>
              </div>
              {order.mpesaReceipt && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">M-Pesa</dt>
                  <dd className="text-white font-mono text-xs">
                    {order.mpesaReceipt}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <OrderActions orderId={order.id} status={order.status} />
        </aside>
      </div>
    </main>
  );
}