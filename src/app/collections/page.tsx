import { prisma } from "@/lib/db";

import { Navbar } from "@/components/storefront/Navbar";
import { CollectionCard } from "@/components/storefront/CollectionCard";

export const instant = false;

export const metadata = {
  title: "Collections — Cerrá",
  description: "Explore our fragrance collections.",
};

export default async function CollectionsPage() {
  const collections = await prisma.collectionMeta.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <header className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
            Explore
          </p>
          <h1 className="text-5xl font-light text-white mb-4">Collections</h1>
          <p className="text-gray-400 max-w-xl">
            Three houses of scent. Each one a distinct character.
          </p>
        </header>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          {collections.length === 0 ? (
            <p className="text-gray-500">No collections yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((c) => (
                <CollectionCard
                  key={c.slug}
                  slug={c.slug}
                  name={c.name}
                  tagline={c.tagline}
                  image={c.image}
                  href={c.href}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}