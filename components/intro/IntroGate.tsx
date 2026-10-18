"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePrefs } from "../PrefsProvider";
import { avatars } from "@/content/avatars";
import { identite } from "@/content/identite";
import { Avatar, type AvatarId } from "../avatar/Avatar";
import { allerA } from "../SmoothScroll";
import { play } from "@/lib/sound";

type Etape = "son" | "avatar" | "retour";

/**
 * Écran d'accueil (avant tout) : deux choix successifs, style carton d'invitation.
 * Le contenu du magazine est déjà dans la page (rendu serveur) : l'écran d'accueil le recouvre
 * jusqu'à ce que le visiteur ait choisi, puis le scroll est débloqué.
 */
export function IntroGate({ children }: { children: ReactNode }) {
  const { ready, hasSaved, avatar, setAvatar, sound, setSound, reducedMotion } = usePrefs();
  const [ouvert, setOuvert] = useState(true);
  const [etape, setEtape] = useState<Etape>("son");
  const [introVisible, setIntroVisible] = useState(true);

  // le visiteur déjà venu : « Reprendre la lecture » / « Changer d'avatar »
  useEffect(() => {
    if (ready && hasSaved) setEtape("retour");
  }, [ready, hasSaved]);

  // pas de scroll tant que l'écran d'accueil est affiché
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (ouvert) {
      document.documentElement.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.documentElement.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ouvert, ready]);

  // le bouton « Passer l'intro » reste visible jusqu'à l'arrivée sur le sommaire
  useEffect(() => {
    const maj = () => {
      const s = document.getElementById("sommaire");
      setIntroVisible(!s || s.getBoundingClientRect().top > window.innerHeight * 0.55);
    };
    maj();
    window.addEventListener("scroll", maj, { passive: true });
    window.addEventListener("resize", maj);
    return () => {
      window.removeEventListener("scroll", maj);
      window.removeEventListener("resize", maj);
    };
  }, []);

  const lire = useCallback(() => {
    setOuvert(false);
    play("page");
    // mouvement réduit : pas de scène, on arrive directement sur le magazine ouvert
    if (reducedMotion) setTimeout(() => allerA("sommaire", true), 80);
  }, [reducedMotion]);

  const choisirSon = (on: boolean) => {
    setSound(on);
    setEtape("avatar");
  };

  const choisirAvatar = (id: string) => {
    setAvatar(id);
    lire();
  };

  const surprenez = () => choisirAvatar(avatars[Math.floor(Math.random() * avatars.length)].id);

  const passer = () => {
    if (!avatar) setAvatar(avatars[Math.floor(Math.random() * avatars.length)].id);
    setOuvert(false);
    setTimeout(() => allerA("sommaire", true), 80);
  };

  const reprendre = () => {
    // une action explicite : on peut réactiver l'ambiance choisie la dernière fois
    if (sound) setSound(true);
    lire();
  };

  return (
    <>
      {children}

      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="accueil-titre"
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-bg px-4 py-10"
        >
          <div className="relative w-full max-w-md border border-accent/70 p-1.5">
            <div className="border border-accent/40 px-6 py-10 text-center sm:px-10">
              <p className="label">Édition numérique · {identite.numero}</p>
              <h1 id="accueil-titre" className="mt-3 font-display text-4xl italic leading-none sm:text-5xl">
                {identite.magazine}
              </h1>
              <hr className="filet mx-auto mt-6 w-16" />

              {etape === "son" && (
                <section aria-labelledby="q-son" className="mt-8">
                  <h2 id="q-son" className="font-display text-2xl italic">
                    Comment voulez-vous lire ?
                  </h2>
                  <div className="mt-6 grid gap-3">
                    <button type="button" onClick={() => choisirSon(true)} className="carton-btn">
                      Avec le son
                    </button>
                    <button type="button" onClick={() => choisirSon(false)} className="carton-btn">
                      En silence
                    </button>
                  </div>
                </section>
              )}

              {etape === "avatar" && (
                <section aria-labelledby="q-avatar" className="mt-8">
                  <h2 id="q-avatar" className="font-display text-2xl italic">
                    Qui êtes-vous ?
                  </h2>
                  <ul className="mt-5 grid grid-cols-2 gap-3">
                    {avatars.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => choisirAvatar(a.id)}
                          aria-label={`${a.rubrique} : ${a.description}`}
                          className="carton-avatar group flex w-full flex-col items-center gap-2 border border-accent/40 px-2 pb-3 pt-3 transition-colors hover:border-accent hover:bg-bg-deep"
                        >
                          <Avatar id={a.id as AvatarId} className="h-28 w-auto transition-transform group-hover:-translate-y-1" />
                          <span className="font-display text-base italic leading-tight">{a.rubrique}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={surprenez} className="carton-btn mt-4 w-full">
                    Surprenez-moi
                  </button>
                </section>
              )}

              {etape === "retour" && (
                <section aria-labelledby="q-retour" className="mt-8">
                  <h2 id="q-retour" className="font-display text-2xl italic">
                    Content de vous revoir
                  </h2>
                  <div className="mt-6 grid gap-3">
                    <button type="button" onClick={reprendre} className="carton-btn">
                      Reprendre la lecture
                    </button>
                    <button type="button" onClick={() => setEtape("son")} className="carton-btn">
                      Changer d&apos;avatar
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {introVisible && (
        <button
          type="button"
          onClick={passer}
          className="label fixed bottom-4 right-4 z-[70] border border-accent/60 bg-bg/90 px-3 py-3 backdrop-blur transition-colors hover:bg-bg-deep sm:bottom-5"
        >
          Passer l&apos;intro
        </button>
      )}

      <style>{`
        .carton-btn {
          font-family: var(--font-sans);
          font-size: 0.72rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          padding: 0.95rem 1rem;
          border: 1px solid var(--accent);
          color: var(--fg);
          background: transparent;
          transition: background-color 0.2s, color 0.2s;
        }
        .carton-btn:hover { background: var(--accent); color: var(--bg); }
      `}</style>
    </>
  );
}
