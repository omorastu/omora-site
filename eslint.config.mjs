import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 dropped `next lint`; this is its replacement, run by `npm run lint`.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The archived V1 site: not routed, not type-checked (see tsconfig.json).
    "app/_v1/**",
    // The Work loops' Remotion project: its own package, its own dependencies.
    "video/**",
  ]),
]);
