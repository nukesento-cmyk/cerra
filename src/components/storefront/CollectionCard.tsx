import Link from "next/link";

export function CollectionCard({
  slug,
  name,
  tagline,
  image,
  href,
  // spKes,
  // spUsd,
  // salePriceKes,
  // salePriceUsd,

}: {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
  // spKes: number;
  // spUsd: number;
  // salePriceKes: number | null;
  // salePriceUsd: number | null;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[3/4] rounded overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-light text-white mb-1">{name}</h3>
        <p className="text-gray-300 text-sm">{tagline}</p>
        
      </div>
    </Link>
  );
}