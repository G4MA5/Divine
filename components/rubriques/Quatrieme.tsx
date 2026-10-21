"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { identite } from "@/content/identite";
import { PiedDePage } from "../ui/PiedDePage";
import { Avatar, type AvatarId } from "../avatar/Avatar";
import { MagazineObject } from "../intro/MagazineObject";
import { usePrefs } from "../PrefsProvider";
import { PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";
const A_FOURNIR = "[À FOURNIR";
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

/** Remonte tout en haut, sur la couverture. */
export function allerEnHaut() {
  play("page");
  const lenis = (window as unknown as { __lenis?: { scrollTo: (n: number, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(0, { duration: 2.4 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

function Lien({ label, valeur, href }: { label: string; valeur: string; href?: string }) {
  const placeholder = valeur.startsWith(A_FOURNIR);
  return (
    <div>
      <dt className="label !text-[0.6rem]">{label}</dt>
      <dd className="font-display text-xl font-bold italic">
        {placeholder || !href ? valeur : (
          <a href={href} className="underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow hover:text-ink">
            {valeur}
          </a>
        )}
      </dd>
    </div>
  );
}

/** Formulaire court (nom, entreprise, objet, message). Sans service configuré, repli sur un lien mailto. */
function Formulaire() {
  const [etat, setEtat] = useState<"repos" | "envoi" | "ok" | "erreur">("repos");

  const envoyer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("_gotcha")) return; // champ piège anti-spam
    const nom = String(f.get("nom") ?? "");
    const entreprise = String(f.get("entreprise") ?? "");
    const objet = String(f.get("objet") ?? "") || "Message depuis le portfolio";
    const message = String(f.get("message") ?? "");
    play("clic");

    if (!ENDPOINT) {
      const corps = `${message}\n\n— ${nom}${entreprise ? `, ${entreprise}` : ""}`;
      window.location.href = `mailto:${identite.email}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
      return;
    }
    setEtat("envoi");
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ nom, entreprise, objet, message }) });
      setEtat(r.ok ? "ok" : "erreur");
      if (r.ok) e.currentTarget.reset();
    } catch {
      setEtat("erreur");
    }
  };

  const champ = "mt-1 w-full border border-ink/20 bg-paper px-3 py-3 font-serif text-lg font-semibold normal-case tracking-normal text-ink outline-none shadow-[0_12px_30px_-20px_rgba(0,0,0,.4)] transition-shadow focus:shadow-[0_12px_30px_-20px_rgba(0,0,0,.4)]";

  return (
    <form onSubmit={envoyer} className="grid gap-4" aria-label="Écrire à Divine">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label block">
          Nom
          <input name="nom" required autoComplete="name" className={champ} />
        </label>
        <label className="label block">
          Entreprise
          <input name="entreprise" autoComplete="organization" className={champ} />
        </label>
      </div>
      <label className="label block">
        Objet
        <input name="objet" className={champ} />
      </label>
      <label className="label block">
        Message
        <textarea name="message" required rows={5} className={champ} />
      </label>
      <input name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={etat === "envoi"} className="btn btn-plein disabled:opacity-50">
          {etat === "envoi" ? "Envoi…" : "Envoyer"}
        </button>
        <p role="status" className="font-display italic">
          {etat === "ok" && "Merci, votre message est parti."}
          {etat === "erreur" && `L'envoi a échoué : écrivez-moi directement à ${identite.email}.`}
          {etat === "repos" && !ENDPOINT && <span className="text-soft">Ouvre votre messagerie avec le message prérempli.</span>}
        </p>
      </div>
    </form>
  );
}

/**
 * La fin : l'avatar revient, referme le magazine et le repose sur la table. On revoit la couverture en petit.
 * C'est la scène d'ouverture jouée à l'envers (même objet 3D, même table).
 */
function ScenneFin() {
  const { avatar } = usePrefs();
  const racine = useRef<HTMLDivElement>(null);
  const id = (avatar ?? "curieuse") as AvatarId;

  useScene(
    racine,
    (root) => {
      const q = <T extends Element>(s: string) => root.querySelector(s) as T;
      const table = q<HTMLElement>("[data-s=table]");
      const magPos = q<HTMLElement>("[data-s=mag-pos]");
      const cover = q<HTMLElement>("[data-s=cover-flip]");
      const avatarEl = q<HTMLElement>("[data-s=avatar]");
      const bye = q<HTMLElement>("[data-s=retour]");
      const svg = avatarEl.querySelector("svg") as SVGSVGElement;
      const part = (n: string) => svg.querySelector(`[data-part=${n}]`) as SVGGElement;
      const [legL, legR, armL, armR] = ["legL", "legR", "armL", "armR"].map(part);
      [legL, legR, armL, armR].forEach((p) => gsap.set(p, { transformOrigin: "0 0" }));

      const geo = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.min(vw, vh * 0.75);
        return { vw, vh, w, h: (w * 4) / 3, mobile: vw < 768 };
      };
      const sOuvert = () => {
        const g = geo();
        return g.mobile ? Math.max(g.vw / g.w, g.vh / g.h) * 1.02 : Math.max((g.vw * 1.04) / (2 * g.w), (g.vh * 1.04) / g.h);
      };
      const s3 = () => (geo().mobile ? 0.7 : 0.62);

      // état de départ : la double page remplit l'écran
      gsap.set(magPos, { transformPerspective: 1600, scale: () => sOuvert(), x: () => (geo().mobile ? 0 : (geo().w / 2) * sOuvert()), y: 0, rotationX: 0 });
      gsap.set(cover, { transformOrigin: "0% 50%", rotationY: -178 });
      gsap.set(table, { opacity: 0 });
      gsap.set(avatarEl, { x: () => geo().vw * 0.8, scaleX: -1 });
      gsap.set(bye, { opacity: 0, y: 14 });

      const marche = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "+=360%", scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: PRIO.fin },
      });

      // recul : on sort de la double page
      tl.to(
        magPos,
        { scale: () => s3(), x: () => (geo().mobile ? 0 : (geo().w / 2) * s3()), y: () => geo().vh * 0.02, rotationX: 4, duration: 1.8, ease: "power2.inOut" },
        0,
      ).to(table, { opacity: 1, duration: 1.4 }, 0.3);

      // l'avatar revient par la droite
      tl.to(avatarEl, { x: () => -geo().vw * (geo().mobile ? 0.02 : 0.1), duration: 2.4, ease: "power1.out" }, 1.6).to(
        marche,
        {
          p: 1,
          duration: 2.4,
          onUpdate: () => {
            const s = Math.sin(marche.p * Math.PI * 9) * 24 * (1 - Math.pow(marche.p, 6));
            gsap.set(legL, { rotation: s });
            gsap.set(legR, { rotation: -s });
            gsap.set(armL, { rotation: -s * 0.8 });
          },
        },
        1.6,
      );

      // il referme le magazine
      tl.fromTo(armR, { rotation: 0 }, { rotation: -112, duration: 0.9, immediateRender: false, ease: "power2.out" }, 4)
        .to(cover, { rotationY: 0, duration: 1.3, ease: "power2.inOut", onStart: () => play("fermer"), onReverseComplete: () => play("page") }, 4.6)
        .to(magPos, { x: () => 0, rotationX: 16, y: () => geo().vh * 0.1, duration: 1.3, ease: "power1.inOut" }, 4.6);

      // il le repose sur la table : on revoit la couverture en petit
      tl.to(magPos, { scale: () => (geo().mobile ? 0.5 : 0.44), rotationX: 54, y: () => geo().vh * 0.04, duration: 1.4, ease: "power2.inOut" }, 6.1)
        .to(armR, { rotation: 0, duration: 1, ease: "power2.inOut" }, 6.3)
        .to(bye, { opacity: 1, y: 0, duration: 0.8 }, 7.3);
    },
    [id],
  );

  return (
    <div ref={racine} className="scene relative h-svh w-full overflow-hidden bg-bg" style={{ ["--mw" as string]: "min(100vw, 75svh)" }} aria-label="Fin du numéro">
      <div data-s="table" className="scene-table absolute inset-0" aria-hidden="true" />
      <MagazineObject variant="fin" />
      <div data-s="avatar" className="pointer-events-none absolute bottom-[2svh] left-0 z-10" style={{ left: "auto", right: 0 }}>
        <Avatar id={id} className="h-[48svh] w-auto" />
      </div>
      <div data-s="retour" className="absolute inset-x-0 bottom-16 z-20 flex flex-col items-center gap-3 px-4 text-center">
        <p className="font-display text-2xl italic text-ink sm:text-3xl">Fin du numéro</p>
        <button
          type="button"
          onClick={allerEnHaut}
          className="label border border-ink/20 bg-paper/90 px-5 py-3 !text-ink transition-colors hover:bg-ink hover:!text-paper"
        >
          ↑ Relire depuis la couverture
        </button>
      </div>
    </div>
  );
}

/**
 * p. 21 — Quatrième de couverture
 * Contact, langues, formulaire, encadré « Prochain numéro », CV. Au dernier scroll, l'avatar referme le magazine
 * et le repose sur la table. Son : une page qui se ferme.
 */
export function Quatrieme() {
  return (
    <section id="quatrieme" aria-labelledby="quatrieme-titre">
      <div className="relative overflow-hidden pb-6 pl-4 pr-10 pt-24 sm:px-8">
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="label flex justify-between">
            <span>{identite.magazine} · Quatrième de couverture</span>
            <span className="tabular-nums">p. 23</span>
          </p>
          <h2 id="quatrieme-titre" className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]">
            Écrivez-moi
          </h2>
          <hr className="filet mt-5" />

          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <Lien label="Email" valeur={identite.email} href={`mailto:${identite.email}`} />
            {identite.afficherTelephone && <Lien label="Téléphone" valeur={identite.telephone} href={`tel:${identite.telephone.replace(/[^+\d]/g, "")}`} />}
            <Lien label="GitHub" valeur="github.com/divine-dev-now" href={identite.github} />
            <Lien label="LinkedIn" valeur={identite.linkedin} href={identite.linkedin} />
            <Lien label="Instagram" valeur="@divin____e" href={identite.instagram} />
            <Lien label="WhatsApp" valeur="Écrire sur WhatsApp" href={identite.whatsapp} />
            <div>
              <dt className="label !text-[0.6rem]">Langues</dt>
              <dd className="font-display text-xl font-bold italic">{identite.langues.map((l) => `${l.langue} ${l.niveau}`).join(" · ")}</dd>
            </div>
            <div>
              <dt className="label !text-[0.6rem]">Basée à</dt>
              <dd className="font-display text-xl font-bold italic">{identite.ville}</dd>
            </div>
          </dl>

          <div className="mt-10">
            <Formulaire />
          </div>

          <aside aria-label="Prochain numéro" className="mt-12 border border-ink/20 bg-paper p-5 text-center text-ink shadow-[0_12px_30px_-20px_rgba(0,0,0,.4)]">
            <h3 className="label !text-accent">Prochain numéro</h3>
            <p className="mt-2 font-display text-xl font-bold italic">[À FOURNIR : le prochain numéro]</p>
          </aside>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={identite.cv} download className="btn btn-plein">
              Télécharger le CV
            </a>
            <button type="button" onClick={allerEnHaut} className="btn">
              Relire depuis la couverture
            </button>
          </div>
          <PiedDePage page="23" />
        </div>
      </div>
      <ScenneFin />
    </section>
  );
}
