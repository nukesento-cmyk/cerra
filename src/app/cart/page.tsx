import Link from "next/link";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { CartPageItems } from "@/components/storefront/CartPageItems";
import { readCart } from "@/lib/cart";
import { prisma } from "@/lib/db";

export const instant = false;

export const metadata = { title: "Cart — Cerrá" };

export default async function CartPage() {
  const cart = await readCart();

  if (cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-dvh bg-black pt-16">
          <div className="mx-auto max-w-2xl px-6 py-24 text-center">
            <h1 className="text-4xl font-light text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-400 mb-8">
              Add a fragrance to get started.
            </p>
            <Link
              href="/collections"
              className="inline-block px-8 py-4 bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
            >
              Explore collections
            </Link>
          </div>
          <SiteFooter />
        </main>
      </>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: cart.items.map((i) => i.productId) },
      isActive: true,
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = cart.items
    .map((i) => {
      const p = byId.get(i.productId);
      if (!p) return null;
      const unit =
        p.isOnOffer && p.salePriceUsd != null ? p.salePriceUsd : p.spUsd;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.imageUrl,
        unitPrice: unit,
        originalPrice:
          p.isOnOffer && p.salePriceUsd != null ? p.spUsd : null,
        quantity: i.quantity,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0,
  );

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-4xl font-light text-white mb-10">Cart</h1>

          <CartPageItems initialLines={lines} initialSubtotal={subtotal} />
        </div>
        <SiteFooter />
      </main>
    </>
  );
}