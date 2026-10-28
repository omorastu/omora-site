import { clinicalScribeMedia } from "@/lib/kozmoz";
import type { CaseStudy } from "@/lib/case-studies/types";

/**
 * Clinical Scribe — /work/clinical-scribe.
 *
 * Not live yet: the system is built and is being prepared to test on a few
 * real consults. Every line here is written to that stage. When the pilot
 * reports, update `status` and `result` together, and set `resultNumber` only
 * with the practice's sign-off.
 */
export const clinicalScribe: CaseStudy = {
  slug: "clinical-scribe",
  name: "Clinical Scribe",
  description:
    "A consult capture and follow-up tool built for a clinical practice: it records the consultation and drafts the doctor letter and the patient take-home letter from it. Built, and entering pilot testing on real consults.",
  // The practice is not named anywhere on this page, by agreement.
  eyebrow: "Clinical Scribe · consult capture and follow-up",
  clientType: "Orthodontic practice",
  status: "Built, entering pilot testing",
  // The one place the page says it this way. Everywhere else says something
  // else, so the line lands once instead of wearing out.
  title: "The consult decides the case, and nothing said in it survives the room.",
  subhead:
    "Clinical Scribe is built to record the consultation, draft the letters that come out of it, and keep what was said somewhere the practice can look at it.",
  capabilities: [
    "Records the consultation.",
    "Drafts the doctor letter and the patient take-home letter from it.",
    "Surfaces the patterns across consults.",
  ],
  // The screens are a replica of the app's, with made-up patients (video/,
  // see its README): the real app, and anything with a real patient in it,
  // is never recorded.
  demo: "Demo data",
  live: {
    media: clinicalScribeMedia,
    caption:
      "One made-up consult from start to finish: recorded, summarized, both letters drafted, then the follow-up messages. The app’s own screens, rebuilt with invented patients.",
  },
  problem: {
    kind: "The problem",
    heading: "The patient says they'll think about it, and the practice never hears what about.",
    body: "Which objection came up, what got explained, where the hesitation actually started: by the time anyone needs to know, it's down to memory. Follow-up is whatever the coordinator remembers days later, written from a blank text box.",
  },
  build: {
    kind: "The build",
    heading: "One recording, a summary, and the letters that follow from it.",
    body: "The system records the consultation and produces a summary of it. From that summary and the exam findings it drafts both letters — the doctor letter and the patient take-home letter — each in its own register. When a patient does not sign that day, it gives the coordinator a few follow-up messages she can read, pick, edit and send, written from what was actually said in the consult rather than from a blank box.",
    figures: [
      {
        src: "/m/work/clinical-summary.jpg",
        width: 1920,
        height: 1200,
        alt: "Clinical Scribe with made-up demo data: the summary of a consult.",
        caption: "The summary of the consult, drafted from the recording.",
      },
      {
        src: "/m/work/clinical-doctor-letter.jpg",
        width: 1920,
        height: 1200,
        alt: "Clinical Scribe with made-up demo data: the drafted doctor letter.",
        caption: "The doctor letter, drafted from the summary and the exam findings.",
      },
      {
        src: "/m/work/clinical-follow-ups.jpg",
        width: 1920,
        height: 1200,
        alt: "Clinical Scribe with made-up demo data: suggested follow-up messages.",
        caption: "Follow-up messages to pick, edit and send when a patient doesn’t sign that day.",
      },
    ],
  },
  result: {
    kind: "The result so far",
    heading: "Built, and about to be tested on real consults.",
    body: "Clinical Scribe is built and is being prepared for a pilot on a few real consults. There are no outcomes to report yet: how accurate the summaries are, how much the letters need editing, and whether the same hesitations really do show up across consults are what the pilot is for.",
  },
  // TODO(result): Once the pilot has a figure the practice agrees to publish,
  // set it here and it renders under the result — e.g.
  //   resultNumber: { value: "38", label: "Consults recorded in the pilot" },
  approach: {
    heading: "How we approached it",
    body: "The point was never note-taking. Notes are a by-product. The point is that a practice can tell you its close rate to a decimal place and cannot tell you why the people who said no actually said no. So we started from the conversation itself: capture what was said, and let the letters and the follow-up come from that instead of from someone's memory of it.",
  },
  compliance: {
    heading: "Handling patient data",
    lines: [
      "Designed from the start for HIPAA-conscious handling of protected health information.",
      // TODO(BAA): Not confirmed yet — do not publish until the business
      // associate agreements are actually signed. Once they are, restore this
      // line (and check it still names the right parties):
      //   "Business associate agreements signed with the practice and with the infrastructure providers.",
      "The clinical system runs on dedicated HIPAA-eligible infrastructure, not general consumer services.",
      "Patient data never passes through consumer AI tools.",
    ],
  },
  cta: {
    heading: "Could you say why your last ten no's said no?",
    body: "If the answer is in what gets said during the consult, that's the problem this was built for. Tell us how yours run and we'll tell you whether it's the same shape.",
  },
};
