import Link from "next/link";

type Collection = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
};

export function CollectionTiles({ collections }: { collections: Collection[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <header className="mb-10">
        <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-3">
          Shop by collection
        </p>
        <h2 className="text-3xl font-light text-white">
          Three houses of scent
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={c.href}
            className="group relative block aspect-[3/4] rounded overflow-hidden border border-amber-400/20 hover:border-amber-400/60 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image}
              alt={c.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-light text-white mb-1">
                  {c.name}
                </h3>
                <p className="text-gray-300 text-sm">{c.tagline}</p>
              </div>
              <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}