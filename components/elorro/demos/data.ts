/**
 * The demo screens' made-up data (app/demos/*), one set per kind of business.
 * The same people, times and words as the film's tables
 * (components/elorro/film/scenes.tsx: BOOK, DESK, REC, TOOL), copied here so
 * the demos stand on their own. Every name, number and booking is invented.
 * No prices anywhere.
 */

export const DEMO_INDUSTRIES = ["winery", "dental", "contractor", "general"] as const;
export type DemoIndustry = (typeof DEMO_INDUSTRIES)[number];
export const asDemoIndustry = (v: string | undefined): DemoIndustry =>
  v && (DEMO_INDUSTRIES as readonly string[]).includes(v) ? (v as DemoIndustry) : "general";

/** Whose app it is: the workspace in the corner. */
export const WORKSPACE: Record<DemoIndustry, { name: string; sub: string; mark: string; who: string; whoInitials: string }> = {
  winery: { name: "Your winery", sub: "Tasting room", mark: "W", who: "Tasting room", whoInitials: "TR" },
  dental: { name: "Your practice", sub: "Front office", mark: "P", who: "Front office", whoInitials: "FO" },
  contractor: { name: "Your company", sub: "Office", mark: "C", who: "Office", whoInitials: "OF" },
  general: { name: "Your business", sub: "Front desk", mark: "B", who: "Front desk", whoInitials: "FD" },
};

/* ── Booking: a booking coming in online, confirmed on its own ─────────── */

export type CalEvent = { day: number; at: number; len: number; title: string; who: string };
export type Booking = {
  /** The calendar's name, and the week shown. */
  title: string;
  range: string;
  days: [dow: string, date: string][];
  /** The rows: one an hour. */
  hours: string[];
  /** What's already booked: day (column), hour (row, from 0), length in hours. */
  events: CalEvent[];
  /** The booking that comes in. */
  guest: { name: string; initials: string; what: string; cal: string; when: string; short: string; day: number; at: number; len: number };
  /** Who the booking is for, in the app's words (guest, patient, homeowner, customer). */
  noun: string;
  /** Earlier bookings in the activity list. */
  earlier: { name: string; initials: string; what: string; ago: string }[];
};

