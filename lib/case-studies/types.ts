/**
 * The shape of one case study — everything the template in
 * components/work/case-study.tsx needs to render a /work/<slug> page.
 *
 * Same rule as lib/kozmoz.ts: the copy lives in the data file, not in the JSX.
 * Screenshots of the client's own data stay unset until the client signs them
 * off, and print nothing meanwhile; screens with made-up data say so (`demo`).
 */

import type { ProjectMedia, Still } from "@/lib/kozmoz";
import type { MediaAsset } from "@/lib/media";

/** A screenshot slot. With no `media` it renders as a labelled placeholder. */
export type CaseShot = {
  label: string;
  hint: string;
  media?: MediaAsset;
};

/**
 * A still on the page with a short caption under it. A study whose screens
 * show made-up data says so on the page (`demo` on the study), and every
 * figure's caption carries that label.
 */
export type CaseFigure = Still & {
  alt: string;
  caption: string;
};

/**
 * One step in the Problem → Build → Result sequence. The template numbers
 * them 01–03 in that order; the data only says what each one is called.
 */
export type CaseStep = {
  /** The mono label beside the number — "The problem", "The build". */
  kind: string;
  heading: string;
  body: string;
  /** Optional screenshot beneath the body. */
  shot?: CaseShot;
  /** Stills beneath the body, each with its caption. */
  figures?: CaseFigure[];
};

export type CaseStudy = {
  /** URL slug. The page is served at /work/<slug>. */
  slug: string;
  /** The project's name, for the page title: "<name> — Omora". */
  name: string;
  /** Meta description. */
  description: string;
  /** Mono line above the headline: the project and the area of work. */
  eyebrow: string;
  /** What kind of business the client is. Never their name. */
  clientType: string;
  /**
   * Where the project actually stands, in a few words — "Live since March",
   * "Entering pilot testing". Printed beside the client type in the hero, so
   * no page can read as further along than the work is.
   */
  status: string;
  /** The headline. A sentence, not the project name. */
  title: string;
  subhead: string;
  /**
   * Three short lines on what the thing does, under the subhead. Verb-first
   * and plain — this is the whole of what it does, not a feature list.
   */
  capabilities: string[];
  /** The product shot near the top of the page. */
  hero?: CaseShot;
  /**
   * The project's live card under the intro, in place of a product shot: the
   * same loop, stills and loading as its card on /work, with a caption.
   */
  live?: { media: ProjectMedia; caption: string };
  /**
   * Set when the screens on the page show made-up data rather than the
   * client's: the label printed with the live card and every figure.
   */
  demo?: string;
  problem: CaseStep;
  /** What we built. */
  build: CaseStep;
  /** The outcome — or, before there is one, an honest account of the stage. */
  result: CaseStep;
  /**
   * One big figure under the result, with a short label. Optional, and hidden
   * whenever `value` is empty: publishing a client's numbers is their call,
   * so a study only carries one the client has agreed to.
   */
  resultNumber?: {
    value: string;
    label: string;
  };
  /** How we approached it — short, first person plural, no process diagram. */
  approach: {
    heading: string;
    body: string;
  };
  /**
   * How sensitive data is handled, where the work touches any. Statements of
   * fact about what was actually done — never the bare phrase "HIPAA
   * compliant", which is not a thing anyone can be certified as and so claims
   * more than it says, and nothing stated as done before it is.
   */
  compliance?: {
    heading: string;
    lines: string[];
  };
  /** The closing question. Heads the contact section at the foot of the page. */
  cta: {
    heading: string;
    body: string;
  };
};
