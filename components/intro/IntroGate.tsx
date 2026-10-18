"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefs } from "../PrefsProvider";
import { avatars } from "@/content/avatars";
import { identite } from "@/content/identite";
import { Avatar, type AvatarId } from "../avatar/Avatar";
import { allerA } from "../SmoothScroll";
import { play } from "@/lib/sound";
import { Illu } from "../ui/Illu";

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
  const carte = useRef<HTMLDivElement>(null);

  // le visiteur déjà venu : « Reprendre la lecture » / « Changer d'avatar »
  useEffect(() => {
    if (ready && hasSaved) setEtape("retour");
  }, [ready, hasSaved]);

  // le focus clavier reste dans l'écran d'accueil et se place sur le premier choix à chaque étape
  useEffect(() => {
    if (ouvert) carte.current?.querySelector<HTMLElement>("button")?.focus();
  }, [ouvert, etape, ready]);

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
    // la mise en page change quand les sections épinglées se créent : on re-mesure
    const ro = new ResizeObserver(maj);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", maj);
      window.removeEventListener("resize", maj);
      ro.disconnect();
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
      {/* tant que l'écran d'accueil est ouvert, le reste de la page est inerte (ni clavier ni lecteur d'écran) */}
      <div inert={ouvert}>{children}</div>

      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bienvenue dans le magazine"
          data-couleur="coral"
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto px-4 py-10"
        >
          {/* tes illustrations, pour que ça vive dès la première seconde */}
          <Illu src="soleil-jaune.svg" className="left-[-6%] top-[4%] w-[44vw] max-w-[300px]" anim="respire" />
          <Illu src="avion.svg" className="right-[6%] top-[9%] w-[16vw] max-w-[90px]" anim="flotte" rot={-8} />
          <Illu src="nuages.svg" className="right-[-4%] top-[16%] w-[42vw] max-w-[280px]" />
          <Illu src="oiseaux.svg" className="left-[22%] top-[10%] w-[14vw] max-w-[80px]" anim="flotte" delai={1} />
          <Illu src="plante-bleue.svg" className="bottom-[-1%] left-[2%] w-[22vw] max-w-[140px]" anim="respire" />
          <Illu src="plante-jaune.svg" className="bottom-[-1%] right-[3%] w-[20vw] max-w-[130px]" anim="respire" delai={1.5} />
          <Illu src="etoile.svg" className="bottom-[22%] right-[7%] w-[7vw] max-w-[36px]" anim="tourne" />

          <div className="relative z-10 w-full max-w-md border-[3px] border-ink bg-paper text-ink shadow-[8px_8px_0_#1f2d34]">
            <div ref={carte} className="px-6 pb-8 pt-10 text-center sm:px-9">
              <p className="label !text-ink">Édition numérique · {identite.numero}</p>
              <p className="titre-xl mt-3 text-5xl text-[#e8452f] sm:text-6xl">{identite.magazine}</p>
              <p className="mt-2 italic text-ink/70">Le magazine de Divine, développeuse à Abidjan</p>

              {etape === "son" && (
                <section aria-labelledby="q-son" className="mt-7">
                  <p id="q-son" className="font-display text-2xl font-bold italic">
                    Comment voulez-vous lire ?
                  </p>
                  <div className="mt-5 grid gap-3">
                    <button type="button" onClick={() => choisirSon(true)} className="carton-btn carton-btn--plein">
                      Avec le son
                    </button>
                    <button type="button" onClick={() => choisirSon(false)} className="carton-btn">
                      En silence
                    </button>
                  </div>
                </section>
              )}

              {etape === "avatar" && (
                <section aria-labelledby="q-avatar" className="mt-7">
                  <p id="q-avatar" className="font-display text-2xl font-bold italic">
                    Qui êtes-vous ?
                  </p>
                  <ul className="mt-5 grid grid-cols-2 gap-3">
                    {avatars.map((a, i) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => choisirAvatar(a.id)}
                          aria-label={`${a.rubrique} : ${a.description}`}
                          className="carton-avatar group flex w-full flex-col items-center gap-2 border-2 border-ink px-2 pb-3 pt-3 shadow-[3px_3px_0_#1f2d34] transition-transform hover:-translate-y-1"
                          style={{ background: ["#2f5fe0", "#ff725e", "#22c55e", "#ffc727"][i] }}
                        >
                          <Avatar id={a.id as AvatarId} className="h-28 w-auto transition-transform group-hover:scale-105" />
                          <span className="font-sans text-[0.72rem] font-extrabold uppercase leading-tight tracking-[0.12em]" style={{ color: i === 0 ? "#fff6ec" : "#1f2d34" }}>
                            {a.rubrique}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={surprenez} className="carton-btn carton-btn--plein mt-4 w-full">
                    Surprenez-moi
                  </button>
                </section>
              )}

              {etape === "retour" && (
                <section aria-labelledby="q-retour" className="mt-7">
                  <p id="q-retour" className="font-display text-2xl font-bold italic">
                    Content de vous revoir
                  </p>
                  <div className="mt-5 grid gap-3">
                    <button type="button" onClick={reprendre} className="carton-btn carton-btn--plein">
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
          className="label fixed bottom-4 right-4 z-[70] border-2 border-ink bg-paper px-3 py-3 !text-ink shadow-[3px_3px_0_#1f2d34] transition-transform hover:translate-x-px hover:translate-y-px sm:bottom-5"
        >
          Passer l&apos;intro
        </button>
      )}

      <style>{`
        .carton-btn {
          font-family: var(--font-sans);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.95rem 1rem;
          border: 2px solid #1f2d34;
          color: #1f2d34;
          background: #fff6ec;
          box-shadow: 3px 3px 0 #1f2d34;
          transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s;
        }
        .carton-btn:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1f2d34; background: #ffc727; }
        .carton-btn--plein { background: #1f2d34; color: #fff6ec; }
        .carton-btn--plein:hover { background: #ff725e; color: #1f2d34; }
      `}</style>
    </>
  );
}