export const BOOKING: Record<DemoIndustry, Booking> = {
  winery: {
    title: "Tasting calendar",
    range: "Dec 4 – 6, 2026",
    days: [["Fri", "4"], ["Sat", "5"], ["Sun", "6"]],
    hours: ["11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"],
    events: [
      { day: 0, at: 1, len: 1, title: "Tasting · 2 guests", who: "Hannah Lee" },
      { day: 0, at: 4, len: 1, title: "Tasting · 4 guests", who: "Raj Patel" },
      { day: 1, at: 0, len: 1, title: "Tasting · 6 guests", who: "Nguyen party" },
      { day: 1, at: 1, len: 1.5, title: "Private tour · 8", who: "Garcia party" },
      { day: 1, at: 5, len: 1, title: "Tasting · 2 guests", who: "Sam Kim" },
      { day: 2, at: 0, len: 1, title: "Tasting · 4 guests", who: "Brooks party" },
      { day: 2, at: 2, len: 1, title: "Tasting · 3 guests", who: "Ana Rivera" },
    ],
    guest: { name: "Daniel Ortiz", initials: "DO", what: "Tasting for 4", cal: "Tasting · 4 guests", when: "Sat, Dec 5 · 2:00 PM", short: "Sat 2:00 PM", day: 1, at: 3, len: 1 },
    noun: "Guest",
    earlier: [
      { name: "Sam Kim", initials: "SK", what: "Tasting for 2 · Sat 4:00 PM", ago: "Yesterday" },
      { name: "Ana Rivera", initials: "AR", what: "Tasting for 3 · Sun 1:00 PM", ago: "Yesterday" },
      { name: "Raj Patel", initials: "RP", what: "Tasting for 4 · Fri 3:00 PM", ago: "Mon" },
    ],
  },
  dental: {
    title: "Consult calendar",
    range: "Dec 2 – 4, 2026",
    days: [["Wed", "2"], ["Thu", "3"], ["Fri", "4"]],
    hours: ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM"],
    events: [
      { day: 0, at: 0, len: 1, title: "Adjustment", who: "Jordan Morris" },
      { day: 0, at: 2, len: 1, title: "New consult", who: "Linh Tran" },
      { day: 0, at: 4, len: 1, title: "Retainer check", who: "Ella Cole" },
      { day: 1, at: 0, len: 1, title: "Retainer check", who: "Noah Bishop" },
      { day: 1, at: 3, len: 1, title: "Aligner fitting", who: "Rosa Diaz" },
      { day: 2, at: 1, len: 1, title: "New consult", who: "Henry Young" },
      { day: 2, at: 4, len: 1, title: "Adjustment", who: "Samir Ali" },
    ],
    guest: { name: "Priya Shah", initials: "PS", what: "New patient consult", cal: "New consult", when: "Thu, Dec 3 · 9:00 AM", short: "Thu 9:00 AM", day: 1, at: 1, len: 1 },
    noun: "Patient",
    earlier: [
      { name: "Henry Young", initials: "HY", what: "Consult · Fri 9 AM", ago: "Yesterday" },
      { name: "Rosa Diaz", initials: "RD", what: "Aligner fitting · Thu 11 AM", ago: "Yesterday" },
      { name: "Linh Tran", initials: "LT", what: "Consult · Wed 10 AM", ago: "Mon" },
    ],
  },
  contractor: {
    title: "Site visits",
    range: "Nov 30 – Dec 2, 2026",
    days: [["Mon", "30"], ["Tue", "1"], ["Wed", "2"]],
    hours: ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM"],
    events: [
      { day: 0, at: 0, len: 1.5, title: "Site visit · Hall bath", who: "Ortega home" },
      { day: 0, at: 4, len: 1, title: "Deck walkthrough", who: "Fischer home" },
      { day: 1, at: 3, len: 1, title: "Estimate review", who: "Morgan home" },
      { day: 2, at: 0, len: 1.5, title: "Basement visit", who: "Hughes home" },
      { day: 2, at: 3, len: 1, title: "Final walkthrough", who: "Price home" },
    ],
    guest: { name: "Mark Delgado", initials: "MD", what: "Site visit · Bathroom remodel", cal: "Site visit · Bath", when: "Tue, Dec 1 · 10:00 AM", short: "Tue 10:00 AM", day: 1, at: 2, len: 1 },
    noun: "Homeowner",
    earlier: [
      { name: "Erin Price", initials: "EP", what: "Walkthrough · Wed 11 AM", ago: "Yesterday" },
      { name: "Tom Hughes", initials: "TH", what: "Basement · Wed 8 AM", ago: "Yesterday" },
      { name: "Ben Fischer", initials: "BF", what: "Deck · Mon 12 PM", ago: "Fri" },
    ],
  },
  general: {
    title: "Appointments",
    range: "Dec 1 – 3, 2026",
    days: [["Tue", "1"], ["Wed", "2"], ["Thu", "3"]],
    hours: ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"],
    events: [
      { day: 0, at: 0, len: 1, title: "Appointment", who: "Olivia Becker" },
      { day: 0, at: 4, len: 1, title: "Appointment", who: "Marcus Shaw" },
      { day: 1, at: 3, len: 1, title: "Appointment", who: "Julia Lopez" },
      { day: 2, at: 1, len: 1, title: "Appointment", who: "Ryan Grant" },
      { day: 2, at: 4, len: 1.5, title: "Appointment", who: "Nina Wells" },
    ],
    guest: { name: "Chris Walker", initials: "CW", what: "Appointment for 2", cal: "Appointment · 2", when: "Wed, Dec 2 · 11:00 AM", short: "Wed 11:00 AM", day: 1, at: 1, len: 1 },
    noun: "Customer",
    earlier: [
      { name: "Nina Wells", initials: "NW", what: "Appointment · Thu 2:00 PM", ago: "Yesterday" },
      { name: "Julia Lopez", initials: "JL", what: "Appointment · Wed 1:00 PM", ago: "Yesterday" },
      { name: "Ryan Grant", initials: "RG", what: "Appointment · Thu 11:00 AM", ago: "Mon" },
    ],
  },
};

/* ── Front desk: a call answered, booked and followed up ──────────────── */

