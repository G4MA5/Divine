import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  // NEXT_DIST_DIR permet de construire et tester sans toucher au dossier .next du serveur de développement
  distDir: process.env.NEXT_DIST_DIR || ".next",
  devIndicators: false,
  // les images du stockage Supabase (logos, tableaux, captures, portrait) sont servies par Next
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
