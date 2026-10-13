import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const perfumes = await prisma.perfume.findMany();
  console.log(`Found ${perfumes.length} perfumes to migrate.`);

  for (const p of perfumes) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`Skipping ${p.slug} — already in Product.`);
      continue;
    }

    const sku = `MIG-${p.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}`;

    await prisma.product.create({
      data: {
        sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        collection: p.collection,
        unit: "ea",
        spKes: p.priceValue,             // legacy priceValue treated as KES
        spUsd: Math.round(p.priceValue * 0.77),  // rough conversion, admin fixes later
        bp: Math.round(p.priceValue * 0.5),
        taxRate: 16,
        quantity: 0,
        reorderLevel: 0,
        isActive: true,
        isTracked: true,
        fragranceNotes: p.notes,
        imageUrl: p.imageUrl,
      },
    });
    console.log(`Migrated ${p.slug}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());