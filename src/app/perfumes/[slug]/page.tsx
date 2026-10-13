import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { effectivePrice, formatPrice } from "@/lib/currency";
import { getCurrency } from "@/lib/currency-server";
import { Navbar } from "@/components/storefront/Navbar";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export const instant = false;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not found — Cerrá" };
  return {
    title: `${product.name} — Cerrá`,
    description: product.description ?? undefined,
  };
}

export default async function PerfumePage({ params }: { params: Params }) {
  const { slug } = await params;
  const currency = await getCurrency();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) notFound();

  const notes: string[] = product.fragranceNotes
    ? JSON.parse(product.fragranceNotes)
    : [];

  const { current, original, onSale } = effectivePrice(product, currency);

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/collections/${product.collection}`}
              className="hover:text-amber-400 transition-colors capitalize"
            >
              {product.collection}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative aspect-square bg-zinc-900 rounded overflow-hidden">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
              {onSale && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-xs uppercase tracking-wider font-medium">
                  Sale
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-3">
                {product.collection}
              </p>
              <h1 className="text-4xl font-light text-white mb-6">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl text-amber-400">
                  {formatPrice(current, currency)}
                </span>
                {onSale && original != null && (
                  <span className="text-gray-500 text-lg line-through">
                    {formatPrice(original, currency)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-gray-300 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              {notes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                    Notes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {notes.map((note) => (
                      <span
                        key={note}
                        className="px-3 py-1 border border-amber-400/20 text-amber-400/90 text-xs rounded-full capitalize"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 space-y-4">
              <AddToCartButton productId={product.id} />

                <p className="text-gray-500 text-xs text-center">
                  Payment integration in progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}