export type Desk = {
  line: string;
  caller: { name: string; initials: string; number: string };
  transcript: [who: "caller" | "desk", text: string][];
  /** What's picked out: after the caller's first line, then in full. */
  ask: [string, string];
  steps: [title: string, detail: string][];
  /** Who the record is (guest, patient, job, customer). */
  record: string;
};

export const DESK: Record<DemoIndustry, Desk> = {
  winery: {
    line: "Tasting room line",
    caller: { name: "Maya Chen", initials: "MC", number: "707 555 0186" },
    transcript: [
      ["caller", "Hi, can I book a tasting for six?"],
      ["desk", "Of course. Which day suits you?"],
      ["caller", "Saturday afternoon, if you can."],
      ["desk", "Saturday at 2 is open. Shall I book it?"],
      ["caller", "Perfect, thank you."],
    ],
    ask: ["Tasting for 6", "Tasting for 6, Saturday afternoon"],
    steps: [
      ["Call answered", "On the first ring"],
      ["Request picked out", "Tasting for 6, Sat pm"],
      ["Slot found and booked", "Saturday, 2:00 PM"],
      ["Guest record filled in", "Maya Chen · 707 555 0186"],
      ["Confirmation text sent", "Delivered · 9:42 AM"],
    ],
    record: "Guest",
  },
  dental: {
    line: "Front desk line",
    caller: { name: "Sofia Park", initials: "SP", number: "415 555 0142" },
    transcript: [
      ["caller", "Hi, I’d like to book a consult."],
      ["desk", "Of course. Are you a new patient?"],
      ["caller", "Yes. Thursday morning, if you can."],
      ["desk", "Thursday at 10 is open. Shall I book it?"],
      ["caller", "Perfect, thank you."],
    ],
    ask: ["Consult", "New patient consult, Thursday morning"],
    steps: [
      ["Call answered", "On the first ring"],
      ["Request picked out", "New patient consult, Thu am"],
      ["Slot found and booked", "Thursday, 10:00 AM"],
      ["Patient record filled in", "Sofia Park · 415 555 0142"],
      ["Confirmation text sent", "Delivered · 9:42 AM"],
    ],
    record: "Patient",
  },
  contractor: {
    line: "Office line",
    caller: { name: "Laura Bennett", initials: "LB", number: "925 555 0173" },
    transcript: [
      ["caller", "Hi, I need an estimate for my kitchen."],
      ["desk", "Happy to help. Is it a full remodel?"],
      ["caller", "Yes. Could someone come Tuesday?"],
      ["desk", "Tuesday at 9 is open. Shall I book it?"],
      ["caller", "Perfect, thank you."],
    ],
    ask: ["Kitchen estimate", "Kitchen remodel estimate, site visit"],
    steps: [
      ["Call answered", "On the first ring"],
      ["Request picked out", "Kitchen estimate, site visit"],
      ["Site visit booked", "Tuesday, 9:00 AM"],
      ["Job record filled in", "Laura Bennett · 925 555 0173"],
      ["Confirmation text sent", "Delivered · 9:42 AM"],
    ],
    record: "Job",
  },
  general: {
    line: "Main line",
    caller: { name: "Emma Ruiz", initials: "ER", number: "510 555 0119" },
    transcript: [
      ["caller", "Hi, I’d like to book an appointment."],
      ["desk", "Of course. When suits you?"],
      ["caller", "Wednesday afternoon, if you can."],
      ["desk", "Wednesday at 3 is open. Shall I book it?"],
      ["caller", "Perfect, thank you."],
    ],
    ask: ["Appointment", "Appointment, Wednesday afternoon"],
    steps: [
      ["Call answered", "On the first ring"],
      ["Request picked out", "Appointment, Wed pm"],
      ["Slot found and booked", "Wednesday, 3:00 PM"],
      ["Customer record filled in", "Emma Ruiz · 510 555 0119"],
      ["Confirmation text sent", "Delivered · 9:42 AM"],
    ],
    record: "Customer",
  },
};

/* ── One entry: typed once, filled in everywhere ──────────────────────── */

export type Entry = {
  /** The record: its kind, and what's typed into it. */
  type: string;
  name: string;
  phone: string;
  booking: string;
  bookingLabel: string;
  /** What the email that goes out is about. */
  re: string;
  /** The booking system's row for it. */
  slot: string;
  /** The spreadsheet's name for the list. */
  sheet: string;
  /** Rows already in the spreadsheet. */
  rows: [string, string, string][];
};

