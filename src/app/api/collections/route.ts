import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

const CollectionInput = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1),
  image: z.string().min(1),
  href: z.string().min(1),
});

export async function GET() {
  const items = await prisma.collectionMeta.findMany({
    orderBy: { slug: "asc" },
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
  const parsed = CollectionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.collectionMeta.create({ data: parsed.data });
    return NextResponse.json(row, { status: 201 });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Collection slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}