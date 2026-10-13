import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

const ProductUpdate = z.object({
  sku: z.string().min(1).max(64).optional(),
  barcode: z.string().min(1).max(64).optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  collection: z.enum(["women", "men", "unisex"]).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  unit: z.string().min(1).max(16).optional(),
  spKes: z.number().int().nonnegative().optional(),
  spUsd: z.number().int().nonnegative().optional(),
  salePriceKes: z.number().int().nonnegative().optional().nullable(),
  salePriceUsd: z.number().int().nonnegative().optional().nullable(),
  bp: z.number().int().nonnegative().optional(),
  taxRate: z.number().int().min(0).max(100).optional(),
  quantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isTracked: z.boolean().optional(),
  imageUrl: z.string().min(1).optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ProductUpdate.safeParse(body);
  if (!parsed.success) {
    console.log("PRODUCT VALIDATION FAILED:", JSON.stringify(parsed.error.issues, null, 2));
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(row);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (code === "P2002") return NextResponse.json({ error: "Duplicate unique value" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}