export const ENTRY: Record<DemoIndustry, Entry> = {
  winery: {
    type: "Guest",
    name: "Maya Chen",
    phone: "707 555 0186",
    booking: "Tasting for 6 · Sat 2pm",
    bookingLabel: "Booking",
    re: "Your tasting, Sat 2pm",
    slot: "Sat 2:00 PM · Tasting for 6",
    sheet: "Guests 2026",
    rows: [["Raj Patel", "707 555 0144", "Tasting for 4 · Fri 3pm"], ["Ana Rivera", "707 555 0192", "Tasting for 3 · Sun 1pm"]],
  },
  dental: {
    type: "Patient",
    name: "Sofia Park",
    phone: "415 555 0142",
    booking: "Consult · Thu 10am",
    bookingLabel: "Appointment",
    re: "Your consult, Thu 10am",
    slot: "Thu 10:00 AM · New patient consult",
    sheet: "Patients 2026",
    rows: [["Henry Young", "415 555 0167", "Consult · Fri 9am"], ["Rosa Diaz", "415 555 0128", "Fitting · Thu 11am"]],
  },
  contractor: {
    type: "Job",
    name: "Laura Bennett",
    phone: "925 555 0173",
    booking: "Site visit · Tue 9am",
    bookingLabel: "Visit",
    re: "Your site visit, Tue 9am",
    slot: "Tue 9:00 AM · Bennett kitchen",
    sheet: "Jobs 2026",
    rows: [["Tom Hughes", "925 555 0131", "Site visit · Wed 8am"], ["Erin Price", "925 555 0158", "Walkthrough · Wed 11am"]],
  },
  general: {
    type: "Customer",
    name: "Emma Ruiz",
    phone: "510 555 0119",
    booking: "Appointment · Wed 3pm",
    bookingLabel: "Appointment",
    re: "Your appointment, Wed 3pm",
    slot: "Wed 3:00 PM · Appointment",
    sheet: "Customers 2026",
    rows: [["Julia Lopez", "510 555 0176", "Appointment · Wed 1pm"], ["Ryan Grant", "510 555 0134", "Appointment · Thu 11am"]],
  },
};

/* ── A tool of their own (not the practice's: theirs is Clinical Scribe) ── */

export const TOOL_INDUSTRIES = ["winery", "contractor", "general"] as const;
export type ToolIndustry = (typeof TOOL_INDUSTRIES)[number];
export const asToolIndustry = (v: string | undefined): ToolIndustry =>
  v && (TOOL_INDUSTRIES as readonly string[]).includes(v) ? (v as ToolIndustry) : "general";

export type Tool = {
  name: string;
  bar: string;
  inTitle: string;
  inSub: string;
  inLines: string[];
  button: string;
  working: string;
  outTitle: string;
  outSub: string;
  /** The output: rows, each with a second column (the estimate's notes), or the follow-up's lines. */
  outRows: [string, string][];
  kind: "summary" | "estimate" | "email";
  done: string;
  actions: [string, string];
};

