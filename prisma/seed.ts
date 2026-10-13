import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("Skipping admin seed: ADMIN_EMAIL / ADMIN_PASSWORD not set.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME ?? "Administrator",
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.admin,
      mustChangePassword: true,
    },
  });
  console.log(`Seeded admin: ${email}`);
}

async function seedBuyer() {
  const email = "buyer@cerra.com";
  const password = "BuyerPass!2025";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Buyer ${email} already exists — skipping.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: "Test Buyer",
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.buyer,
      mustChangePassword: false,
    },
  });
  console.log(`Seeded buyer: ${email} / ${password}`);
}

async function seedCollections() {
  const defaults = [
    {
      slug: "women",
      name: "Women",
      tagline: "For her.",
      description:
        "Florals, orientals, and modern compositions crafted for presence.",
      image: "/images/collections/women.jpg",
      href: "/collections/women",
    },
    {
      slug: "men",
      name: "Men",
      tagline: "For him.",
      description:
        "Woods, leathers, and bold signatures built on structure.",
      image: "/images/collections/men.jpg",
      href: "/collections/men",
    },
    {
      slug: "unisex",
      name: "Unisex",
      tagline: "Beyond boundaries.",
      description:
        "Compositions that resist category — worn by anyone.",
      image: "/images/collections/unisex.jpg",
      href: "/collections/unisex",
    },
  ];

  for (const c of defaults) {
    await prisma.collectionMeta.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`Seeded ${defaults.length} collections.`);
}

type SeedProduct = {
  sku: string;
  slug: string;
  name: string;
  description: string;
  collection: "women" | "men" | "unisex";
  spKes: number;
  spUsd: number;
  salePriceKes?: number;
  salePriceUsd?: number;
  isBestSeller?: boolean;
  isOnOffer?: boolean;
  isFeatured?: boolean;
  fragranceNotes: string[];
  imageUrl: string;
};

const KES_PER_USD = 130;

function usd(kes: number): number {
  return Math.round((kes / KES_PER_USD) * 100);
}

async function seedPosts() {
    const admin = await prisma.user.findFirst({ where: { role: Role.admin } });
    if (!admin) {
      console.warn("Skipping post seed: no admin found.");
      return;
    }
  
    const posts = [
      {
        slug: "the-art-of-layering",
        title: "The Art of Layering",
        excerpt:
          "Why two fragrances can say more than one — and how to combine them without chaos.",
        content:
          "Layering is not about mixing at random.\n\nStart with a base — something warm, resinous, and quiet. Let it settle for a few minutes. Then apply a brighter, more volatile composition on top. The result should feel intentional: two ideas holding a single conversation.\n\nThree rules we follow at Cerrá:\n\n1. Same family, different altitude. A woody base with a citrus top.\n2. Never three. Two is plenty.\n3. Skin first, clothes second.\n\nTake your time. Layering rewards patience.",
        published: true,
      },
      {
        slug: "why-small-batches",
        title: "Why We Work in Small Batches",
        excerpt:
          "Slow perfume is better perfume. Here is what that means in practice.",
        content:
          "Small batches let us taste every iteration. When we make fifty bottles, we can smell each one before it leaves.\n\nThis is not nostalgia. It is quality control.\n\nLarge runs force compromises — on the grade of the raw materials, on the time we can spend on maceration, on the consistency of the final product. We would rather make less and know it is right.",
        published: false,
      },
    ];
  
    for (const p of posts) {
      await prisma.post.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          ...p,
          publishedAt: p.published ? new Date() : null,
          authorId: admin.id,
        },
      });
    }
    console.log(`Seeded ${posts.length} posts.`);
  }

