"use client";

import Link from "next/link";
import { motion } from "motion/react";

const HEADLINE_WORDS = ["Scent,", "considered."];

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Background media */}
      <div className="absolute inset-0">
        {/* Mobile: static image (hidden on md+) */}
        <img
          src="/images/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        />

        {/* Tablet & desktop: background video (hidden below md) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
        >
          <source src="/videos/spray.webm" type="video/webm" />
        </video>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-32 w-full">
        <div className="ml-auto max-w-2xl text-left flex flex-col items-start md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-6"
          >
            Cerrá · Nairobi
          </motion.p>

          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 flex flex-wrap justify-start md:justify-end">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="inline-block mr-4 last:mr-0"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.15 }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            style={{ transformOrigin: "left" }}
            className="h-px w-24 bg-amber-400 mb-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-300 text-lg mb-10 text-left md:text-right"
          >
            Small-batch fragrances, made slowly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-wrap gap-4 justify-start md:justify-end"
          >
            <Link
              href="/collections"
              className="px-8 py-4 bg-amber-400 text-black font-medium tracking-wide hover:bg-amber-300 transition-colors"
            >
              Explore the collection
            </Link>
            <a
              href="#note-picker"
              className="px-8 py-4 border border-amber-400/60 text-amber-400 hover:border-amber-400 hover:bg-amber-400/5 transition-colors"
            >
              Find your scent
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}