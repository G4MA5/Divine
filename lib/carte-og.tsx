/** Carte d'aperçu (Open Graph) en forme de mini couverture de magazine. */
export function CarteCouverture({ titre, rubrique, accroche }: { titre: string; rubrique: string; accroche: string }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#15120f", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      {/* la couverture */}
      <div
        style={{
          width: 420,
          height: 550,
          background: "#f4ede0",
          border: "2px solid #a9812f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 20px",
          color: "#15120f",
        }}
      >
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", fontSize: 14, letterSpacing: 3, color: "#6f6558" }}>
          <span>N° 01</span>
          <span>LE MAGAZINE DE DIVINE</span>
        </div>
        <div style={{ display: "flex", fontSize: 58, fontStyle: "italic", fontWeight: 700 }}>[div_dev_Now]</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "flex", width: 110, height: 2, background: "#a9812f", marginBottom: 18 }} />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>GRAOUROU</div>
          <div style={{ display: "flex", fontSize: 26, fontStyle: "italic" }}>Olivier Grace Divine</div>
        </div>
        <div style={{ display: "flex", fontSize: 14, letterSpacing: 3, color: "#6f6558" }}>ABIDJAN</div>
      </div>

      {/* le texte */}
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, width: 560, color: "#f1e9da" }}>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, color: "#cda75c" }}>{rubrique.toUpperCase()}</div>
        <div style={{ display: "flex", fontSize: 70, fontWeight: 700, lineHeight: 1.05, marginTop: 14 }}>{titre}</div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 22, color: "#a39786" }}>{accroche}</div>
      </div>
    </div>
  );
}
