import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

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

  return NextResponse.json({ items, total: items.length });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ProductInput.safeParse(body);
  if (!parsed.success) {
    console.log("PRODUCT VALIDATION FAILED:", JSON.stringify(parsed.error.issues, null, 2));
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