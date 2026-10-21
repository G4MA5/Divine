/** Pendant que le reportage se charge : un fin filet doré qui traverse l'écran. */
export default function Loading() {
  return (
    <div role="status" aria-label="Chargement du reportage" className="fixed inset-0 z-[65] flex items-center justify-center bg-white">
      <span className="relative block h-px w-[min(60vw,360px)] overflow-hidden bg-ink/15">
        <span className="absolute inset-y-0 w-1/3 bg-gold" style={{ animation: "filet 1.1s ease-in-out infinite" }} />
      </span>
      <style>{`@keyframes filet { from { left: -35%; } to { left: 100%; } }`}</style>
    </div>
  );
}
