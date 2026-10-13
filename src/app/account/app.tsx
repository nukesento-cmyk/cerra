import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { AccountPasswordForm } from "@/components/storefront/AccountPasswordForm";

export const instant = false;

export const metadata = { title: "Account — Cerrá" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/?login=1");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true },
  });

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-light text-white mb-2">Account</h1>
            <p className="text-gray-400">
              {user?.name} · {user?.email}
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-light text-white mb-6">Orders</h2>

            {orders.length === 0 ? (
              <div className="border border-amber-400/10 rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">No orders yet.</p>
                <Link
                  href="/collections"
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Browse collections →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-6">
              Change password
            </h2>
            <AccountPasswordForm />
          </section>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

type OrderRowProps = {
  order: {
    id: string;
    status: string;
    total: number;
    currency: string;
    failureReason: string | null;
    createdAt: Date;
    items: {
      id: string;
      quantity: number;
      unitPrice: number;
      product: { name: string; slug: string; imageUrl: string | null };
    }[];
  };
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-400",
  paid: "bg-green-500/10 text-green-400",
  shipped: "bg-blue-500/10 text-blue-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Failed",
};

function OrderRow({ order }: OrderRowProps) {
  return (
    <div className="border border-amber-400/10 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-gray-500 text-xs font-mono">
            {order.id.slice(0, 8)} ·{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            {order.items.length}{" "}
            {order.items.length === 1 ? "item" : "items"} ·{" "}
            {order.currency === "USD"
              ? `$${(order.total / 100).toFixed(2)}`
              : `KSh ${order.total.toLocaleString("en-KE")}`}
          </p>
        </div>
        <span
          className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded ${
            STATUS_STYLES[order.status] ?? "bg-gray-500/10 text-gray-400"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {order.failureReason && (
        <p className="text-red-400 text-sm mb-4 bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
          {order.failureReason}
        </p>
      )}

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 bg-zinc-900 rounded overflow-hidden">
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
                className="text-white text-sm hover:text-amber-400 transition-colors"
              >
                {item.product.name}
              </Link>
              <p className="text-gray-500 text-xs">Qty {item.quantity}</p>
            </div>
            <p className="text-gray-400 text-sm">
              {order.currency === "USD"
                ? `$${(item.unitPrice / 100).toFixed(2)}`
                : `KSh ${item.unitPrice.toLocaleString("en-KE")}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}