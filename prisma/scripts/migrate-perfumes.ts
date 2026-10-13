import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KES_PER_USD = 130; // rough, for initial seed only — admin will correct

function slugToSku(slug: string): string {
  return `MIG-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14)}`;
}

async function main() {
  const perfumes = await prisma.perfume.findMany();
  console.log(`Found ${perfumes.length} perfumes to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const p of perfumes) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });
    if (existing) {
      console.log(`  Skipping ${p.slug} — already exists in Product.`);
      skipped++;
      continue;
    }

    const sku = slugToSku(p.slug);
    const spKes = p.priceValue; // legacy value treated as KES
    const spUsd = Math.round((p.priceValue / KES_PER_USD) * 100);

    try {
      await prisma.product.create({
        data: {
          sku,
          name: p.name,
          slug: p.slug,
          description: p.description,
          collection: p.collection,
          unit: "ea",
          spKes,
          spUsd,
          bp: Math.round(spKes * 0.5),
          taxRate: 16,
          quantity: 20,
          reorderLevel: 5,
          isActive: true,
          isTracked: true,
          fragranceNotes: p.notes,
          imageUrl: p.imageUrl,
        },
      });
      console.log(`  Migrated ${p.slug}`);
      migrated++;
    } catch (e) {
      console.error(`  Failed on ${p.slug}:`, e);
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());