/**
 * Copy for the Questions section (components/elorro/faq.tsx): the home page
 * shows the five marked `home`, /questions all ten, in this order.
 *
 * Nothing here is generated, on the page or anywhere else. A typed question
 * is matched to one of these answers by its keywords and gets that answer
 * whole, or `noMatch`. To change what the section says, change it here.
 */

export type Faq = {
  id: string;
  q: string;
  a: string;
  /** Also on the home page. */
  home?: boolean;
  /** What points to this answer, in lower case: a phrase scores 3, a word 2. */
  keywords: string[];
  /** Words that also turn up in other kinds of question: 1 each. */
  weak?: string[];
};

export const faqs: Faq[] = [
  {
    id: "cost",
    q: "How much does it cost?",
    a: "We don’t put prices on the site, because every business needs something different. After a 30-minute call, we send you a one-page plan with what we’d do, what it costs and when it’s done.",
    home: true,
    keywords: ["price", "pricing", "cost", "how much", "quote", "budget", "charge", "fee", "rate", "expensive", "afford"],
  },
  {
    id: "who",
    q: "Who will I actually be working with?",
    a: "Us two. The two people on the first call are the two people doing the work. No account managers, no handoffs, nothing farmed out.",
    home: true,
    keywords: [
      "team",
      "people",
      "account manager",
      "who will",
      "who would",
      "who do",
      "who are",
      "who is",
      "who does",
      "whos",
      "you two",
      "handoff",
      "freelancer",
      "outsource",
    ],
    weak: ["who"],
  },
  {
    id: "existing",
    q: "I already have a website. Do we have to start over?",
    a: "Not always. We look at what’s working first. Sometimes it needs fixing and getting found, sometimes a rebuild. We’ll tell you which on the call.",
    home: true,
    keywords: [
      "existing",
      "already have",
      "redesign",
      "rebuild",
      "start over",
      "current site",
      "current website",
      "old site",
      "old website",
      "fix my site",
      "fix my website",
    ],
    weak: ["fix"],
  },
  {
    id: "own",
    q: "Do I own my website?",
    a: "Yes. The site, the domain and the data are in your name from day one. If you ever leave, it all goes with you.",
    home: true,
    keywords: ["ownership", "domain", "own my", "own the", "i own", "owns", "my data", "if i leave", "cancel", "take it with"],
    weak: ["own", "data", "leave"],
  },
  {
    id: "phones",
    q: "How does the phone answering work?",
    a: "When you’re with a customer or closed for the day, the line still answers. It handles the common questions, takes the details, and books the appointment or passes it to you.",
    home: true,
    keywords: [
      "phone answering",
      "answer the phone",
      "answer my phone",
      "answer calls",
      "answer my calls",
      "answering service",
      "call answering",
      "calls",
      "answering",
      "receptionist",
      "missed",
      "voicemail",
      "after hours",
    ],
    weak: ["phone", "answer"],
  },
  {
    id: "time",
    q: "How long does it take?",
    a: "It depends on what we’re building. The one-page plan gives you a date before anything starts.",
    keywords: ["how long", "how soon", "how fast", "how quickly", "timeline", "turnaround", "deadline", "weeks", "when will", "when can"],
    weak: ["when"],
  },
  {
    id: "ai",
    q: "What does showing up in AI search mean?",
    a: "More people now ask ChatGPT who to call. Its answers come from what the web says about you. So we make sure your site and listings say plainly what you do, where and for whom.",
    keywords: ["chatgpt", "chat gpt", "ai search", "ai", "perplexity", "gemini"],
  },
  {
    id: "shoot",
    q: "Do you come to us for photos and video?",
    a: "Yes. We plan the shoot first so the day goes quickly, then shoot on location around how your business runs.",
    keywords: ["photo", "video", "shoot", "drone", "photography", "photographer", "footage", "film", "filming", "come to us", "come to me", "on location"],
  },
  {
    id: "after",
    q: "What happens after it launches?",
    a: "We stay on it every month: new pages and photos as the business changes, search checked and tuned, and you can see what came in and from where.",
    keywords: ["launch", "launches", "maintenance", "monthly", "support", "ongoing", "retainer", "updates", "goes live", "go live"],
    weak: ["after"],
  },
  {
    id: "start",
    q: "What do you need from me to get started?",
    a: "A 30-minute call, so we can get to know each other and the problem you’re trying to solve. If it’s a fit, we send a one-page plan, and once you say go, we take it from there.",
    keywords: ["get started", "getting started", "next step", "first step", "need from me", "how do i start", "how do we start", "sign up", "begin"],
    weak: ["start"],
  },
];

export const homeFaqs = faqs.filter((f) => f.home);

export const faqSection = {
  /** Over the section, as the other sections are labelled. Not in the home section nav. */
  label: "Questions",
  title: "Questions before the call.",
  lede: "Tap one, or ask your own.",
  ask: "Ask your own question",
  send: "Send",
  /** The link under the home page's section. */
  more: "See all questions",
  /** What a typed question with no good match gets, over the button to Contact. */
  noMatch: "Good one for the call. Book a time and we’ll answer it properly.",
  /** For screen readers: the thread's name, and who said each thing in it. */
  thread: "Your questions and our answers",
  you: "You asked:",
  us: "Ashan and Jordan:",
};

export const questionsPage = {
  title: "Questions | Elorro",
  description:
    "Questions before the call: what it costs, who you’ll be working with, whether you own your website, how the phone answering works and what happens after it launches.",
};

/** Lower case, apostrophes dropped, anything else that isn't a letter or digit a space; padded so whole words can be found. */
const clean = (text: string) =>
  ` ${text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

/** Whole words only, so "email" isn't "ai" and "town" isn't "own"; a plural counts. */
const says = (text: string, keyword: string) => text.includes(` ${keyword} `) || text.includes(` ${keyword}s `);

const score = (text: string, { keywords, weak = [] }: Faq) =>
  keywords.reduce((sum, k) => sum + (says(text, k) ? (k.includes(" ") ? 3 : 2) : 0), 0) +
  weak.filter((k) => says(text, k)).length;

/**
 * The answer closest to a typed question, or undefined if nothing scores
 * well. In a short question ("who are you?") one weak word is enough; in a
 * longer one it isn't ("do you fix plumbing?"). A tie goes to the earlier
 * question. All ten are in the running, on the home page too.
 */
export function answerFor(question: string): Faq | undefined {
  const text = clean(question);
  const enough = text.trim().split(" ").length <= 3 ? 1 : 2;
  let best: Faq | undefined;
  let top = enough - 1;
  for (const faq of faqs) {
    const points = score(text, faq);
    if (points > top) {
      best = faq;
      top = points;
    }
  }
  return best;
}
