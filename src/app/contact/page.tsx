import { Navbar } from "@/components/storefront/Navbar";
import { SiteFooter } from "@/components/storefront/SiteFooter";

export const instant = false;

export const metadata = { title: "Contact — Cerrá" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh bg-black pt-16">
        {/* Hero — Contact */}
        <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2070&auto=format&fit=crop')",
              filter: "brightness(0.3) contrast(1.15) saturate(0.85)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

          <div className="relative z-10 max-w-3xl px-6 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-400/80 mb-6">
              Get in touch
            </p>
            <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white">
              Let's <span className="italic font-light text-neutral-300">talk</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
              Whether you're seeking a signature scent, a private consultation,
              or a bespoke composition — we'd love to hear from you.
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-amber-400/60 to-transparent" />
          </div>
        </section>

        {/* Contact Grid — Details + Form */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left — Details */}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-8">
              Reach us directly
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight text-white mb-12">
              Every message is
              <span className="italic text-neutral-400"> read by hand</span>
            </h2>

            <div className="space-y-10">
              {/* Email */}
              <div className="border-l border-amber-400/30 pl-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                  Email
                </p>
                <a
                  href="mailto:hello@cerra.com"
                  className="font-serif text-2xl text-white hover:text-amber-400 transition-colors duration-300"
                >
                  hello@cerra.com
                </a>
              </div>

              {/* WhatsApp */}
              <div className="border-l border-amber-400/30 pl-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/254"
                  className="font-serif text-2xl text-white hover:text-amber-400 transition-colors duration-300"
                >
                  +254 708 919 211
                </a>
              </div>

              {/* Studio */}
              <div className="border-l border-amber-400/30 pl-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                  Studio
                </p>
                <p className="font-serif text-2xl text-white">Nairobi, Kenya</p>
                <p className="text-sm text-neutral-500 mt-2 font-light">
                  By appointment only
                </p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2070&auto=format&fit=crop"
                alt="Perfume bottle"
                className="w-full h-full object-cover absolute inset-0"
                style={{
                  filter: "brightness(0.4) contrast(1.15) saturate(0.7)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />

              <form className="relative z-10 p-8 md:p-12 space-y-8">
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Amara N."
                    className="w-full bg-transparent border-b border-neutral-700 focus:border-amber-400 outline-none py-3 text-white placeholder:text-neutral-600 transition-colors duration-300 font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-b border-neutral-700 focus:border-amber-400 outline-none py-3 text-white placeholder:text-neutral-600 transition-colors duration-300 font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you're looking for..."
                    className="w-full bg-transparent border-b border-neutral-700 focus:border-amber-400 outline-none py-3 text-white placeholder:text-neutral-600 transition-colors duration-300 font-light resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 border border-amber-400/60 text-xs uppercase tracking-[0.3em] text-amber-400 hover:bg-amber-400 hover:text-black transition-colors duration-500"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Closing quote */}
        <section className="relative h-[50vh] w-full overflow-hidden border-t border-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2070&auto=format&fit=crop"
            alt="Perfume in shadow"
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.35) contrast(1.2) saturate(0.7)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="font-serif italic text-2xl md:text-4xl text-neutral-200 text-center max-w-3xl leading-relaxed">
              "Some conversations begin before a single word is spoken."
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}