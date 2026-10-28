/**
 * Every word the Clinical Scribe loop puts on screen, in one file, so one
 * read of it is a review of the whole video.
 *
 * Two kinds of text live here:
 *
 * - Labels (the `label`, `title`, button and hint strings): the app's own,
 *   copied from omora-clinical's components (app/_components, app/record,
 *   app/consult/[id]/summary, app/follow-ups) and lib/demo/data.ts's step
 *   and reason labels. Labels only: they name nobody and describe no one.
 * - Everything else: one invented demo consult, written fresh for this loop.
 *   Nothing here is taken from the app's fixtures, demo data or database.
 *   The app's own chrome says "Omora Clinical"; this uses the case study's
 *   name for the product instead.
 *
 * Rules this file keeps, by agreement with the client:
 * - Every person is a Zz- name (patient, parent, staff, doctor, dentist).
 * - No dates of birth, and no record numbers or other identifiers.
 * - The practice is never named: it is "Demo Orthodontics" throughout.
 */

/* -------------------------------------------------------------------------
 * The app's chrome
 * ---------------------------------------------------------------------- */

export const APP = {
  /** The product's name as the case study gives it. */
  name: "Clinical Scribe",
  /** The sidebar's "today" line. An invented date. */
  today: "Mon, Oct 12, 2026",
  /** app/_components/demo-banner.tsx, verbatim. */
  banner:
    "Demo · synthetic data only — every patient, consult and letter here is invented. No real patient information.",
  /** The prototype's seven destinations (app/_components/sidebar.tsx), with invented badge counts. */
  nav: [
    { key: "today", label: "Today", badge: 0 },
    { key: "record", label: "Record", badge: 0 },
    { key: "review", label: "Review", badge: 2 },
    { key: "followups", label: "Follow-ups", badge: 3 },
    { key: "letters", label: "Letters", badge: 0 },
    { key: "insights", label: "Insights", badge: 0 },
    { key: "map", label: "Product map", badge: 0 },
  ],
  footer: "Prototype · mock data only",
  reset: "Reset demo",
} as const;

export type NavKey = (typeof APP.nav)[number]["key"];

/* -------------------------------------------------------------------------
 * The people in the demo consult (all invented)
 * ---------------------------------------------------------------------- */

export const PRACTICE = "Demo Orthodontics";
export const DOCTOR = "Dr. Zz-Demo";
export const DENTIST = "Dr. Zz-Lee Sample";
export const TC = { initials: "ZK", name: "Zz-Kim Demo" };
export const TC_OTHER = { initials: "ZR", name: "Zz-Rae Demo" };

export const PATIENT = {
  name: "Zz-Maya Example",
  age: "13",
  guardian: "Zz-Dana Example (mom)",
};

/* -------------------------------------------------------------------------
 * Step 1: recording (app/record/[consultId]/record-client.tsx)
 * ---------------------------------------------------------------------- */

export const RECORD = {
  subtitle: `New patient · 9:40 AM · with ${PATIENT.guardian} · TC ${TC.initials}`,
  recording: "Recording",
  /** Seconds on the timer at frame 0. */
  startSeconds: 14 * 60 + 21,
  pause: "Pause",
  stop: "Stop",
  examSheet: "Exam sheet",
  examSheetHint: "Snap or upload the paper sheet when the doctor is done with it.",
  replacePhoto: "Replace photo",
  moments: "Moments",
  flag: "Flag a moment",
  momentsHint: "Drop a marker when something worth finding later is said.",
  marker: "Marker",
  /** A marker already dropped, and the one dropped during the loop. */
  firstMarker: 6 * 60 + 48,
  processingSubtitle: "Processing the recording",
  processing: "Processing",
  /** lib/demo/data.ts PROCESSING_STEPS, verbatim. */
  steps: [
    "Transcribing audio",
    "Reading exam sheet",
    "Extracting fields",
    "Checking against exam sheet",
    "Drafting summary and letters",
    "Finding follow-up reason",
  ],
};

/* -------------------------------------------------------------------------
 * Step 2: the summary (app/consult/[id]/summary/summary-client.tsx)
 * ---------------------------------------------------------------------- */

export const CONSULT_DATE = "Oct 12, 2026";

