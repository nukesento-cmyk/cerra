import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ items: [] });

  const ids = idsParam.split(",").filter(Boolean).slice(0, 50);
  if (ids.length === 0) return NextResponse.json({ items: [] });

  const items = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      spUsd: true,
      salePriceUsd: true,
      isOnOffer: true,
    },
  });

  return NextResponse.json({ items });
}