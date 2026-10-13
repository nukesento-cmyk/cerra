import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export const instant = false;

export const metadata = { title: "Checkout cancelled — Cerrá" };

type Search = Promise<{ orderId?: string }>;

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await getSession();
  const { orderId } = await searchParams;

  // Mark the order as cancelled if it belongs to this user and is still pending
  if (session && orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.sub },
      select: { id: true, status: true },
    });
    if (order && order.status === "pending") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          failureReason: "Cancelled by customer.",
        },
      });
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4">
            Checkout cancelled
          </p>
          <h1 className="text-3xl font-light text-white mb-6">
            No charge was made.
          </h1>
          <p className="text-gray-400 mb-10">
            Your cart is still saved. You can complete your order whenever
            you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cart"
              className="px-8 py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              Return to cart
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