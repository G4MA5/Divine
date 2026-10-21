import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter, Mrs_Saint_Delafield, Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/PrefsProvider";
import { identite } from "@/content/identite";
import { SITE_URL } from "@/lib/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const signature = Mrs_Saint_Delafield({
  variable: "--font-mrs",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${identite.magazine} — Divine Graourou, développeuse full stack`,
  applicationName: identite.magazine,
  authors: [{ name: identite.nom }],
  openGraph: { type: "website", locale: "fr_FR", siteName: identite.magazine },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  description:
    "Le portfolio de Divine Graourou, développeuse full stack, DevOps junior et support IT junior à Abidjan, raconté comme un magazine.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${signature.variable} ${bodoni.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PrefsProvider>{children}</PrefsProvider>
      </body>
    </html>
  );
}