export const TOOL: Record<ToolIndustry, Tool> = {
  winery: {
    name: "Weekly summary",
    bar: "Bookings & notes → weekly summary",
    inTitle: "This week’s tastings",
    inSub: "From bookings and staff notes",
    inLines: ["Sat 2pm · Tasting for 6", "Sat 4pm · Tasting for 4", "Sun 11am · Tasting for 8", "Notes: 3 asked about the club"],
    button: "Write summary",
    working: "Reading 9 bookings and 14 notes…",
    outTitle: "Weekly summary",
    outSub: "Ready Monday, 7am",
    outRows: [
      ["9 tastings, 38 guests", "Up from last week"],
      ["Busiest: Saturday afternoon", "Both 2pm and 4pm full"],
      ["3 asked about the wine club", "Follow-ups queued"],
      ["Thank-you notes drafted", "One for each party"],
    ],
    kind: "summary",
    done: "Summary ready",
    actions: ["Share with team", "Edit"],
  },
  contractor: {
    name: "Estimate writer",
    bar: "Site notes → estimate",
    inTitle: "Site notes · Bennett kitchen",
    inSub: "Taken on site, Tue 9:00 AM",
    inLines: ["12 × 14 ft, gut to the studs", "New cabinets, quartz tops", "Move the sink to the island", "Permit needed"],
    button: "Draft estimate",
    working: "Turning site notes into line items…",
    outTitle: "Estimate",
    outSub: "Bennett kitchen · draft",
    outRows: [
      ["Demolition & haul-away", "Full gut, to the studs"],
      ["Cabinets & install", "New, full height"],
      ["Quartz countertops", "Perimeter and island"],
      ["Plumbing: sink to island", "Permit included"],
    ],
    kind: "estimate",
    done: "Estimate drafted",
    actions: ["Send to Laura", "Edit"],
  },
  general: {
    name: "Follow-up writer",
    bar: "Notes → follow-up",
    inTitle: "Call notes · Emma Ruiz",
    inSub: "From today’s call, 9:42 AM",
    inLines: ["Wants to start next month", "Asked about weekend times", "Send the details by Friday", "Prefers email"],
    button: "Draft follow-up",
    working: "Writing from your call notes…",
    outTitle: "Follow-up",
    outSub: "To Emma Ruiz · draft",
    outRows: [
      ["Hi Emma, thanks for the call.", ""],
      ["Weekend times work well, and", ""],
      ["here’s everything you need to", ""],
      ["start next month. Talk soon!", ""],
    ],
    kind: "email",
    done: "Follow-up drafted",
    actions: ["Send to Emma", "Edit"],
  },
};

/* ── Reviews: an inbox of reviews, answered, and more of them asked for ─── */

export type Review = { name: string; initials: string; stars: number; ago: string; text: string };
export type Reviews = {
  /**
   * The rating before the flow: how many reviews, the sum of their stars, and
   * how they split, 5 stars down to 1 (adding up to both). Each new review is
   * 5 stars, and every rating shown is the sum over the count, to one place.
   */
  count: number;
  sum: number;
  split: [five: number, four: number, three: number, two: number, one: number];
  /** The 5-star review that comes in, and the reply drafted and posted to it. */
  fresh: Review & { reply: string };
  /** The older 3-star review, and its calm reply. */
  low: Review & { reply: string };
  /** An older one, answered before. */
  older: Review & { reply: string };
  /** The "How did we do?" text to a recent happy customer, and who they are. */
  ask: { name: string; initials: string; context: string; text: string };
  /** Who's asked, in the app's words. */
  askSub: string;
  /** The review that lands after it. */
  landed: Review;
};

