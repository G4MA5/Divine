"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useScene } from "@/lib/useScene";

/** Sur la page d'un reportage : les mots du titre montent depuis la ligne de base à l'arrivée. */
export function TitrePage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (root) => {
    const t = root.querySelector("[data-titre-dossier]");
    if (!t) return;
    const texte = t.textContent ?? "";
    t.setAttribute("aria-label", texte);
    t.innerHTML = texte
      .split(" ")
      .map((m) => `<span aria-hidden="true" style="display:inline-block;transform-origin:50% 100%" data-m>${m}</span>`)
      .join(" ");
    gsap.from(t.querySelectorAll("[data-m]"), { scaleY: 0, yPercent: 25, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.2 });
    gsap.from(root.querySelectorAll("article > div"), { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 });
  });

  return <div ref={ref}>{children}</div>;
}
