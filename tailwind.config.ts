import type { Config } from "tailwindcss";

/**
 * Omora v2 — "Violet & Signal"
 *
 * Palette discipline (keep this rule when adding anything):
 *   violet family = the built thing — structure, rules, plates, headings, CTAs
 *   blue family   = the running thing — only what is actually live: waveforms,
 *                   filling slots, active states, pulses, telemetry
 * Blue is never decorative. If it isn't moving or live, it's violet.
 *
 * Primary buttons are the one exception to "brass becomes violet": they fill
 * with violet-deep and set their label in ink.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D0908",
        raised: "#181110",
        line: "#2C211E",
        ink: "#F3EBDE",
        muted: "#A99A8B",
        violet: "#C18CFF",
        "violet-deep": "#8B4FE6",
        "violet-dim": "#43266E",
        /* The third violet in docs/layout.md — the filled-button colour on
           the dark home page. Same hex as violet-ink, which is a light-zone
           text token; this is its dark-ground name. */
        "violet-strong": "#6B32C4",
        /* Alternating section ground on the home page (What we do, Contact):
           one step up from bg, still below raised so cards on it read. */
        band: "#110C0B",
        blue: "#7FA0C4",
        "blue-dim": "#3E5570",

        /* Light-theme tokens — used only by the cream middle of the page
           (What We Do → Recent Work → How We Work → Team). The dark tokens
           above still own the hero, the contact section and the footer. */
        cream: "#F2ECE1",
        "cream-raised": "#FBF7EF",
        "cream-line": "#DED4C3",
        "cream-ink": "#1A1310",
        "cream-muted": "#6E6355",
        "violet-ink": "#6B32C4",
        "violet-line": "#7B5CB0",
        "violet-soft": "#E7DBFA",
        "blue-ink": "#35597E",
        "blue-soft": "#C9D8E6",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        /* Wordmark only — the "OMORA" lockup in the nav and the footer. */
        logo: ["var(--font-logo)", "serif"],
      },
      maxWidth: {
        wrap: "1200px",
        prose: "62ch",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        "blue-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "slow-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-10px,0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.55" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        blink: {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0.15" },
        },
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "blue-sweep": "blue-sweep 3.5s ease-in-out infinite",
        "slow-drift": "slow-drift 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        blink: "blink 2s steps(1, end) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
