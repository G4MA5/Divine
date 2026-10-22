import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-*/**",
    "test-results/**",
    "playwright-report/**",
    "scripts/**",
    "components/reactbits/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Ces règles servent l'optimiseur « React Compiler » ; elles signalent à tort des motifs voulus ici :
    //  - three.js / React Three Fiber modifient des objets 3D à chaque image (useFrame) ;
    //  - la détection « côté navigateur » (souris, mouvement réduit) se fait dans un effet pour éviter tout écart d'hydratation.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