async function seedProducts() {
  const products: SeedProduct[] = [
    {
      sku: "CER-ML-001",
      slug: "midnight-leather",
      name: "Midnight Leather",
      description:
        "Smoke, leather, and oud wrapped in a modern, nocturnal signature.",
      collection: "unisex",
      spKes: 12500,
      spUsd: usd(12500),
      isBestSeller: true,
      isFeatured: true,
      fragranceNotes: ["bergamot", "leather", "oud", "vanilla"],
      imageUrl: "/images/perfumes/midnight-leather.jpeg",
    },
    {
      sku: "CER-OR-002",
      slug: "oud-royale",
      name: "Oud Royale",
      description:
        "A regal oud composition — rich, resinous, and unapologetically bold.",
      collection: "men",
      spKes: 18000,
      spUsd: usd(18000),
      isBestSeller: true,
      fragranceNotes: ["oud", "saffron", "rose", "amber"],
      imageUrl: "/images/perfumes/oud-royale.jpeg",
    },
    {
      sku: "CER-VR-003",
      slug: "velvet-rose",
      name: "Velvet Rose",
      description:
        "Damask rose softened with musk and a whisper of pink pepper.",
      collection: "women",
      spKes: 9800,
      spUsd: usd(9800),
      salePriceKes: 7500,
      salePriceUsd: usd(7500),
      isOnOffer: true,
      fragranceNotes: ["rose", "pink pepper", "musk", "cedar"],
      imageUrl: "/images/perfumes/velvet-rose.jpeg",
    },
    {
      sku: "CER-NA-004",
      slug: "noir-ambre",
      name: "Noir Ambré",
      description:
        "Amber, tonka, and dark resins — warm, enveloping, nocturnal.",
      collection: "unisex",
      spKes: 14200,
      spUsd: usd(14200),
      isFeatured: true,
      fragranceNotes: ["amber", "tonka bean", "benzoin", "vanilla"],
      imageUrl: "/images/perfumes/midnight-leather.jpeg",
    },
    {
      sku: "CER-BB-005",
      slug: "bergamot-bloom",
      name: "Bergamot Bloom",
      description:
        "Bright citrus lifted by white florals and a clean musk base.",
      collection: "women",
      spKes: 8400,
      spUsd: usd(8400),
      salePriceKes: 6700,
      salePriceUsd: usd(6700),
      isOnOffer: true,
      fragranceNotes: ["bergamot", "jasmine", "white musk", "neroli"],
      imageUrl: "/images/perfumes/velvet-rose.jpeg",
    },
    {
      sku: "CER-SW-006",
      slug: "sahara-wood",
      name: "Sahara Wood",
      description:
        "Dry cedar, sandalwood, and a trace of smoke — desert heat at dusk.",
      collection: "men",
      spKes: 11000,
      spUsd: usd(11000),
      fragranceNotes: ["cedar", "sandalwood", "vetiver", "smoke"],
      imageUrl: "/images/perfumes/oud-royale.jpeg",
    },
    {
      sku: "CER-CS-007",
      slug: "cedar-smoke",
      name: "Cedar & Smoke",
      description:
        "A campfire in a bottle — cedar, birch tar, and a hint of leather.",
      collection: "men",
      spKes: 13500,
      spUsd: usd(13500),
      isBestSeller: true,
      fragranceNotes: ["cedar", "birch tar", "leather", "vetiver"],
      imageUrl: "/images/perfumes/midnight-leather.jpeg",
    },
    {
      sku: "CER-JR-008",
      slug: "jasmine-reverie",
      name: "Jasmine Reverie",
      description:
        "Night-blooming jasmine over warm amber and soft powder.",
      collection: "women",
      spKes: 10200,
      spUsd: usd(10200),
      salePriceKes: 8100,
      salePriceUsd: usd(8100),
      isOnOffer: true,
      fragranceNotes: ["jasmine", "amber", "iris", "musk"],
      imageUrl: "/images/perfumes/velvet-rose.jpeg",
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        description: p.description,
        collection: p.collection,
        unit: "ea",
        spKes: p.spKes,
        spUsd: p.spUsd,
        salePriceKes: p.salePriceKes ?? null,
        salePriceUsd: p.salePriceUsd ?? null,
        bp: Math.round(p.spKes * 0.5),
        taxRate: 16,
        quantity: 20,
        reorderLevel: 5,
        isTracked: true,
        isActive: true,
        isBestSeller: p.isBestSeller ?? false,
        isOnOffer: p.isOnOffer ?? false,
        isFeatured: p.isFeatured ?? false,
        fragranceNotes: JSON.stringify(p.fragranceNotes),
        imageUrl: p.imageUrl,
      },
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

async function seedCategories() {
  const defaults = [
    { name: "Eau de Parfum", slug: "edp" },
    { name: "Eau de Toilette", slug: "edt" },
    { name: "Extrait de Parfum", slug: "extrait" },
    { name: "Body Mist", slug: "body-mist" },
    { name: "Gift Set", slug: "gift-set" },
  ];

  for (const c of defaults) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`Seeded ${defaults.length} categories.`);
}

async function main() {
  await seedAdmin();
  await seedBuyer();
  await seedCategories();
  await seedPosts();
  await seedCollections();
  await seedProducts();
  await seedPosts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());