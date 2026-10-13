import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

const CollectionUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  tagline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
});

type Ctx = { params: Promise<{ slug: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await req.json();
  const parsed = CollectionUpdate.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.collectionMeta.update({
      where: { slug },
      data: parsed.data,
    });
    return NextResponse.json(row);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  try {
    await prisma.collectionMeta.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}