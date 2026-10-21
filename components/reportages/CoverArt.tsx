import type { NomArt } from "@/content/projets";

/* Les « photos » des couvertures de projets, reprises de mon autre portfolio (viewBox 300×400 = 3:4). */

const INK = "#111";
const RED = "#E4002B";
const YELLOW = "#F5C400";
const BLUE = "#0A9CE0";
const MAGENTA = "#E5007E";

function qrModules(n: number, seed: number) {
  const m: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rnd() > 0.5;
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const px = ox + x;
        const py = oy + y;
        if (px < 0 || py < 0 || px >= n || py >= n) continue;
        const inside = x >= 0 && x <= 6 && y >= 0 && y <= 6;
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[py][px] = inside && (edge || core);
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  return m;
}

/** Génie UPB — un grand QR code sous un faisceau. */
export function QrArt() {
  const n = 21;
  const m = qrModules(n, 11);
  let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) d += `M${x} ${y}h1v1h-1z`;
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(138 164) rotate(-8)">
        <rect x="-106" y="-106" width="212" height="212" fill="#fff" />
        <g transform="translate(-94 -94) scale(8.95)">
          <path d={d} fill={INK} />
        </g>
      </g>
      <rect x="0" y="146" width="300" height="38" fill={RED} opacity=".18" />
      <rect x="0" y="163" width="300" height="3" fill={RED} />
    </svg>
  );
}

/** UPB Student's — le site de la bibliothèque : une fenêtre de navigateur pleine de livres. */
export function LibraryArt() {
  const books = [
    { w: 17, h: 96, c: MAGENTA },
    { w: 15, h: 80, c: INK },
    { w: 22, h: 112, c: YELLOW },
    { w: 15, h: 76, c: BLUE },
    { w: 17, h: 102, c: "#fff", s: true },
    { w: 20, h: 116, c: RED },
    { w: 17, h: 90, c: INK },
    { w: 17, h: 72, c: YELLOW },
    { w: 15, h: 106, c: BLUE },
  ];
  let x = -112;
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(150 212) rotate(3)">
        <rect x="-132" y="-98" width="264" height="196" rx="15" fill="#fff" stroke={INK} strokeWidth="5" />
        <line x1="-132" y1="-70" x2="132" y2="-70" stroke={INK} strokeWidth="4" />
        <circle cx="-112" cy="-84" r="5.5" fill="#FF3B30" />
        <circle cx="-96" cy="-84" r="5.5" fill={YELLOW} />
        <circle cx="-80" cy="-84" r="5.5" fill={BLUE} />
        <rect x="-118" y="-58" width="236" height="22" rx="11" fill="#fff" stroke={INK} strokeWidth="3.4" />
        <circle cx="98" cy="-47" r="5.5" fill="none" stroke={INK} strokeWidth="3" />
        {books.map((b, i) => {
          const bx = x;
          x += b.w + 3;
          return <rect key={i} x={bx} y={66 - b.h} width={b.w} height={b.h} rx="1.5" fill={b.c} stroke={b.s ? INK : "none"} strokeWidth="2.5" />;
        })}
        <rect x="-118" y="66" width="236" height="7" rx="3.5" fill="#b5b5b5" />
      </g>
    </svg>
  );
}

/** Inventist — une appli mobile de stock (produits de salon). */
export function StockPhoneArt() {
  const cards = [
    { y: -102, icon: MAGENTA, bar: BLUE, ring: INK },
    { y: -44, icon: YELLOW, bar: YELLOW, ring: INK },
    { y: 14, icon: BLUE, bar: RED, ring: RED },
  ];
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(192 190) rotate(9) scale(.9)">
        <rect x="-72" y="-152" width="144" height="304" rx="26" fill="#fff" />
        <rect x="-22" y="-138" width="44" height="11" rx="5.5" fill={INK} />
        {cards.map((c, i) => (
          <g key={i}>
            <rect x="-56" y={c.y} width="112" height="50" rx="11" fill="#f3f3f3" stroke={c.ring} strokeWidth="3" />
            <rect x="-47" y={c.y + 10} width="18" height="30" rx="4" fill={c.icon} />
            <rect x="-43" y={c.y + 6} width="10" height="6" rx="2" fill={INK} />
            <rect x="-20" y={c.y + 13} width="62" height="6" rx="3" fill={INK} />
            <rect x="-20" y={c.y + 28} width="62" height="6" rx="3" fill="#dcdcdc" />
            <rect x="-20" y={c.y + 28} width={i === 2 ? 20 : 46} height="6" rx="3" fill={c.bar} />
          </g>
        ))}
        <circle cx="46" cy="22" r="4.5" fill={RED} />
        <rect x="-56" y="84" width="112" height="17" rx="8.5" fill={INK} />
      </g>
      <line x1="116" y1="250" x2="148" y2="280" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="152" cy="300" r="11" fill="none" stroke={RED} strokeWidth="5.5" />
      <circle cx="186" cy="289" r="11" fill="none" stroke={RED} strokeWidth="5.5" />
    </svg>
  );
}

