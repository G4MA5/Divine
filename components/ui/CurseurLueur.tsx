"use client";

import { useEffect, useState } from "react";
import GlowCursor from "../reactbits/GlowCursor";
import { usePrefs } from "../PrefsProvider";

/**
 * Le curseur lumineux orange (React Bits « Glow Cursor ») : une traînée de lueur suit la souris sur toute la page.
 * Réservé aux appareils avec une vraie souris, et désactivé avec « mouvement réduit ».
 */
export function CurseurLueur() {
  const { reducedMotion } = usePrefs();
  const [actif, setActif] = useState(false);
  const [defile, setDefile] = useState(false);

  useEffect(() => {
    setActif(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  // la simulation de fluide se met en pause pendant le défilement : le scroll reste fluide sur les petits processeurs graphiques
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setDefile(true);
      clearTimeout(t);
      t = setTimeout(() => setDefile(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  if (!actif || reducedMotion) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <GlowCursor color="#ff8a00" secondaryColor="#ffc233" theme="light" intensity={0.85} quality="low" maxDevicePixelRatio={1} enabled={!defile} clickBurst={false} className="pointer-events-none" />
    </div>
  );
}
