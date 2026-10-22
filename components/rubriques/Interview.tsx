"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { questions, type QuestionInterview } from "@/content/interview";
import { Avatar, type AvatarId } from "../avatar/Avatar";
import { usePrefs } from "../PrefsProvider";
import { Citation } from "../ui/Citation";
import { Page } from "./Page";
import { gsap } from "@/lib/useScene";
import { play } from "@/lib/sound";

const Studio3D = dynamic(() => import("../scene3d/Studio3D"), { ssr: false });

/** Si WebGL est indisponible, la version à plat reste affichée. */
class Secours extends Component<{ children: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() {
    return { erreur: true };
  }
  render() {
    return this.state.erreur ? null : this.props.children;
  }
}

/** Les questions qui ont une réponse : seules celles-là sont jouables. */
const repondues = questions.filter((q) => !!q.reponse);

/** Première phrase d'une réponse, pour la citation en grand format. */
const citationDe = (r: string) => (r.match(/^.*?[.!?](\s|$)/)?.[0] ?? r).trim();

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

function Scene({ parle = 0 }: { parle?: number }) {
  const { avatar } = usePrefs();
  const id = (avatar ?? "curieuse") as AvatarId;
  const [pret3d, setPret3d] = useState(false);
  return (
    <>
      {/* le salon en 3D ; la version à plat reste dessous tant que la 3D n'est pas prête (ou si WebGL manque) */}
      <div className="relative h-72 border-b border-ink sm:h-[24rem]" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-[1fr_1fr] items-end gap-2 transition-opacity duration-500 sm:gap-8" style={{ opacity: pret3d ? 0 : 1 }}>
          <Avatar id={id} pose="assis" className="mx-auto h-44 w-auto sm:h-64" />
          <Avatar id="divine" pose="assis" className="mx-auto h-44 w-auto -scale-x-100 sm:h-64" />
        </div>
        <Secours>
          <Studio3D avatarId={id} parle={parle} onPret={() => setPret3d(true)} />
        </Secours>
      </div>
      <p className="label mt-2 flex justify-between">
        <span>Vous</span>
        <span>Divine</span>
      </p>
    </>
  );
}

/** Tant que les réponses ne sont pas là : les questions, présentées comme le teaser du prochain numéro. */
function Teaser() {
  return (
    <div className="mt-10">
      <Scene />
      <p className="mt-10 font-display text-2xl italic sm:text-3xl">À paraître dans le prochain numéro : l&apos;interview exclusive.</p>
      <ol className="mt-6 grid gap-x-10 sm:grid-cols-2">
        {questions.map((q, i) => (
          <li key={q.id} className="flex gap-4 border-t border-ink/20 py-3">
            <span className="label tabular-nums !text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-display text-lg italic leading-snug">{q.question}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * p. 21-22 — L'Interview : l'avatar du visiteur devient l'intervieweur.
 * Il propose 3 questions au choix (bulles) ; la réponse s'affiche en style magazine, puis 3 nouvelles questions
 * tirées du pool sans répétition. « Lire toute l'interview » affiche tout d'un coup (et reste dans le HTML).
 * Son : un léger « clic » de stylo à chaque question.
 */
function Salon() {
  const [ordre, setOrdre] = useState<number[]>(() => repondues.map((q) => q.id));
  const [posees, setPosees] = useState<number[]>([]);
  const [tout, setTout] = useState(false);
  const fil = useRef<HTMLDivElement>(null);

  // le tirage est mélangé une fois, côté client (pas d'écart serveur / client)
  useEffect(() => setOrdre(melange(repondues.map((q) => q.id))), []);

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
      <Scene parle={posees.length} />

      <div ref={fil} className="mt-8" aria-live="polite">
        {posees.map((x, i) => (
          <div key={x}>
            <QR q={parId(x)} premier={i === 0} />
            {(i + 1) % 2 === 0 && <Citation auteur="Divine">{citationDe(parId(x).reponse ?? "")}</Citation>}
          </div>
        ))}
      </div>

      {propositions.length > 0 ? (
        <div>
          <p className="label">{posees.length === 0 ? "Posez votre première question" : "Et ensuite ?"}</p>
          <ul className="mt-3 grid gap-3">
            {propositions.map((x) => (
              <li key={x}>
                <button type="button" onClick={() => poser(x)} className="relative w-full rounded-2xl border border-ink/30 px-5 py-4 text-left font-display text-lg font-bold italic leading-snug transition-colors hover:bg-ink hover:text-white sm:text-xl">
                  {parId(x).question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="border-y border-ink py-6 text-center">
          <p className="font-display text-2xl italic">Toutes les questions ont été posées.</p>
          <button
            type="button"
            onClick={() => {
              play("papier");
              setPosees([]);
              setOrdre(melange(repondues.map((q) => q.id)));
            }}
            className="btn mt-3"
          >
            Recommencer l&apos;interview
          </button>
        </div>
      )}

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
          {repondues.map((q, i) => (
            <QR key={q.id} q={q} premier={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Interview() {
  return (
    <Page id="interview" titre="L'Interview" trait>
      {repondues.length > 0 ? (
        <>
          <p className="mt-5 text-xl font-semibold italic">Posez vos questions : trois au choix, puis trois nouvelles.</p>
          <Salon />
        </>
      ) : (
        <Teaser />
      )}
    </Page>
  );
}
