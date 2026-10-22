"use client";

import { useContenu } from "@/components/ContenuProvider";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../PrefsProvider";
import SlingButton from "../reactbits/SlingButton";
import { play } from "@/lib/sound";

/**
 * Le contact en conversation (idée vue sur marco.fyi/contact) : Divine pose ses questions une à une, le visiteur répond
 * dans la barre de message, puis tire sur le bouton (React Bits « Sling Button ») pour envoyer.
 * Le message est enregistré dans la table `messages` de Supabase (lisible seulement par l'administratrice, dans l'application
 * de commande). Sans Supabase, un service externe (NEXT_PUBLIC_FORM_ENDPOINT) ; sans rien, la messagerie s'ouvre avec le message prérempli.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_CLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type Cle = "nom" | "sujet" | "email" | "plus";
type Msg = { de: "divine" | "visiteur"; texte: string };
type Etape = { cle: Cle; placeholder: string; type?: string; facultatif?: boolean };

const ETAPES: Etape[] = [
  { cle: "nom", placeholder: "Votre nom" },
  { cle: "sujet", placeholder: "De quoi voulez-vous parler ?" },
  { cle: "email", placeholder: "vous@exemple.com", type: "email" },
  { cle: "plus", placeholder: "Un dernier mot ? (Entrée pour passer)", facultatif: true },
];

const question = (cle: Cle, r: Record<string, string>) => {
  switch (cle) {
    case "nom":
      return ["Un projet à construire ? Une question ? Un coup de main ? Écrivez-moi ici, pour de vrai.", "Comment vous appelez-vous ?"];
    case "sujet":
      return [`Enchantée ${r.nom} 👋`, "De quoi voulez-vous qu'on parle ?"];
    case "email":
      return ["Ah, je vois 👀", "Quelle est votre adresse e-mail pour que je vous réponde ?"];
    case "plus":
      return ["Merci !", "Autre chose à me dire ? Vous pouvez aussi passer."];
  }
};

const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function Messagerie() {
  const { identite } = useContenu();
  const { reducedMotion } = usePrefs();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [etape, setEtape] = useState(-1); // -1 : pas commencé
  const [ecrit, setEcrit] = useState(false); // Divine est en train d'écrire
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [valeur, setValeur] = useState("");
  const [erreur, setErreur] = useState("");
  const [fin, setFin] = useState<"" | "pret" | "envoi" | "ok" | "erreur" | "mail">("");
  const zone = useRef<HTMLDivElement>(null);
  const racine = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const delai = (ms: number) => (reducedMotion ? 0 : ms);
  const apres = (ms: number, f: () => void) => {
    const t = setTimeout(f, delai(ms));
    timers.current.push(t);
  };

  /** Divine écrit une ou plusieurs bulles, l'une après l'autre. */
  const dire = (textes: string[], suite?: () => void) => {
    setEcrit(true);
    textes.forEach((texte, i) => {
      apres(650 + i * 1100, () => {
        setMsgs((m) => [...m, { de: "divine", texte }]);
        play("tic");
        if (i === textes.length - 1) {
          setEcrit(false);
          suite?.();
        } else {
          setEcrit(true);
        }
      });
    });
  };

  const poser = (i: number, r: Record<string, string>) => {
    dire(question(ETAPES[i].cle, r), () => {
      setEtape(i);
      setTimeout(() => champ.current?.focus({ preventScroll: true }), 30);
    });
  };

  // la conversation démarre quand la messagerie arrive à l'écran
  useEffect(() => {
    const el = racine.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          poser(0, {});
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    const ts = timers.current;
    return () => {
      io.disconnect();
      ts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // la zone de messages reste calée sur le dernier message (sans faire défiler la page)
  useEffect(() => {
    const z = zone.current;
    if (z) z.scrollTo({ top: z.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [msgs, ecrit, fin, reducedMotion]);

  const valider = (e: React.FormEvent) => {
    e.preventDefault();
    if (etape < 0 || ecrit) return;
    const cfg = ETAPES[etape];
    const v = valeur.trim();
    if (!v && !cfg.facultatif) {
      setErreur("Un petit mot, s'il vous plaît.");
      return;
    }
    if (cfg.cle === "email" && !emailValide(v)) {
      setErreur("Cette adresse e-mail semble incomplète.");
      return;
    }
    setErreur("");
    play("clic");
    const r = { ...reponses, [cfg.cle]: v };
    setReponses(r);
    setMsgs((m) => (v ? [...m, { de: "visiteur", texte: v }] : [...m, { de: "visiteur", texte: "—" }]));
    setValeur("");
    setEtape(-1);
    if (etape < ETAPES.length - 1) poser(etape + 1, r);
    else dire(["Parfait, tout est prêt ✨", "Tirez sur le bouton, lâchez, et le message part (un simple toucher marche aussi)."], () => setFin("pret"));
  };

  const envoyer = async () => {
    if (fin !== "pret" && fin !== "erreur") return;
    const { nom = "", sujet = "", email = "", plus = "" } = reponses;
    const message = [sujet, plus].filter(Boolean).join("\n\n");
    play("clic");
    if (!ENDPOINT && !(SUPABASE_URL && SUPABASE_CLE)) {
      const corps = `${message}\n\n— ${nom} (${email})`;
      setFin("mail");
      dire(["C'est parti ! Votre messagerie s'ouvre avec le message prérempli : il ne reste qu'à l'envoyer 💌"]);
      window.location.href = `mailto:${identite.email}?subject=${encodeURIComponent(`Message de ${nom} depuis le portfolio`)}&body=${encodeURIComponent(corps)}`;
      return;
    }
    setFin("envoi");
    try {
      const r =
        SUPABASE_URL && SUPABASE_CLE
          ? await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
              method: "POST",
              headers: { apikey: SUPABASE_CLE, Authorization: `Bearer ${SUPABASE_CLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
              body: JSON.stringify({ nom: nom.slice(0, 120), email: email.slice(0, 200), sujet: sujet.slice(0, 300), message: (plus ? `${sujet}\n\n${plus}` : sujet).slice(0, 5000) }),
            })
          : await fetch(ENDPOINT as string, {
              method: "POST",
              headers: { Accept: "application/json", "Content-Type": "application/json" },
              body: JSON.stringify({ nom, email, objet: "Message depuis le portfolio", message }),
            });
      if (r.ok) {
        setFin("ok");
        dire(["Reçu ✨ Je vous réponds dès que possible. À très vite !"]);
      } else throw new Error("échec");
    } catch {
      setFin("erreur");
      dire([`Oups, l'envoi a échoué. Réessayez, ou écrivez-moi directement à ${identite.email}.`]);
    }
  };

  const recommencer = () => {
    timers.current.forEach(clearTimeout);
    setMsgs([]);
    setReponses({});
    setValeur("");
    setErreur("");
    setFin("");
    setEtape(-1);
    setEcrit(false);
    poser(0, {});
  };

  const cfg = etape >= 0 ? ETAPES[etape] : null;

  return (
    <div ref={racine} className="rounded-[28px] bg-[#f5f4f0] p-4 sm:p-7">
      <p className="label mb-3 flex items-center justify-between !text-ink/60">
        <span>Divine</span>
        <button type="button" onClick={recommencer} className="underline underline-offset-4 transition-colors hover:text-ink">
          Recommencer
        </button>
      </p>

      <div ref={zone} data-lenis-prevent role="log" aria-live="polite" aria-label="Conversation avec Divine" className="flex max-h-[24rem] min-h-[15rem] flex-col gap-2 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] rounded-[1.4rem] px-4 py-2.5 text-lg leading-snug ${
              m.de === "divine" ? "self-start rounded-bl-md bg-[#e8e6df] text-ink" : "self-end rounded-br-md bg-gold text-ink"
            }`}
          >
            {m.texte}
          </p>
        ))}
        {ecrit && (
          <p aria-hidden="true" className="flex w-16 items-center justify-center gap-1.5 self-start rounded-[1.4rem] rounded-bl-md bg-[#e8e6df] py-4">
            {[0, 1, 2].map((k) => (
              <span key={k} className="h-2 w-2 animate-bounce rounded-full bg-ink/45" style={{ animationDelay: `${k * 0.15}s` }} />
            ))}
          </p>
        )}
      </div>

      {fin === "pret" || fin === "erreur" ? (
        <div className="mt-5 flex items-center justify-center gap-4 py-3">
          <SlingButton
            size={64}
            padColor="#121212"
            iconColor="#ffffff"
            accentColor="#f2b400"
            wellColor="#e8e6df"
            bandColor="#b9b6ab"
            ariaLabel="Envoyer le message"
            axis="vertical"
            onSend={envoyer}
          />
          <span className="label !text-ink/70">Envoyer</span>
        </div>
      ) : fin === "envoi" ? (
        <p role="status" className="mt-5 text-center font-display italic">
          Envoi…
        </p>
      ) : (
        <form onSubmit={valider} noValidate className="mt-5" aria-label="Votre réponse">
          <div className="flex items-center gap-2 rounded-full border border-ink/20 bg-white py-1.5 pl-5 pr-1.5 focus-within:border-ink focus-within:ring-2 focus-within:ring-gold">
            <label htmlFor="reponse-contact" className="sr-only">
              {cfg ? cfg.placeholder : "Patientez, Divine écrit"}
            </label>
            <input
              ref={champ}
              id="reponse-contact"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              type={cfg?.type ?? "text"}
              autoComplete={cfg?.cle === "nom" ? "name" : cfg?.cle === "email" ? "email" : "off"}
              disabled={!cfg}
              placeholder={cfg ? cfg.placeholder : "Divine écrit…"}
              aria-invalid={!!erreur}
              aria-describedby={erreur ? "erreur-contact" : undefined}
              className="min-w-0 flex-1 bg-transparent py-2 text-lg text-ink !outline-none placeholder:text-ink/40 disabled:cursor-wait"
            />
            <button type="submit" disabled={!cfg} aria-label="Envoyer ma réponse" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity disabled:opacity-25">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
          <p id="erreur-contact" role="alert" className="mt-2 min-h-6 pl-5 text-base text-accent">
            {erreur}
          </p>
        </form>
      )}
    </div>
  );
}
