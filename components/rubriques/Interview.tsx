"use client";

import { useEffect, useRef, useState } from "react";
import { questions, type QuestionInterview } from "@/content/interview";
import { Avatar, type AvatarId } from "../avatar/Avatar";
import { usePrefs } from "../PrefsProvider";
import { Portrait } from "../ui/Portrait";
import { Citation } from "../ui/Citation";
import { Page } from "./Page";
import { gsap } from "@/lib/useScene";
import { play } from "@/lib/sound";
const A_FOURNIR = "[À FOURNIR";

/** Première phrase d'une réponse, pour la citation en grand format. */
const citationDe = (r: string) => (r.startsWith(A_FOURNIR) ? "[À FOURNIR : citation extraite d'une réponse]" : (r.match(/^.*?[.!?](\s|$)/)?.[0] ?? r).trim());

function melange<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function QR({ q, premier }: { q: QuestionInterview; premier: boolean }) {
  return (
    <div className="mb-8">
      <h4 className="font-display text-2xl font-black italic leading-snug text-accent sm:text-3xl">{q.question}</h4>
      <p className={`mt-2 ${premier ? "lettrine" : ""}`}>{q.reponse}</p>
    </div>
  );
}

/**
 * p. 19-20 — L'Interview : l'avatar du visiteur devient l'intervieweur.
 * Il propose 3 questions au choix (bulles dorées) ; ma réponse s'affiche en style magazine, puis 3 nouvelles questions
 * tirées du pool sans répétition. « Lire toute l'interview » affiche tout d'un coup (et reste dans le HTML pour le référencement).
 * Son : un léger « clic » de stylo à chaque question.
 */
function Salon() {
  const { avatar } = usePrefs();
  const id = (avatar ?? "curieuse") as AvatarId;
  const [ordre, setOrdre] = useState<number[]>(() => questions.map((q) => q.id));
  const [posees, setPosees] = useState<number[]>([]);
  const [tout, setTout] = useState(false);
  const fil = useRef<HTMLDivElement>(null);

  // le tirage est mélangé une fois, côté client (pas d'écart serveur / client)
  useEffect(() => setOrdre(melange(questions.map((q) => q.id))), []);

  const restantes = ordre.filter((x) => !posees.includes(x));
  const propositions = restantes.slice(0, 3);
  const parId = (x: number) => questions.find((q) => q.id === x)!;

  const poser = (x: number) => {
    play("clic");
    setPosees((p) => [...p, x]);
    requestAnimationFrame(() => {
      const dernier = fil.current?.lastElementChild;
      if (dernier) gsap.fromTo(dernier, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
    });
  };

  return (
    <div className="mt-10">
      {/* le salon d'interview */}
      <div className="grid grid-cols-[1fr_1fr] items-end gap-2 border-b border-fg pb-0 sm:gap-8" aria-hidden="true">
        <Avatar id={id} pose="assis" className="mx-auto h-44 w-auto sm:h-64" />
        <Portrait className="mx-auto h-44 w-auto sm:h-64" />
      </div>
      <p className="label mt-2 flex justify-between">
        <span>L&apos;intervieweur</span>
        <span>Divine</span>
      </p>

      {/* échanges déjà faits */}
      <div ref={fil} className="mt-8" aria-live="polite">
        {posees.map((x, i) => (
          <div key={x}>
            <QR q={parId(x)} premier={i === 0} />
            {(i + 1) % 2 === 0 && <Citation auteur="Divine">{citationDe(parId(x).reponse)}</Citation>}
          </div>
        ))}
      </div>

      {/* les questions au choix */}
      {propositions.length > 0 ? (
        <div>
          <p className="label">{posees.length === 0 ? "Posez votre première question" : "Et ensuite ?"}</p>
          <ul className="mt-3 grid gap-3">
            {propositions.map((x) => (
              <li key={x}>
                <button
                  type="button"
                  onClick={() => poser(x)}
                  className="relative w-full border border-ink/20 bg-paper px-5 py-4 text-left font-display text-lg font-bold italic leading-snug text-ink shadow-[0_12px_30px_-20px_rgba(0,0,0,.4)] transition-transform hover:-translate-y-0.5 hover:bg-yellow sm:text-xl"
                >
                  {parId(x).question}
                  <span aria-hidden="true" className="absolute -bottom-[9px] left-8 h-4 w-4 rotate-45 border-b border-r border-ink/20 bg-paper" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="border-y border-fg py-6 text-center">
          <p className="font-display text-2xl italic">Toutes les questions ont été posées.</p>
          <button
            type="button"
            onClick={() => {
              play("papier");
              setPosees([]);
              setOrdre(melange(questions.map((q) => q.id)));
            }}
            className="btn mt-3"
          >
            Recommencer l&apos;interview
          </button>
        </div>
      )}

      {/* toute l'interview, d'un coup */}
      <div className="mt-10">
        <button
          type="button"
          aria-expanded={tout}
          aria-controls="interview-complete"
          onClick={() => {
            play("page");
            setTout((v) => !v);
          }}
          className="btn"
        >
          {tout ? "Replier l'interview" : "Lire toute l'interview"}
        </button>
        {/* reste dans le HTML (référencement) : « until-found » le garde cherchable même replié */}
        <div id="interview-complete" {...(tout ? {} : ({ hidden: "until-found" } as Record<string, unknown>))} className="mt-8">
          {questions.map((q, i) => (
            <QR key={q.id} q={q} premier={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Interview() {
  return (
    <Page
      id="interview"
      titre="L'Interview"
    >
      <p className="mt-5 text-xl font-semibold italic">Posez vos questions : trois au choix, puis trois nouvelles.</p>
      <Salon />
    </Page>
  );
}
