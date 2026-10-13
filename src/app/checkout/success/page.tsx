import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ClearCartOnMount } from "@/components/storefront/ClearCartOnMount";

export const instant = false;

export const metadata = { title: "Order — Cerrá" };

type Search = Promise<{ session_id?: string; orderId?: string }>;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { session_id, orderId: orderIdParam } = await searchParams;

  if (session_id) {
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    } catch {
      return <ErrorState message="We couldn't verify this payment session." />;
    }

    const orderId = checkoutSession.metadata?.orderId;
    if (!orderId) {
      return <ErrorState message="Missing order reference on payment session." />;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.sub },
    });
    if (!order) {
      return <ErrorState message="Order not found." />;
    }

    const paid = checkoutSession.payment_status === "paid";

    if (paid && order.status !== "paid") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", failureReason: null },
      });
    }

    if (!paid) {
      return (
        <PendingState message="Payment is still processing. This can take a moment." />
      );
    }

    return (
      <ConfirmedState
        orderId={order.id}
        total={order.total}
        currency={order.currency}
        clearCart
      />
    );
  }

  if (orderIdParam) {
    const order = await prisma.order.findFirst({
      where: { id: orderIdParam, userId: session.sub },
    });
    if (!order) return <ErrorState message="Order not found." />;
    if (order.status !== "paid") {
      return <PendingState message="This order has not been paid yet." />;
    }
    return (
      <ConfirmedState
        orderId={order.id}
        total={order.total}
        currency={order.currency}
      />
    );
  }

  redirect("/cart");
}

function ConfirmedState({
  orderId,
  total,
  currency,
  clearCart = false,
}: {
  orderId: string;
  total: number;
  currency: string;
  clearCart?: boolean;
}) {
  return (
    <>
      <Navbar />
      {clearCart && <ClearCartOnMount />}
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
            Order confirmed
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6">
            Thank you.
          </h1>
          <p className="text-gray-400 mb-3">
            We&apos;ve received your order and will be in touch soon.
          </p>
          <p className="text-gray-500 text-sm mb-10">
            Order {orderId.slice(0, 8)} · ${(total / 100).toFixed(2)} {currency}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/account"
              className="px-8 py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              View account
            </Link>
            <Link
              href="/collections"
              className="px-8 py-4 border border-amber-400/40 text-amber-400 hover:border-amber-400 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

function PendingState({ message }: { message: string }) {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
            Payment pending
          </p>
          <h1 className="text-3xl font-light text-white mb-4">Almost there.</h1>
          <p className="text-gray-400 mb-10">{message}</p>
          <Link
            href="/account"
            className="px-8 py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
          >
            View account
          </Link>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-red-400 text-xs uppercase tracking-[0.3em] mb-4">
            Something went wrong
          </p>
          <h1 className="text-3xl font-light text-white mb-4">
            We couldn&apos;t confirm your order.
          </h1>
          <p className="text-gray-400 mb-10">{message}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cart"
              className="px-8 py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              Back to cart
            </Link>
            <a
              href="mailto:hello@cerra.com"
              className="px-8 py-4 border border-amber-400/40 text-amber-400 hover:border-amber-400 transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}