export const SUMMARY_PAGE = {
  subtitle: [`Consult ${CONSULT_DATE} · TC ${TC.initials} · approved ${CONSULT_DATE} · `, "back to review", " · ", "on the follow-up list"],
  tabs: { summary: "Consult summary", family: "Patient / family letter", dentist: "Referring dentist letter" },
  copy: "Copy",
};

/** The summary's fields, in the app's order, with its labels. */
export const SUMMARY = {
  title: "Consult summary",
  chiefComplaint: { label: "Chief complaint", value: "Crowding of the upper front teeth; Zz-Maya doesn't like how her smile looks in photos." },
  findings: {
    label: "Key clinical findings",
    value: [
      "Class II molar relationship, mild, right side",
      "About 5 mm of crowding in the upper arch",
      "Overjet 6 mm with a deep bite",
      "Lower midline 2 mm to the left",
      "Gums healthy; hygiene fair",
    ],
  },
  plan: { label: "Recommended plan", value: "Clear aligners with Class II elastics, about 18 months, then retainers." },
  alternatives: { label: "Alternatives", value: "Ceramic or metal braces over a similar time, or a six-month recheck to watch growth." },
  financial: {
    label: "Fee and financing discussed",
    value: "$5,900 in total: $500 down, then $225 a month. Insurance may cover up to $1,500, to be verified.",
  },
  objection: { label: "Objection raised", value: "Mom wants to talk the cost over with Zz-Maya's dad before committing." },
  outcome: { label: "Outcome", value: "Did not start today. The family prefers aligners and is close to deciding." },
  /** Follow-up reasons, in the app's label vocabulary; the first is primary. */
  reasons: ["Needs to talk to spouse", "Ready to start, financial pending"],
  primary: " · primary",
  nextStep: { label: "Next step", value: "Send the fee breakdown today; call Thursday, once the family has talked." },
};

/** app/_components/recommendation.tsx, with an invented recommendation. */
export const RECOMMENDATION = {
  title: "Recommended next move",
  confidence: "High confidence",
  headline: "Put the plan in writing for both parents, then call once they've talked.",
  steps: [
    "Email Zz-Dana the fee breakdown and the aligner plan today.",
    "Offer a short call with both parents on Thursday.",
    "Confirm the insurance benefit first, so the figure is final.",
  ],
  whyLabel: "Why",
  why: "The hesitation was about deciding together, not about the treatment. A written plan gives both parents the same picture.",
  evidenceLabel: "Evidence",
  evidence: [
    { t: "11:04", quote: "I'd want to go over the numbers with her dad before we sign anything." },
    { t: "12:37", quote: "The clear ones seem like a better fit for her, honestly." },
  ],
  draftButton: "Draft this message",
};

/* -------------------------------------------------------------------------
 * Steps 3 and 4: the letters (LetterEditor in summary-client.tsx)
 * ---------------------------------------------------------------------- */

export const LETTER_UI = {
  to: "To",
  draft: "Draft",
  drafting: "Drafting…",
  editHint: "Edit in place; the text is kept.",
  copy: "Copy",
  print: "Print / Download PDF",
  markSent: "Mark as sent",
  sendingHint: "Sending is not part of this prototype; “sent” records the date for the Letters page.",
};

export const DENTIST_LETTER = {
  to: DENTIST,
  body: `Dear Dr. Zz-Sample,

Thank you for referring ${PATIENT.name}, whom we saw today for an orthodontic consultation.

Findings: a mild Class II molar relationship on the right, about 5 mm of upper crowding, a 6 mm overjet with a deep bite, and the lower midline 2 mm to the left. Her gums are healthy and her hygiene is fair.

Recommendation: clear aligners with Class II elastics for about 18 months, followed by retainers. The family is talking the plan over at home and has not started yet.

During treatment we would be grateful for cleanings every 3 to 6 months. We will keep you posted on her progress.

Sincerely,
${DOCTOR}
${PRACTICE}`,
};

