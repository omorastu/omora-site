import type { Metadata } from "next";
import localFont from "next/font/local";
import { Page } from "@/components/elorro/page";
import { cn } from "@/lib/utils";
import "./type.css";

/**
 * /type: Elorro Display's specimen, for review. Nothing links here, and
 * search engines are asked to leave it out. It shows the wordmark, the
 * names, the five redrawn letters next to Cormorant Garamond's (the one
 * page that loads Cormorant, for the comparison), every character in each
 * weight, and headings from the site at their sizes there. The font and how
 * it's built: design/type/README.md.
 */
export const metadata: Metadata = {
  title: "Elorro Display — type specimen",
  description: "Elorro Display, the display face of elorro.com.",
  robots: { index: false, follow: false },
};

// Cormorant Garamond, for the before-and-after only: a copy of
// design/type/source's, kept here because Vercel doesn't upload design/.
const cormorant = localFont({
  src: "./cormorant-garamond-latin-wght.woff2",
  weight: "500 600",
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

// The Bold, which the site sets only in the hero's last names: declared here
// too, not preloaded, rather than imported from hero-font.ts, which would
// have every page preload it.
const bold = localFont({
  src: "../fonts/elorro-display-bold.woff2",
  weight: "700",
  variable: "--font-display-bold",
  display: "swap",
  preload: false,
});

const SIGNATURES = [
  {
    glyph: "O",
    name: "The O: our two rings",
    text: "A perfect circle outside. Inside, the counter is the shape two circles make where they overlap, so the two rings meet in every O. In ELORRO there are two.",
  },
  {
    glyph: "R",
    name: "The R: a long leg",
    text: "The leg leaves the bowl in one long stroke and runs on along the baseline to a hairline, like a pen lifting off. Kerned so the tail tucks under round letters and never touches the next.",
  },
  {
    glyph: "E",
    name: "The E: hairline serifs",
    text: "Each arm ends in a fine vertical hairline with only a small bracket. Crisp where Cormorant’s curve in, closer to letters cut in stone.",
  },
  {
    glyph: "L",
    name: "The L: the same hairline",
    text: "One fine serif rising off a long foot, to match the E beside it in the wordmark.",
  },
  {
    glyph: "&",
    name: "The ampersand",
    text: "The italic “Et” form, drawn upright, in place of the roman one. A weight heavier and a little larger than the letters around it, so it holds its own in gold between two names.",
  },
];

const SETS = [
  { label: "Capitals", text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { label: "Lowercase", text: "abcdefghijklmnopqrstuvwxyz" },
  { label: "Figures", text: "0123456789 £€$%" },
  { label: "Punctuation", text: "& . , : ; ! ? ¡ ¿ ’ ‘ “ ” « » ( ) [ ] / - – — … · • @ # * © ®" },
  { label: "Accents", text: "ÁÉÍÓÚÜÑ áéíóúüñ ÀÂÄÇÈÊËÎÏÔÖÙÛŸ àâäçèêëîïôöùûÿ ÅØÆŒß åøæœ" },
];

const WEIGHTS = [
  { label: "Regular · 500", cls: "type-w5" },
  { label: "SemiBold · 600", cls: "type-w6" },
  { label: "Bold · 700", cls: "type-w7" },
];

export default function TypePage() {
  return (
    <Page className={cn(cormorant.variable, bold.variable, "type-page")}>
      <header className="cs-head">
        <div className="wrap">
          <div className="cs-intro">
            <p className="cs-eyebrow label">Type specimen</p>
            <h1 className="cs-title">Elorro Display.</h1>
            <p className="cs-sub">
              Our display face, for the wordmark and every heading. It’s Cormorant Garamond with five letters redrawn:
              the O, the R, the E, the L and the ampersand. Everything smaller stays in Hanken Grotesk.
            </p>
          </div>
        </div>
      </header>

      <section className="type-band type-band--mark" aria-label="The wordmark">
        <p className="type-label label">The wordmark · SemiBold, tracked 0.36em, in the logo’s gold</p>
        <p className="type-mark">
          <span className="wordmark gold">Elorro</span>
        </p>
        <p className="type-mark type-mark--ink">
          <span className="wordmark">Elorro</span>
        </p>
      </section>

      <section className="type-band" aria-label="The names">
        <p className="type-label label">The names · Regular, the ampersand in gold</p>
        <p className="type-names">
          Ashan <span className="gold">&amp;</span> Jordan
        </p>
        <p className="type-names type-names--small">
          Ashan <span className="gold">&amp;</span> Jordan
        </p>
      </section>

      <section className="type-band" aria-labelledby="type-sig-h">
        <h2 className="type-label label" id="type-sig-h">
          The five letters · Cormorant Garamond, then Elorro Display
        </h2>
        <ul className="type-sigs">
          {SIGNATURES.map((s) => (
            <li key={s.glyph} className="type-sig">
              <p className="type-sig-pair" aria-hidden="true">
                <span className="type-sig-before">{s.glyph}</span>
                <span className={cn("type-sig-after", s.glyph === "&" && "gold")}>{s.glyph}</span>
              </p>
              <h3 className="type-sig-name">{s.name}</h3>
              <p className="type-sig-text">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="type-band" aria-labelledby="type-set-h">
        <h2 className="type-label label" id="type-set-h">
          Every character, in each weight
        </h2>
        {WEIGHTS.map((w) => (
          <div key={w.cls} className={cn("type-set", w.cls)}>
            <p className="type-set-weight label">{w.label}</p>
            {SETS.map((set) => (
              <p key={set.label} className="type-set-line">
                <span className="type-set-name label">{set.label}</span>
                <span className="type-set-chars">{set.text}</span>
              </p>
            ))}
          </div>
        ))}
      </section>

      <section className="type-band" aria-labelledby="type-head-h">
        <h2 className="type-label label" id="type-head-h">
          Headings from the site, at their sizes there
        </h2>
        <div className="type-heads">
          <p className="type-head-note label">The names on the door</p>
          <p className="type-hero">
            <span>
              Ashan<b>Fernando</b>
            </span>
            <span className="gold">&amp;</span>
            <span>
              Jordan<b>Lopez</b>
            </span>
          </p>
          <p className="type-head-note label">A section title</p>
          <p className="type-h-sec">The two people on the first call are the two people doing the work.</p>
          <p className="type-head-note label">Services</p>
          <p className="type-h-svc">Websites &amp; getting found.</p>
          <p className="type-h-svc">Photo &amp; video.</p>
          <p className="type-h-svc">Phones, booking &amp; follow-up.</p>
          <p className="type-h-svc">Custom tools.</p>
          <p className="type-head-note label">Projects</p>
          <p className="type-h-proj">Clinical Scribe · Estética de Génesis · Galvan Dental Care · Prosperando · ONHIZM · Stirred Earth</p>
          <p className="type-head-note label">The film’s big words</p>
          <p className="type-film">
            <span>Listen.</span>
            <span>One plan.</span>
            <span>
              A <span className="gold">&amp;</span> J
            </span>
          </p>
          <p className="type-head-note label">The close</p>
          <p className="type-h-sec">Book a call, let’s talk.</p>
          <p className="type-head-note label">In Spanish</p>
          <p className="type-h-sec">¿Qué hacemos? Diseño, fotografía y vídeo, señales claras y años de oficio.</p>
        </div>
      </section>
    </Page>
  );
}
