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
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)]"
        />

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
          {/* Header */}
          <header className="mb-16 border-b border-white/5 pb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-amber-400/80">
              Your Account
            </p>
            <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl">
              {user?.name ?? "Welcome"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{user?.email}</p>
          </header>

          {/* Orders */}
          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-light text-white">Order History</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {orders.length === 0
                    ? "Your journey starts here."
                    : `${orders.length} ${
                        orders.length === 1 ? "order" : "orders"
                      } placed`}
                </p>
              </div>
              <Link
                href="/collections"
                className="hidden text-sm text-amber-400 transition-colors hover:text-amber-300 sm:inline"
              >
                Shop now →
              </Link>
            </div>

            {orders.length === 0 ? (
              <EmptyOrders />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>

          {/* Password */}
          <section className="rounded-xl border border-white/5 bg-zinc-950/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white">Security</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update the password used to sign in.
              </p>
            </div>
            <AccountPasswordForm />
          </section>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

/* ---------------------------------- Empty --------------------------------- */

function EmptyOrders() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-zinc-950 to-black p-12 text-center sm:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.06),transparent_70%)]"
      />
      <div className="relative">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/5">
          <svg
            className="h-7 w-7 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.75 21.75H4.25a1.125 1.125 0 01-1.122-1.243l1.263-12A1.125 1.125 0 015.508 7.5h12.984a1.125 1.125 0 011.114 1.007z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-light text-white">No orders yet</h3>
        <p className="mx-auto mb-8 max-w-sm text-sm text-gray-500">
          Discover our curated collection and find your signature scent.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-300"
        >
          Browse Collections
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------- Order --------------------------------- */

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
  pending: "bg-amber-400/10 text-amber-400 ring-amber-400/20",
  paid: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  shipped: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 ring-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Failed",
};

function formatMoney(amount: number, currency: string) {
  return currency === "USD"
    ? `$${(amount / 100).toFixed(2)}`
    : `KSh ${amount.toLocaleString("en-KE")}`;
}

function OrderRow({ order }: OrderRowProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-white/5 bg-zinc-950/40 transition-colors hover:border-white/10">
      {/* Order header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Order
            </p>
            <p className="font-mono text-sm text-gray-300">
              #{order.id.slice(0, 8)}
            </p>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Placed
            </p>
            <p className="text-sm text-gray-300">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-gray-500">
              Total
            </p>
            <p className="text-sm font-medium text-white">
              {formatMoney(order.total, order.currency)}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset ${
              STATUS_STYLES[order.status] ?? "bg-gray-500/10 text-gray-400 ring-gray-500/20"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Failure reason */}
      {order.failureReason && (
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-400">{order.failureReason}</p>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-white/5">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/5">
              {item.product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/perfumes/${item.product.slug}`}
                className="block truncate text-sm font-medium text-white transition-colors hover:text-amber-400"
              >
                {item.product.name}
              </Link>
              <p className="mt-0.5 text-xs text-gray-500">
                Qty {item.quantity} · {formatMoney(item.unitPrice, order.currency)}
              </p>
            </div>

            <p className="shrink-0 text-sm font-medium text-gray-300">
              {formatMoney(item.unitPrice * item.quantity, order.currency)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}