export const FAMILY_LETTER = {
  to: PATIENT.guardian,
  body: `Dear Zz-Dana,

Thank you for bringing Zz-Maya in today. Here is what we talked about, in writing, so you can share it at home.

What we saw: Zz-Maya's upper front teeth are crowded, and her top teeth sit a little ahead of her bottom teeth. Both are common and very treatable.

What we recommend: clear aligners for about 18 months, with small elastics to bring her bite into line, then retainers to keep it there.

The cost: $5,900 in total, with $500 to start and then $225 a month. We are checking your insurance, which may cover up to $1,500.

There is no rush. Talk it over, and we will call you on Thursday to answer any questions.

Warm regards,
${DOCTOR} and the team at ${PRACTICE}`,
};

/* -------------------------------------------------------------------------
 * Step 5: follow-ups (app/follow-ups/follow-ups-client.tsx)
 * ---------------------------------------------------------------------- */

export const FOLLOW_UPS = {
  title: "Follow-ups",
  subtitle: "3 cases that did not start treatment",
  filters: {
    reason: "Reason",
    owner: "Owner",
    status: "Status",
    from: "Consulted from",
    to: "to",
    any: "Any",
    /** lib/demo/data.ts REASON_LABEL's labels, verbatim. */
    reasons: [
      "Ready to start, financial pending",
      "Needs to talk to spouse",
      "Needs to think",
      "Second opinion / shopping",
      "Observation",
      "Awaiting GP clearance",
      "Not interested",
      "Not ready, nurture",
      "Started elsewhere",
      "Relative in treatment with us",
    ],
    owners: [TC.name, TC_OTHER.name],
    statuses: ["Open", "Contacted", "Scheduled start", "Lost"],
  },
  groups: { overdue: "Overdue", today: "Due today", upcoming: "Upcoming" },
  followUp: "Follow up",
  fee: "Fee",
  nextStep: "Next step",
  logCall: "Log call",
  more: "…",
  overdue: " · overdue",
  dueToday: " · due today",
  rows: [
    {
      key: "leo",
      group: "overdue" as const,
      name: "Zz-Leo Sample",
      age: "15",
      status: "Contacted",
      since: `9 days since consult · owner ${TC.initials}`,
      reasons: ["Second opinion / shopping"],
      due: "Oct 9, 2026",
      fee: "$6,200",
      nextStep: "Send a side-by-side of both quotes.",
    },
    {
      key: "noah",
      group: "today" as const,
      name: "Zz-Noah Test",
      age: "11",
      status: "Open",
      since: `6 days since consult · owner ${TC_OTHER.initials}`,
      reasons: ["Needs to think"],
      due: "Oct 12, 2026",
      fee: "$4,800",
      nextStep: "Check in after the school holiday.",
    },
    {
      key: "maya",
      group: "upcoming" as const,
      name: PATIENT.name,
      age: PATIENT.age,
      status: "Open",
      since: `0 days since consult · owner ${TC.initials}`,
      reasons: SUMMARY.reasons,
      due: "Oct 15, 2026",
      fee: "$5,900",
      nextStep: SUMMARY.nextStep.value,
    },
  ],
  panel: {
    meta: [`Consult ${CONSULT_DATE} · with ${PATIENT.guardian} · `, "summary & letters"],
    close: "close",
    summary: "Consult summary",
    fields: [
      { label: "Chief complaint", value: SUMMARY.chiefComplaint.value },
      { label: "Plan", value: SUMMARY.plan.value },
      { label: "Fee and financing", value: SUMMARY.financial.value },
      { label: "Outcome", value: SUMMARY.outcome.value },
    ],
    objectionTitle: "The objection, in their words",
    objection: "“I'd want to go over the numbers with her dad before we sign anything.”",
    timelineTitle: "Contact timeline",
    timeline: [
      { date: CONSULT_DATE, kind: "consult", text: "New patient consult; did not start." },
      { date: CONSULT_DATE, kind: "letter", text: "Family letter given at the desk." },
    ],
  },
};

/** The Dialog "Draft this message" opens (recommendation.tsx). */
export const DRAFT = {
  title: "Draft message",
  close: "close",
  body: `Hi Zz-Dana, it's Zz-Kim at ${PRACTICE}. As promised, here's Zz-Maya's plan in writing: clear aligners for about 18 months, $500 to start, then $225 a month. We're confirming your insurance now. Would Thursday after 4 work for a quick call with you both?`,
  copy: "Copy",
  closeButton: "Close",
  hint: "Sending is not part of this prototype — copy it into your email.",
};
