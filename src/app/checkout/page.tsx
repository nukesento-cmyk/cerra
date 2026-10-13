import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { CheckoutClient } from "./CheckoutClient";

export const instant = false;

export const metadata = { title: "Checkout — Cerrá" };

type Search = Promise<{ orderId?: string }>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await getSession();
  if (!session) redirect("/?login=1");

  const { orderId } = await searchParams;
  if (!orderId) redirect("/cart");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
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

  if (!order) redirect("/cart");

  if (order.status === "paid") {
    redirect(`/checkout/success?orderId=${order.id}`);
  }

  const lineItems = order.items.map((item) => ({
    id: item.id,
    name: item.product.name,
    slug: item.product.slug,
    imageUrl: item.product.imageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
            Checkout
          </p>
          <h1 className="text-4xl font-light text-white mb-3">
            Review your order
          </h1>
          <p className="text-gray-400 mb-10">
            You&apos;ll be redirected to Stripe to complete payment.
          </p>

          <div className="border border-amber-400/20 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 shrink-0 bg-zinc-900 rounded overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/perfumes/${item.slug}`}
                      className="text-white hover:text-amber-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-500 text-sm">Qty {item.quantity}</p>
                  </div>
                  <div className="text-gray-300 text-right whitespace-nowrap">
                    ${(item.unitPrice / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-400/10 mt-6 pt-4 flex justify-between">
              <span className="text-white">Total</span>
              <span className="text-amber-400 text-lg font-light">
                ${(order.total / 100).toFixed(2)} {order.currency}
              </span>
            </div>
          </div>

          <CheckoutClient orderId={order.id} />

          <div className="mt-6 text-center">
            <Link
              href="/cart"
              className="text-gray-500 hover:text-amber-400 text-sm transition-colors"
            >
              ← Back to cart
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}