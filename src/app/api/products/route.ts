// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

// ---------- Types ----------
type ProductRevenue = {
  units: number;
  usd: number;
  kes: number;
};

type ProductWithRevenue = Awaited<
  ReturnType<typeof prisma.product.findMany>
>[number] & {
  revenue?: ProductRevenue;
};

// ---------- Validation ----------
const ProductInput = z.object({
  sku: z.string().min(1).max(64),
  barcode: z.string().min(1).max(64).optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  collection: z.enum(["women", "men", "unisex"]),
  categoryId: z.string().uuid().optional().nullable(),
  unit: z.string().min(1).max(16).default("ea"),
  bp: z.number().int().nonnegative(),
  spKes: z.number().int().nonnegative().optional(),
  spUsd: z.number().int().nonnegative().optional(),
  salePriceKes: z.number().int().nonnegative().optional().nullable(),
  salePriceUsd: z.number().int().nonnegative().optional().nullable(),
  taxRate: z.number().int().min(0).max(100),
  quantity: z.number().int().min(0),
  reorderLevel: z.number().int().min(0),
  isActive: z.boolean(),
  isTracked: z.boolean(),
  imageUrl: z.string().min(1).optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

// ---------- GET ----------
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const collection = searchParams.get("collection") ?? undefined;
  const active = searchParams.get("active");
  const withRevenue = searchParams.get("withRevenue") === "true";

  const where: Record<string, unknown> = {};
  if (collection) where.collection = collection;
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { barcode: { contains: q } },
      { slug: { contains: q } },
    ];
  }

  const items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  // Fast path — no revenue aggregation requested (or nothing to aggregate).
  if (!withRevenue || items.length === 0) {
    const payload: { items: ProductWithRevenue[]; total: number } = {
      items,
      total: items.length,
    };
    return NextResponse.json(payload);
  }

  // ---------- Revenue aggregation ----------
  const productIds = items.map((p) => p.id);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: { status: "paid" },
    },
    select: {
      productId: true,
      quantity: true,
      unitPrice: true,
      order: { select: { currency: true } },
    },
  });

  const revenueByProduct = new Map<string, ProductRevenue>();
  for (const item of orderItems) {
    const prev =
      revenueByProduct.get(item.productId) ?? { units: 0, usd: 0, kes: 0 };
    prev.units += item.quantity;
    const amt = item.unitPrice * item.quantity;
    if (item.order.currency === "USD") prev.usd += amt;
    if (item.order.currency === "KES") prev.kes += amt;
    revenueByProduct.set(item.productId, prev);
  }

  const itemsWithRevenue: ProductWithRevenue[] = items.map((p) => ({
    ...p,
    revenue: revenueByProduct.get(p.id) ?? { units: 0, usd: 0, kes: 0 },
  }));

  return NextResponse.json({
    items: itemsWithRevenue,
    total: itemsWithRevenue.length,
  });
}

// ---------- POST ----------
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ProductInput.safeParse(body);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "PRODUCT VALIDATION FAILED:",
        JSON.stringify(parsed.error.issues, null, 2),
      );
    }
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(row, { status: 201 });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      const target = (e as { meta?: { target?: string[] } }).meta?.target ?? [];
      return NextResponse.json(
        { error: `Duplicate value for: ${target.join(", ") || "unique field"}` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}