import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";
export const instant = false;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-dvh">
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2070&auto=format&fit=crop')",
              filter: "brightness(0.35) contrast(1.15) saturate(0.85)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />

          <div className="relative z-10 max-w-4xl px-6 text-center">
            <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-neutral-400 mb-6">
              Maison de Parfum
            </p>
            <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white">
              The Scent of
              <span className="block italic font-light text-neutral-300">
                Silence
              </span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
              Cerrà composes fragrances the way a poet writes — with restraint,
              with intention, and with the belief that the most memorable
              impression is the one that lingers just out of reach.
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />
          </div>
        </section>

        {/* Intro / Manifesto */}
        <section className="max-w-5xl mx-auto px-6 md:px-12 py-32 md:py-48">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-8">
            Our Philosophy
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-medium leading-[1.15] text-white">
            A fragrance is not worn — it is
            <span className="italic text-neutral-400"> remembered</span>. We
            build scent like memory: in{" "}
            <span className="italic text-neutral-400">layers</span>, in{" "}
            <span className="italic text-neutral-400">shadow</span>, and in the
            spaces between notes.
          </h2>
        </section>

        {/* Editorial Grid — Perfume Bottle + Text */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="relative overflow-hidden rounded-sm aspect-[4/5] group">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2070&auto=format&fit=crop"
              alt="Perfume bottle in dramatic light"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              style={{
                filter: "brightness(0.6) contrast(1.15) saturate(0.75)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-6">
              Chapter I — Origins
            </p>
            <h3 className="font-serif text-3xl md:text-5xl font-medium leading-tight text-white mb-8">
              Born from stillness
            </h3>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">
              Cerrà began in a small atelier in Grasse — far from the noise of
              the commercial fragrance world. What started as a pursuit of a
              single perfect accord became a meditation on memory, on skin, on
              the way scent becomes inseparable from the self.
            </p>
            <p className="text-neutral-400 font-light leading-relaxed">
              Every formula is composed by hand, aged in darkness, and bottled
              in limited quantities. Not because we cannot scale — but because
              we refuse to dilute the soul of the house.
            </p>
            <div className="mt-10 border-l border-neutral-800 pl-6">
              <p className="font-serif italic text-lg text-neutral-300">
                "The finest perfume does not announce itself. It is noticed only
                when it has already left the room."
              </p>
            </div>
          </div>
        </section>

        {/* Full-bleed image break */}
        <section className="relative h-[70vh] w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2070&auto=format&fit=crop"
            alt="Dark perfume bottle with smoke"
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.4) contrast(1.2) saturate(0.7)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="font-serif italic text-2xl md:text-4xl text-neutral-200 text-center max-w-3xl leading-relaxed">
              "In the dark, the notes reveal themselves — one by one, like
              memories returning."
            </p>
          </div>
        </section>

        {/* Second editorial — reversed */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-32 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="order-2 md:order-1">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-6">
              Chapter II — Composition
            </p>
            <h3 className="font-serif text-3xl md:text-5xl font-medium leading-tight text-white mb-8">
              Layered like memory
            </h3>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">
              Each Cerrà fragrance unfolds in three movements — a bright
              opening, a shadowed heart, and a base that lingers on skin for
              hours. We work with raw absolutes, rare oud, cold-pressed citrus,
              and resins aged in oak.
            </p>
            <p className="text-neutral-400 font-light leading-relaxed">
              Our ateliers produce fewer than 500 bottles per composition. Each
              one is numbered, sealed, and released only when it has fully
              matured — never a day sooner.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-neutral-900 pt-8">
              <div>
                <p className="font-serif text-3xl text-white">3</p>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">
                  Compositions
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">500</p>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">
                  Bottles / Release
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">∞</p>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">
                  Sillage
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-sm aspect-[4/5] group order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=2070&auto=format&fit=crop"
              alt="Perfume bottle with soft shadows"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              style={{
                filter: "brightness(0.6) contrast(1.15) saturate(0.75)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          </div>
        </section>

        {/* The Collection — 3 perfume cards */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-neutral-900">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-6">
              The Collection
            </p>
            <h3 className="font-serif text-4xl md:text-6xl font-medium text-white">
              Three <span className="italic text-neutral-400">studies</span> in
              shadow
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: "Noir Absolu",
                notes: "Oud · Black Pepper · Vetiver",
                img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2070&auto=format&fit=crop",
              },
              {
                name: "Ombre de Rose",
                notes: "Damask Rose · Incense · Musk",
                img: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=2070&auto=format&fit=crop",
              },
              {
                name: "Cuir Cendré",
                notes: "Suede · Tobacco · Amber",
                img: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=2070&auto=format&fit=crop",
              },
            ].map((frag) => (
              <div key={frag.name} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-sm aspect-[3/4] mb-6">
                  <img
                    src={frag.img}
                    alt={frag.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    style={{
                      filter: "brightness(0.6) contrast(1.15) saturate(0.75)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </div>
                <h4 className="font-serif text-2xl text-white mb-2">
                  {frag.name}
                </h4>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                  {frag.notes}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing / CTA */}
        <section className="border-t border-neutral-900">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-32 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-8">
              A Quiet Invitation
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-medium leading-tight text-white mb-10">
              Discover your{" "}
              <span className="italic text-neutral-400">signature</span>
            </h2>
            <p className="text-neutral-400 font-light leading-relaxed max-w-xl mx-auto mb-12">
              Order a discovery set and let the fragrances choose you. Each vial
              is a door — some will open, some will stay closed. That is the
              point.
            </p>
            <a
              href="/collections"
              className="inline-block px-12 py-4 border border-neutral-700 text-sm uppercase tracking-[0.3em] text-neutral-200 hover:bg-white hover:text-black transition-colors duration-500"
            >
              Explore the Collection
            </a>
          </div>
        </section>

        <SiteFooter />

      </main>
    </>
  );
}