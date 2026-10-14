/**
 * Case studies — the long form behind a Recent work card.
 *
 * Same rule as lib/home.ts: the copy lives here, not in the JSX. One record
 * per study, keyed by the slug its page is served at.
 *
 * Screenshots stay unset until the client signs them off, and render as dashed
 * slots meanwhile. There are deliberately no figures in this file and no field
 * to put one in: where a study describes work for a named client, publishing
 * their numbers is their call to make, not ours to assume.
 */

import type { MediaAsset } from "@/lib/media";

/** One numbered step in the Before → Build → Result sequence. */
export type CaseStep = {
  /** "01", "02", "03". Printed as given. */
  n: string;
  /** The step's name — Before, The build, The result. */
  kind: string;
  heading: string;
  body: string;
  /** Optional screenshot beneath the body. Only the build step carries one. */
  shot?: {
    label: string;
    hint: string;
    media?: MediaAsset;
  };
};

export type CaseStudy = {
  /** URL slug. The page is served at /work/<slug>. */
  slug: string;
  /** Mono line above the headline: client and the area of work. */
  eyebrow: string;
  /** The outcome, as a sentence. Not the project name. */
  title: string;
  subhead: string;
  /**
   * Three short lines on what the thing does, under the subhead. Verb-first
   * and plain — this is the whole of what it does, not a feature list.
   */
  capabilities: string[];
  /** The product shot near the top of the page. */
  hero: {
    label: string;
    hint: string;
    media?: MediaAsset;
  };
  steps: CaseStep[];
  /** How we approached it — short, first person plural, no process diagram. */
  note: {
    heading: string;
    body: string;
  };
  /** What this page does and does not claim. Plain, and not in small print. */
  scope: {
    heading: string;
    body: string;
  };
  cta: {
    heading: string;
    body: string;
  };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "clinical-scribe",
    // The practice is not named anywhere on this page, by agreement.
    eyebrow: "Clinical Scribe · consult capture and follow-up",
    title:
      "The consult room decides the case, and nothing about it was being written down.",
    subhead:
      "Clinical Scribe records the consultation, drafts the letters that come out of it, and keeps what was said somewhere the practice can look at it.",
    capabilities: [
      "Records the consultation.",
      "Drafts the doctor letter and the patient take-home letter from it.",
      "Surfaces the patterns across consults.",
    ],
    hero: {
      label: "Product screenshot",
      hint: "The consult record: the summary of what was said, with the two drafted letters beside it.",
    },
    steps: [
      {
        n: "01",
        kind: "Before",
        heading: "The conversation that decides the case left the room with the patient.",
        body: "A consult happens in a room. The patient says they will think about it, and nothing about that conversation survives it. The practice knows its close rate but not the reasons behind it — which objection came up, what was explained, where the hesitation actually started. Follow-up is whatever the coordinator remembers days later, written from a blank text box.",
      },
      {
        n: "02",
        kind: "The build",
        heading: "One recording, a summary, and the letters that follow from it.",
        body: "The system records the consultation and produces a summary of it. From that summary and the exam findings it drafts both letters — the doctor letter and the patient take-home letter — each in its own register. When a patient does not sign that day, it gives the coordinator a few follow-up messages she can read, pick, edit and send, written from what was actually said in the room rather than from a blank box.",
        shot: {
          label: "Interface screenshot",
          hint: "The follow-up step: the consult summary, the suggested messages, and the coordinator editing one before it goes.",
        },
      },
      {
        n: "03",
        kind: "The result",
        heading: "Every consult now leaves a record.",
        body: "The same hesitation turning up across different consults becomes something the practice can see and act on, rather than a feeling someone in the building has. The conversation that decides the case is no longer the one part of the process nobody keeps.",
      },
    ],
    note: {
      heading: "How we approached it",
      body: "The point was never note-taking. Notes are a by-product. The point is that a practice can tell you its close rate to a decimal place and cannot tell you why the people who said no actually said no. That answer only ever existed in the room, and the room was the one place nothing was being written down.",
    },
    scope: {
      heading: "What this page claims",
      body: "This describes a system that has been built and is being put into use. It publishes no figures from the practice and claims no change to their numbers. It was built under a signed business associate agreement, with patient data handled accordingly.",
    },
    cta: {
      heading: "Could you say why your last ten no's said no?",
      body: "If the answer lives in a room and leaves with the patient, it can be captured. Tell us how your consults run and we'll tell you whether this is the same shape of problem.",
    },
  },
];

/** The study served at /work/<slug>, or undefined if there isn't one. */
export function caseStudyFor(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