/** Metro — un plan de métro : le routage comme un dessin. */
export function MetroArt() {
  const lineA = "M110 330 L170 270 L170 120 L225 65 L290 65";
  const lineB = "M290 336 L290 290 L225 225 L110 225";
  const lineC = "M104 150 L235 150 L285 200";
  const stations = [
    [110, 330],
    [170, 270],
    [170, 195],
    [170, 120],
    [225, 65],
    [290, 336],
    [290, 290],
    [225, 225],
    [110, 225],
    [104, 150],
    [235, 150],
  ];
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(34 76) scale(.8)">
        <g fill="none" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
          <path d={lineB} stroke={YELLOW} />
          <path d={lineC} stroke={INK} />
          <path d={lineA} stroke="#fff" />
        </g>
        {stations.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" fill="#fff" stroke={INK} strokeWidth="3.5" />
        ))}
        {[
          [170, 150],
          [170, 225],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="14" fill="#fff" stroke={INK} strokeWidth="4" />
            <circle cx={x} cy={y} r="5.5" fill={INK} />
          </g>
        ))}
        <circle cx="290" cy="65" r="13" fill={INK} />
        <circle cx="285" cy="200" r="13" fill="#fff" />
      </g>
    </svg>
  );
}

/** Canopée — des tickets de support empilés, l'un d'eux résolu. */
export function TicketsArt() {
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(156 206)">
        <g transform="translate(6 -96) rotate(-9)">
          <rect x="-86" y="-40" width="172" height="80" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="-62" y="-20" width="48" height="15" rx="7.5" fill={YELLOW} />
          <rect x="-62" y="8" width="112" height="5" rx="2.5" fill={INK} />
          <rect x="-62" y="20" width="62" height="5" rx="2.5" fill="#b9b9b9" />
        </g>
        <g transform="translate(-8 -6) rotate(4)">
          <rect x="-90" y="-40" width="180" height="80" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="-66" y="-20" width="48" height="15" rx="7.5" fill={RED} />
          <rect x="-66" y="8" width="118" height="5" rx="2.5" fill={INK} />
          <rect x="-66" y="20" width="64" height="5" rx="2.5" fill="#b9b9b9" />
        </g>
        <g transform="translate(4 88) rotate(-2)">
          <rect x="-96" y="-42" width="192" height="84" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="-72" y="-20" width="48" height="15" rx="7.5" fill="#0B6B43" />
          <rect x="-72" y="10" width="112" height="5" rx="2.5" fill={INK} />
          <rect x="-72" y="22" width="60" height="5" rx="2.5" fill="#b9b9b9" />
          <circle cx="62" cy="-4" r="27" fill={YELLOW} stroke={INK} strokeWidth="4" />
          <path d="M48 -3 L58 8 L76 -14" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

/** Clinique Life — un agenda de rendez-vous, un créneau confirmé. */
export function RdvArt() {
  const jours = Array.from({ length: 28 }, (_, i) => i);
  return (
    <svg className="vc-art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(150 196) rotate(-4)">
        <rect x="-118" y="-112" width="236" height="224" rx="14" fill="#fff" stroke={INK} strokeWidth="5" />
        <rect x="-118" y="-112" width="236" height="40" rx="14" fill={INK} />
        <rect x="-118" y="-90" width="236" height="18" fill={INK} />
        <rect x="-70" y="-124" width="10" height="28" rx="5" fill="#fff" stroke={INK} strokeWidth="3" />
        <rect x="60" y="-124" width="10" height="28" rx="5" fill="#fff" stroke={INK} strokeWidth="3" />
        {jours.map((j) => {
          const cx = -96 + (j % 7) * 32;
          const cy = -50 + Math.floor(j / 7) * 34;
          const choisi = j === 16;
          return (
            <g key={j}>
              {choisi && <circle cx={cx} cy={cy} r="14" fill="#0F5A3A" />}
              <circle cx={cx} cy={cy} r="3.4" fill={choisi ? "#fff" : "#cfcfcf"} />
            </g>
          );
        })}
        <rect x="-96" y="84" width="120" height="14" rx="7" fill="#e7e7e7" />
        <rect x="34" y="82" width="62" height="18" rx="9" fill="#0F5A3A" />
      </g>
      <path d="M232 70 v34 M215 87 h34" stroke="#0F5A3A" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export const ARTS: Record<NomArt, () => React.ReactElement> = { qr: QrArt, library: LibraryArt, stock: StockPhoneArt, metro: MetroArt, tickets: TicketsArt, rdv: RdvArt };
