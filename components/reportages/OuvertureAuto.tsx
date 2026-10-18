"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Projet } from "@/content/projets";
import { usePrefs } from "../PrefsProvider";
import { OuvertureVisuel, construireOuverture } from "./ouvertures";

/** Sur la page d'un reportage : joue l'effet d'ouverture d'un trait, puis laisse place au contenu. */
export function OuvertureAuto({ type }: { type: Projet["ouverture"] }) {
  const { ready, reducedMotion } = usePrefs();
  const ref = useRef<HTMLDivElement>(null);
  const [fini, setFini] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) {
      setFini(true);
      return;
    }
    const ouv = ref.current?.querySelector("[data-ouv]") as HTMLElement | null;
    if (!ouv) return;
    const tl = gsap.timeline({ onComplete: () => setFini(true) });
    construireOuverture(type, ouv, tl, 0.15);
    return () => {
      tl.kill();
    };
  }, [ready, reducedMotion, type]);

  if (fini) return null;
  return (
    <div ref={ref} className="fixed inset-0 z-[55]">
      <OuvertureVisuel type={type} />
    </div>
  );
}
