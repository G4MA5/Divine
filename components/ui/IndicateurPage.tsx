"use client";

import { useEffect, useState } from "react";
import { rubriques, TOTAL_PAGES, pad } from "@/content/sections";

/** « p. XX / 21 » discret, en bas de l'écran. */
export function IndicateurPage() {
  const [page, setPage] = useState<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const maj = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let trouve: number | null = null;
      for (const r of rubriques) {
        const el = document.getElementById(r.id);
        if (!el) continue;
        const b = el.getBoundingClientRect();
        if (b.top <= mid && b.bottom > mid) {
          const nb = (r.fin ?? r.page) - r.page + 1;
          const f = Math.min(0.999, Math.max(0, (mid - b.top) / b.height));
          trouve = r.page + Math.floor(f * nb);
          break;
        }
      }
      setPage((p) => (p === trouve ? p : trouve));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(maj);
    };
    maj();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (page === null) return null;
  return (
    <div
      aria-hidden="true"
      className="label pointer-events-none fixed bottom-5 left-1/2 z-30 -translate-x-1/2 tabular-nums"
    >
      p. {pad(page)} / {TOTAL_PAGES}
    </div>
  );
}
