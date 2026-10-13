const GLOSSARY: Record<string, string> = {
    oud: "Resinous, smoky, warm.",
    bergamot: "Bright citrus, slightly floral.",
    leather: "Animalic, dry, sophisticated.",
    vanilla: "Sweet, warm, comforting.",
    rose: "Floral, rich, timeless.",
    amber: "Warm, resinous, golden.",
    musk: "Soft, skin-like, intimate.",
    jasmine: "Sweet, floral, nocturnal.",
    cedar: "Dry, woody, structured.",
    vetiver: "Earthy, smoky, green.",
  };
  
  export function StoryGlossary({ notes }: { notes: string[] }) {
    // Only show glossary entries for notes that actually appear in the catalog
    const entries = notes
      .filter((n) => GLOSSARY[n])
      .slice(0, 8)
      .map((n) => [n, GLOSSARY[n]] as const);
  
    return (
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-amber-400/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
              Our story
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Cerrá is a small perfume house. We blend in small batches, with a
              short list of ingredients we can name. Nothing more.
            </p>
            <a
              href="/about"
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              Read our story →
            </a>
          </div>
  
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-4">
              Notes glossary
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {entries.map(([note, def]) => (
                <div key={note}>
                  <dt className="text-white text-sm capitalize mb-0.5">
                    {note}
                  </dt>
                  <dd className="text-gray-500 text-xs leading-relaxed">
                    {def}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    );
  }