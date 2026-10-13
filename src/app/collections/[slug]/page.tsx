import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { effectivePrice, formatPrice } from "@/lib/currency";
import { getCurrency } from "@/lib/currency-server";
import { Navbar } from "@/components/storefront/Navbar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SortSelect } from "@/components/storefront/SortSelect";

export const instant = false;

type Params = Promise<{ slug: string }>;
type Search = Promise<{ sort?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = await prisma.collectionMeta.findUnique({
    where: { slug },
  });
  if (!collection) return { title: "Not found — Cerrá" };
  return {
    title: `${collection.name} — Cerrá`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const currency = await getCurrency();

  const collection = await prisma.collectionMeta.findUnique({
    where: { slug },
  });
  if (!collection) notFound();

  const orderBy =
    sort === "price-asc"
      ? { spKes: "asc" as const }
      : sort === "price-desc"
        ? { spKes: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: { isActive: true, collection: slug },
    orderBy,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <header className="relative h-[40vh] min-h-[320px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.image}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-10 mx-auto max-w-7xl">
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-3">
              Collection
            </p>
            <h1 className="text-5xl font-light text-white mb-2">
              {collection.name}
            </h1>
            <p className="text-gray-300 max-w-xl">{collection.tagline}</p>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-500 text-sm">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <SortSelect />
          </div>

          {products.length === 0 ? (
            <div className="border border-amber-400/10 rounded-lg p-16 text-center">
              <p className="text-gray-400">No products in this collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} currency={currency} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}