import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth/session";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNAUTHENTICATED";
    const status = msg === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 413 },
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported type. Use JPEG, PNG, WebP, or AVIF." },
      { status: 415 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `products/${crypto.randomUUID()}.${ext}`;

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
