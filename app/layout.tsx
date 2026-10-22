import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PrefsProvider } from "@/components/PrefsProvider";
import { getContenu } from "@/lib/contenu-serveur";
import { ContenuProvider } from "@/components/ContenuProvider";
import { SITE_URL } from "@/lib/site";

/** Polices hébergées avec le site (voir app/fonts/LICENCES.md) : aucune dépendance à Google Fonts à la construction. */
const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "./fonts/playfair-display-latin-wght-normal.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/playfair-display-latin-wght-italic.woff2", style: "italic", weight: "400 900" },
  ],
});

const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-garamond-latin-wght-normal.woff2", style: "normal", weight: "300 700" },
    { path: "./fonts/cormorant-garamond-latin-wght-italic.woff2", style: "italic", weight: "300 700" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [{ path: "./fonts/inter-latin-wght-normal.woff2", style: "normal", weight: "100 900" }],
});

const signature = localFont({
  variable: "--font-mrs",
  display: "swap",
  src: [{ path: "./fonts/mrs-saint-delafield-latin-400-normal.woff2", style: "normal", weight: "400" }],
});

const bodoni = localFont({
  variable: "--font-bodoni",
  display: "swap",
  src: [
    { path: "./fonts/bodoni-moda-latin-wght-normal.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/bodoni-moda-latin-wght-italic.woff2", style: "italic", weight: "400 900" },
  ],
});

const jost = localFont({
  variable: "--font-jost",
  display: "swap",
  src: [{ path: "./fonts/jost-latin-wght-normal.woff2", style: "normal", weight: "100 900" }],
});

export async function generateMetadata(): Promise<Metadata> {
  const { identite } = await getContenu();
  return {
    metadataBase: new URL(SITE_URL),
    title: `${identite.magazine} — ${identite.prenom} Graourou, développeuse full stack`,
    applicationName: identite.magazine,
    authors: [{ name: identite.nom }],
    openGraph: { type: "website", locale: "fr_FR", siteName: identite.magazine },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
    description: `Le portfolio de ${identite.prenom} Graourou, développeuse full stack, DevOps junior et support IT junior à Abidjan, raconté comme un magazine.`,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};


export default async function RootLayout({ children }: LayoutProps<"/">) {
  const contenu = await getContenu();
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${signature.variable} ${bodoni.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ContenuProvider contenu={contenu}>
          <PrefsProvider>{children}</PrefsProvider>
        </ContenuProvider>
      </body>
    </html>
  );
}
