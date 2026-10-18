"use client";

import { useEffect, useRef } from "react";

/** Marque-page doré dans la marge : sa longueur suit la progression de lecture. */
export function MarquePage() {
  const ruban = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const maj = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ruban.current?.style.setProperty("--p", String(p));
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

  return (
    <div
      ref={ruban}
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-0 z-30 w-3 sm:right-5"
      style={{ ["--p" as string]: 0 }}
    >
      <div
        className="w-full bg-coral"
        style={{
          height: "calc(4rem + var(--p) * (100svh - 8rem))",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 9px), 0 100%)",
          transition: "height 0.15s linear",
        }}
      />
    </div>
  );
}
