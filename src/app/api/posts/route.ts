import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { PostCreateSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "true";

  const items = await prisma.post.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ items, total: items.length });
}
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  
  const data = parsed.data;
  try {
    const row = await prisma.post.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        authorId: session.sub,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "A post with that slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}