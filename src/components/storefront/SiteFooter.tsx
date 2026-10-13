import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Women", href: "/collections/women" },
      { label: "Men", href: "/collections/men" },
      { label: "Unisex", href: "/collections/unisex" },
      { label: "All", href: "/collections" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Notes glossary", href: "/notes" },
      { label: "Journal", href: "/journal" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Stockists", href: "/stockists" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "WhatsApp", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "hello@cerra.com", href: "mailto:hello@cerra.com" },
      { label: "Nairobi, Kenya", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/5">
      {/* Watermark — sits behind everything, no layout space */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
      >
        <span className="whitespace-nowrap text-[28vw] leading-none font-extralight tracking-tighter text-white/[0.03] sm:text-[20vw]">
          C errá
        </span>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-amber-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-600">
            © 2026 Cerrá. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">
            Secure checkout · Ships worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}