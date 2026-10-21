import { Pac } from "@/components/intro/Chargement";

/** Pendant que le reportage se charge : le même petit personnage, qui traverse l'écran. */
export default function Loading() {
  return (
    <div role="status" aria-label="Chargement du reportage" className="fixed inset-0 z-[65] flex flex-col items-center justify-center bg-[#0b0b0b] text-[#f4f1ea]">
      <div className="relative h-16 w-[min(70vw,420px)] overflow-hidden">
        <span className="absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2" style={{ animation: "traverse 1.6s linear infinite" }}>
          <Pac className="h-full w-full" />
        </span>
      </div>
      <p className="label mt-6 !text-[#a8a59c]">Chargement du reportage</p>
      <style>{`
        .pac-haut { transform-origin: 50px 50px; animation: pacHaut 0.28s ease-in-out infinite alternate; }
        .pac-bas { transform-origin: 50px 50px; animation: pacBas 0.28s ease-in-out infinite alternate; }
        @keyframes pacHaut { from { transform: rotate(0deg); } to { transform: rotate(-26deg); } }
        @keyframes pacBas { from { transform: rotate(0deg); } to { transform: rotate(26deg); } }
        @keyframes traverse { from { left: -3rem; } to { left: 100%; } }
      `}</style>
    </div>
  );
}
