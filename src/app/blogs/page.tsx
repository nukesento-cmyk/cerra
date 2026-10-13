import Link from "next/link";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export const instant = false;

export const metadata = {
  title: "Blog — Cerrá",
  description: "Notes, stories, and slow craft from the house of Cerrá.",
};

export default async function BlogsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        <header className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
            Journal
          </p>
          <h1 className="text-5xl font-light text-white mb-4">Blog</h1>
          <p className="text-gray-400 max-w-xl">
            Notes, stories, and slow craft.
          </p>
        </header>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          {posts.length === 0 ? (
            <div className="border border-amber-400/10 rounded-lg p-16 text-center">
              <p className="text-gray-400">No posts published yet.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blogs/${p.slug}`}
                  className="group grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start"
                >
                  <div className="aspect-video md:aspect-square bg-zinc-900 rounded overflow-hidden">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                    <h2 className="text-2xl font-light text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {p.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-3">
                      {p.excerpt}
                    </p>
                    <span className="text-amber-400 text-sm">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <SiteFooter />
      </main>
    </>
  );
}