export const REVIEWS: Record<DemoIndustry, Reviews> = {
  winery: {
    count: 125,
    sum: 606,
    split: [111, 11, 2, 0, 1],
    fresh: {
      name: "Rachel Moreno",
      initials: "RM",
      stars: 5,
      ago: "Just now",
      text: "Our host knew every bottle and the story behind it, and the view from the terrace at sunset was unreal. Best tasting we’ve done in the valley.",
      reply: "Thank you, Rachel! We’ll pass your kind words on to the team. Sunset on the terrace is our favourite hour too. Come back and see us soon.",
    },
    low: {
      name: "Greg Thornton",
      initials: "GT",
      stars: 3,
      ago: "2 weeks ago",
      text: "Beautiful view, but we waited a long time to be seated on a busy Saturday and nobody told us why.",
      reply: "Thank you for the honest feedback, Greg. A long wait with no word from us isn’t the welcome we want to give. We’d like to hear more, so please get in touch with the tasting room.",
    },
    older: {
      name: "Hannah Lee",
      initials: "HL",
      stars: 5,
      ago: "3 weeks ago",
      text: "Gorgeous setting and a relaxed, friendly tasting. We’ll be back in the spring.",
      reply: "Thank you, Hannah! We’ll save you a table on the terrace.",
    },
    ask: { name: "Sam Kim", initials: "SK", context: "Tasting for 2 · today", text: "Hi Sam, thanks for tasting with us today! How did we do? A quick review helps other guests find us." },
    askSub: "After a tasting, happy guests get a text.",
    landed: { name: "Sam Kim", initials: "SK", stars: 5, ago: "Just now", text: "Warm welcome, lovely wines and a view we’ll be back for." },
  },
  dental: {
    count: 76,
    sum: 353,
    split: [60, 10, 3, 1, 2],
    fresh: {
      name: "Megan Ross",
      initials: "MR",
      stars: 5,
      ago: "Just now",
      text: "No wait at all, and the front desk was so kind to my daughter. Everyone was gentle and calm with her, and she left smiling.",
      reply: "Thank you so much for taking the time to write this, Megan. We’ll share your kind words with the whole team.",
    },
    low: {
      name: "Chris Patel",
      initials: "CP",
      stars: 3,
      ago: "2 weeks ago",
      text: "Friendly staff, but it was hard to get through on the phone to change a time.",
      reply: "Thank you for letting us know, Chris, and we’re sorry it was hard to reach us. We’d welcome the chance to talk, so please call the front office and ask for the office manager.",
    },
    older: {
      name: "Ella Cole",
      initials: "EC",
      stars: 5,
      ago: "3 weeks ago",
      text: "Always friendly, always on time, and so easy to book.",
      reply: "Thank you, Ella! We’ll pass this on to the team.",
    },
    ask: { name: "Lauren Brooks", initials: "LB", context: "Today, 9:00 AM", text: "Hi Lauren, thanks for choosing us! How did we do? A quick review helps other families find us." },
    askSub: "Happy families get a quick text afterwards.",
    landed: { name: "Lauren Brooks", initials: "LB", stars: 5, ago: "Just now", text: "Friendly team and no waiting around. Highly recommend." },
  },
  contractor: {
    count: 61,
    sum: 283,
    split: [49, 7, 2, 1, 2],
    fresh: {
      name: "Kevin Shaw",
      initials: "KS",
      stars: 5,
      ago: "Just now",
      text: "They showed up on time every single day, sent us an update every evening, and left the site spotless. Our kitchen came out better than we pictured.",
      reply: "Thank you, Kevin! Daily updates and a clean site are how we like to work. Enjoy the new kitchen, and we’re here if you need anything.",
    },
    low: {
      name: "Linda Ford",
      initials: "LF",
      stars: 3,
      ago: "2 weeks ago",
      text: "Good work in the end, but the job ran a week longer than we were told.",
      reply: "Thank you for the feedback, Linda. You should be able to count on the schedule we give you, and we’re sorry we fell short. Please call the office; we’d like to talk it through.",
    },
    older: {
      name: "Erin Price",
      initials: "EP",
      stars: 5,
      ago: "3 weeks ago",
      text: "Clear plan, tidy crew, and finished when they said they would.",
      reply: "Thanks, Erin! It was a pleasure working with you.",
    },
    ask: { name: "Ben Fischer", initials: "BF", context: "Deck finished · today", text: "Hi Ben, thanks for trusting us with your deck! How did we do? A quick review helps other homeowners find us." },
    askSub: "When a job wraps, happy clients get a text.",
    landed: { name: "Ben Fischer", initials: "BF", stars: 5, ago: "Just now", text: "On time, easy to reach, and the crew cleaned up every day." },
  },
  general: {
    count: 212,
    sum: 1028,
    split: [191, 15, 3, 1, 2],
    fresh: {
      name: "Alicia Moore",
      initials: "AM",
      stars: 5,
      ago: "Just now",
      text: "From the moment I walked in, they made me feel welcome. They listened, explained everything and followed up the next day. That’s rare.",
      reply: "Thank you, Alicia! Making people feel welcome is what we care about most, and we’re so glad it showed. See you next time.",
    },
    low: {
      name: "Paul Dixon",
      initials: "PD",
      stars: 3,
      ago: "2 weeks ago",
      text: "Helpful once I got through, but I was on hold a lot longer than I’d like.",
      reply: "Thank you for the honest review, Paul. A long hold isn’t good enough, and we’re working on it. If you’re open to it, please get in touch so we can make it right.",
    },
    older: {
      name: "Julia Lopez",
      initials: "JL",
      stars: 5,
      ago: "3 weeks ago",
      text: "Quick, friendly and easy to book. Exactly what I needed.",
      reply: "Thank you, Julia! See you soon.",
    },
    ask: { name: "Nina Wells", initials: "NW", context: "Visited today", text: "Hi Nina, thanks for coming in today! How did we do? A quick review helps other people find us." },
    askSub: "After a visit, happy customers get a text.",
    landed: { name: "Nina Wells", initials: "NW", stars: 5, ago: "Just now", text: "Friendly, quick and genuinely helpful. Will be back." },
  },
};
