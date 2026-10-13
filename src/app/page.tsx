import { prisma } from "@/lib/db";
import { effectivePrice, formatPrice } from "@/lib/currency";
import { getCurrency } from "@/lib/currency-server";
import { Navbar } from "@/components/storefront/Navbar";
import { Hero } from "@/components/storefront/Hero";
import { CollectionTiles } from "@/components/storefront/CollectionTiles";
import { NoteExplorer, type ExplorerProduct } from "@/components/storefront/NoteExplorer";
import { StoryGlossary } from "@/components/storefront/StoryGlossary";
import { Newsletter } from "@/components/storefront/Newsletter";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export const instant = false;

const MAX_NOTES = 12;

export default async function HomePage() {
  const currency = await getCurrency();

  const [collections, products] = await Promise.all([
    prisma.collectionMeta.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const parsed = products.map((p) => ({
    ...p,
    notes: p.fragranceNotes ? (JSON.parse(p.fragranceNotes) as string[]) : [],
  }));

  const frequency = new Map<string, number>();
  for (const p of parsed) {
    for (const note of p.notes) {
      frequency.set(note, (frequency.get(note) ?? 0) + 1);
    }
  }
  const topNotes = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_NOTES)
    .map(([note]) => note);

  const explorerProducts: ExplorerProduct[] = parsed.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    collection: p.collection,
    imageUrl: p.imageUrl,
    spKes: p.spKes,
    spUsd: p.spUsd,
    salePriceKes: p.salePriceKes,
    salePriceUsd: p.salePriceUsd,
    isOnOffer: p.isOnOffer,
    notes: p.notes,
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <Hero />
        <CollectionTiles collections={collections} />
        <NoteExplorer
          products={explorerProducts}
          notes={topNotes}
          currency={currency}
        />
        <StoryGlossary notes={topNotes} />
        <Newsletter />
        <SiteFooter />
      </main>
    </>
  );
}