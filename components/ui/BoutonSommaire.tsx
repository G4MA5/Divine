"use client";

import { pageLabel, pad, rubriques } from "@/content/sections";
import { useContenu } from "@/components/ContenuProvider";
import { allerA } from "../SmoothScroll";
import { StaggeredMenu } from "../reactbits/StaggeredMenu";
import { play } from "@/lib/sound";

/**
 * Le bouton « Sommaire » : ouvre le sommaire à tout moment (React Bits « Staggered Menu »).
 * Des bandes de couleur glissent l'une après l'autre, puis le panneau blanc arrive et les rubriques montent une à une.
 */
const items = rubriques.map((r) => ({
  label: r.titre,
  ariaLabel: `Aller à ${r.titre}, page ${pageLabel(r)
    .split("-")
    .map((n) => pad(Number(n)))
    .join(" à ")}`,
  link: `#${r.id}`,
}));

const lenis = () => (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;

export function BoutonSommaire() {
  const { identite } = useContenu();
  const reseaux = [
    { label: "GitHub", link: identite.github },
    { label: "Instagram", link: identite.instagram },
    { label: "WhatsApp", link: identite.whatsapp },
  ].filter((s) => !!s.link);
  return (
    <StaggeredMenu
      isFixed
      position="left"
      colors={["#fdf1c9", "#f2b400"]}
      accentColor="#b87f00"
      menuButtonColor="#121212"
      openMenuButtonColor="#121212"
      openLabel="Sommaire"
      closeLabel="Fermer"
      items={items}
      socialItems={reseaux}
      displayItemNumbering
      onMenuOpen={() => {
        play("papier");
        lenis()?.stop();
      }}
      onMenuClose={() => lenis()?.start()}
      onItemClick={(it) => {
        play("page");
        const id = it.link.slice(1);
        lenis()?.start();
        // laisse le panneau se refermer avant de défiler
        document.querySelector<HTMLButtonElement>(".sm-toggle")?.click();
        setTimeout(() => allerA(id), 220);
      }}
    />
  );
}
