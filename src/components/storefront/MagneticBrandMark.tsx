"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  href?: string;
  playful?: boolean;
  strength?: number;
  className?: string;
  onClick?: () => void;
};

export function MagneticBrandMark({
  href = "/",
  playful = false,
  strength = 6,
  className = "",
  onClick,
}: Props) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  const state = useRef({
    curX: 0,
    curY: 0,
    tgtX: 0,
    tgtY: 0,
    hover: false,
    glowX: 50,
    glowY: 50,
  });

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reducedMotion) return;

    const s = state.current;

    const tick = () => {
      s.curX += (s.tgtX - s.curX) * 0.15;
      s.curY += (s.tgtY - s.curY) * 0.15;

      el.style.setProperty("--mx", `${s.curX.toFixed(2)}px`);
      el.style.setProperty("--my", `${s.curY.toFixed(2)}px`);
      el.style.setProperty("--gx", `${s.glowX}%`);
      el.style.setProperty("--gy", `${s.glowY}%`);

      const settling =
        Math.abs(s.tgtX - s.curX) > 0.05 ||
        Math.abs(s.tgtY - s.curY) > 0.05;

      if (s.hover || settling) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const startLoop = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onEnter = () => {
      s.hover = true;
      startLoop();
    };

    const onLeave = () => {
      s.hover = false;
      s.tgtX = 0;
      s.tgtY = 0;
      startLoop();
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      const maxDist = Math.max(rect.width, 60) * 0.9;
      const t = Math.max(0, 1 - dist / maxDist);
      const falloff = t * t * (3 - 2 * t);

      s.tgtX = (dx / (dist || 1)) * strength * falloff;
      s.tgtY = (dy / (dist || 1)) * strength * falloff;

      s.glowX = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      s.glowY = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointermove", onMove);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return (
    <Link
      ref={linkRef}
      href={href}
      onClick={onClick}
      aria-label="Cerrá – Home of Scents"
      className={`group relative inline-flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-md px-2 py-1 will-change-transform ${className}`}
      style={{
        transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
        transition: "transform 60ms linear",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(120px circle at var(--gx, 50%) var(--gy, 50%), rgba(251,191,36,0.25), transparent 70%)",
        }}
      />

      {playful && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-amber-400/80 opacity-0 group-hover:opacity-100 animate-wisp"
        />
      )}

      <span className="font-serif text-3xl md:text-4xl font-medium tracking-wide text-white transition-colors duration-500 group-hover:text-amber-400">
        Cerrá
      </span>

      <span className="mt-1 text-[0.6rem] md:text-xs uppercase font-medium tracking-[0.3em] text-amber-400/70 transition-all duration-500 group-hover:text-amber-400 group-hover:tracking-[0.4em]">
        Home of Scents
      </span>
    </Link>
  );
}