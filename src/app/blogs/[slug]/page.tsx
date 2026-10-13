import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export const instant = false;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Not found — Cerrá" };
  return { title: `${post.title} — Cerrá`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/blogs"
            className="text-gray-500 hover:text-amber-400 text-sm transition-colors inline-block mb-8"
          >
            ← All posts
          </Link>

          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6">
            {post.title}
          </h1>
          <p className="text-gray-400 text-lg mb-10">{post.excerpt}</p>

          {post.coverImage && (
            <div className="aspect-video bg-zinc-900 rounded overflow-hidden mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        <SiteFooter />
      </main>
    </>
  );
}