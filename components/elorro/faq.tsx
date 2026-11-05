"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { hero, people } from "@/lib/elorro";
import { answerFor, faqs, faqSection, homeFaqs, type Faq as Question } from "@/lib/faq";
import { cn } from "@/lib/utils";

/**
 * Questions, a chat-style FAQ: on the home page before Contact (the five
 * marked `home`), on /questions all ten. No live AI and no calls to anything.
 * The visitor taps a question or types one, and the reply is only ever an
 * answer from lib/faq.ts, whole, or the line that sends them to the call.
 *
 * A question goes in the thread as their bubble, on the right; then three
 * dots (DOTS_MS); then our reply on the left, its words coming in within
 * TYPE_MS. Under reduced motion the reply is simply there, with no dots.
 *
 * Nothing here ever scrolls the page. A reply takes its full size the moment
 * it arrives and only its words fade in, so typing never moves anything, and
 * the only thing scrolled is the thread's own box, capped in height, to keep
 * the newest in view. The thread is sticky (elorro.css, "questions") so that
 * a reply is on screen wherever the chip that asked for it was: beside the
 * chips on desktop; on phones under them, but held up at the foot of the
 * screen when that's further down than the screen reaches.
 *
 * Every question and answer on the page is in its server HTML: in the list
 * shown when scripting is off, and in the FAQPage JSON-LD.
 */

const DOTS_MS = 600;
/** How long a reply's words take to come in, at most, and the most any one word waits. */
const TYPE_MS = 1000;
const WORD_MS = 65;

/** One question in the thread: what was asked, and how its reply is coming. */
type Turn = {
  key: number;
  question: string;
  /** The answer, or nothing for a question with no good match. */
  faq?: Question;
  /** "typing": the dots. "typed": the words coming in. "still": all at once. */
  reply: "typing" | "typed" | "still";
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Faq({ all = false }: { all?: boolean }) {
  const shown = all ? faqs : homeFaqs;
  const Label = all ? "h1" : "p";

  const [thread, setThread] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const turns = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  // The newest in view, inside the thread's own box.
  useEffect(() => {
    const el = box.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [thread]);

  const ask = (question: string, faq?: Question) => {
    const key = turns.current++;
    if (reducedMotion()) {
      setThread((t) => [...t, { key, question, faq, reply: "still" }]);
      return;
    }
    setThread((t) => [...t, { key, question, faq, reply: "typing" }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setThread((t) => t.map((turn) => (turn.key === key ? { ...turn, reply: "typed" } : turn)));
    }, DOTS_MS);
    timers.current.add(timer);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question) return;
    setDraft("");
    ask(question, answerFor(question));
    // A phone's keyboard would otherwise sit over the reply.
    if (window.matchMedia("(pointer: coarse)").matches) input.current?.blur();
  };

  const asked = new Set(thread.map((turn) => turn.faq?.id));

  return (
    <section className={cn("faq sec", all && "faq--page")} id="questions" aria-labelledby="questions-h">
      <div className="wrap">
        <div className="faq-head">
          <Label className="sec-label label">{faqSection.label}</Label>
          <h2 className="sec-h" id="questions-h">
            {faqSection.title}
          </h2>
          <p className="faq-lede">{faqSection.lede}</p>
        </div>

        <div className="faq-ask">
          <ul className="faq-chips">
            {shown.map((faq) => (
              <li key={faq.id}>
                <button
                  type="button"
                  className={cn("faq-chip", asked.has(faq.id) && "is-asked")}
                  onClick={() => ask(faq.q, faq)}
                >
                  {faq.q}
                </button>
              </li>
            ))}
          </ul>

          <form className="faq-form" onSubmit={onSubmit}>
            <div className="field">
              <label className="label" htmlFor="faq-question">
                {faqSection.ask}
              </label>
              <input
                ref={input}
                id="faq-question"
                type="text"
                autoComplete="off"
                enterKeyHint="send"
                maxLength={200}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            <button className="faq-send" type="submit">
              {faqSection.send}
            </button>
          </form>
        </div>

        <div
          ref={box}
          className="faq-thread"
          role="log"
          aria-live="polite"
          aria-label={faqSection.thread}
          tabIndex={thread.length ? 0 : undefined}
        >
          {thread.map((turn) => (
            <div key={turn.key} className="faq-turn">
              <p className="faq-you">
                <span className="sr-only">{faqSection.you} </span>
                {turn.question}
              </p>
              <Reply turn={turn} />
            </div>
          ))}
        </div>

        {!all && (
          <p className="more">
            <Link href="/questions">{faqSection.more}</Link>
          </p>
        )}

        {/* The questions and answers as plain text, for scripting off and for search. */}
        <dl className="faq-all">
          {shown.map((faq) => (
            <div key={faq.id}>
              <dt>{faq.q}</dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(shown)).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}

/** Our side of a turn: the small A & J, and the dots or the reply. */
function Reply({ turn }: { turn: Turn }) {
  const text = turn.faq?.a ?? faqSection.noMatch;
  const words = text.split(" ");
  const step = Math.min(WORD_MS, TYPE_MS / words.length);
  const typed = turn.reply === "typed";

  return (
    <div className="faq-us">
      <span className="faq-mark" aria-hidden="true">
        {people.a.initial}
        <span className="gold">&amp;</span>
        {people.j.initial}
      </span>

      {turn.reply === "typing" ? (
        <div className="faq-reply">
          <span className="faq-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      ) : (
        <div className="faq-reply">
          <span className="sr-only">{faqSection.us} </span>
          {/* Whole for screen readers, the moment it arrives; word by word for the eye. */}
          {typed ? (
            <p>
              <span className="sr-only">{text}</span>
              <span aria-hidden="true">
                {words.map((word, i) => (
                  <span key={i} className="faq-word" style={{ animationDelay: `${Math.round(i * step)}ms` }}>
                    {word}{" "}
                  </span>
                ))}
              </span>
            </p>
          ) : (
            <p>{text}</p>
          )}
          {!turn.faq && (
            <a
              className={cn("act", typed && "faq-word")}
              href={hero.cta.href}
              style={typed ? { animationDelay: `${TYPE_MS}ms` } : undefined}
            >
              {hero.cta.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** The questions on the page, for search engines. */
const jsonLd = (items: Question[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
});
