"use client";

import type { CSSProperties, ReactNode } from "react";
import { REVIEWS, WORKSPACE, type DemoIndustry, type Review } from "@/components/elorro/demos/data";
import { Avatar, Check, Chip, DemoPlayer, Icon, Pending, Shell, appear, ease, prog, type Tone } from "@/components/elorro/demos/kit";

/**
 * Reviews: the business's reviews inbox, its rating and count. A 5-star
 * review comes in, in their customer's words; a reply is drafted and posted.
 * The older 3-star review gets a calm, professional reply too. Then a "How
 * did we do?" text goes to a recent happy customer, and their review lands:
 * the count and the rating tick up. Every rating shown is the stars' sum over
 * the count (data.ts, REVIEWS), to one place. Times in seconds into the flow.
 */
export const REVIEWS_T = {
  /** The new review comes in at the top; the count ticks up. */
  arrive: 0.5,
  /** Its reply box opens, drafted for you; the draft writes itself; Post pressed; posted. */
  draft: 1.3,
  type: [1.5, 2.7] as [number, number],
  post: 3.15,
  posted: 3.3,
  /** The 3-star review: its reply box opens, writes, and is posted. */
  low: 3.9,
  lowType: [4.1, 5.3] as [number, number],
  lowPost: 5.75,
  lowPosted: 5.9,
  /** The "How did we do?" text goes out. */
  ask: 6.4,
  sent: 6.85,
  /** Their review lands: the count ticks up, then the rating. */
  land: 7.8,
  rate: 8.1,
  duration: 10,
};
const T = REVIEWS_T;

const NAV = (needs: number, noun: string) => [
  { icon: "chat", label: "Reviews", count: needs || undefined },
  { icon: "send", label: "Review requests" },
  { icon: "users", label: noun },
  { icon: "chart", label: "Reports" },
  { icon: "settings", label: "Settings" },
];
const TABS = [
  { icon: "chat", label: "Reviews" },
  { icon: "send", label: "Requests" },
  { icon: "chart", label: "Reports" },
  { icon: "settings", label: "Settings" },
];
const NOUN: Record<DemoIndustry, string> = { winery: "Guests", dental: "Families", contractor: "Clients", general: "Customers" };

export function ReviewsDemo({ ind, capture }: { ind: DemoIndustry; capture: boolean }) {
  return (
    <DemoPlayer
      duration={T.duration}
      capture={capture}
      label={`Demo: reviews for ${WORKSPACE[ind].name.toLowerCase()}, answered, and more of them asked for`}
      draw={(t, phone) => (phone ? <Phone ind={ind} t={t} /> : <Desktop ind={ind} t={t} />)}
    />
  );
}

/* ── The numbers, at `t` ───────────────────────────────────────────────── */

/** How many new reviews are in by `t`: the first at `arrive`, the second at `land`. */
const landedBy = (t: number) => (t >= T.land ? 2 : t >= T.arrive ? 1 : 0);
/** The rating after `k` new 5-star reviews, as shown: the sum over the count, to one place. */
const ratingAfter = (ind: DemoIndustry, k: number) => {
  const R = REVIEWS[ind];
  return (R.sum + 5 * k) / (R.count + k);
};
/** Reviews still to answer: the 3-star, the new one until it's answered, and the one that lands at the end. */
const needsReply = (t: number) => (t < T.lowPosted ? 1 : 0) + (t >= T.arrive && t < T.posted ? 1 : 0) + (t >= T.land ? 1 : 0);

/** Text written over `at` to `end`, letter by letter. */
const writing = (text: string, t: number, at: number, end: number) => text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, (t - at) / (end - at)))));

/**
 * While the 3-star review is answered, the list is scrolled up a little so its
 * reply is in full view (by a fixed amount: the folded first card's height on
 * the phone, whose one line never wraps); back at the top for the review
 * that lands.
 */
const DESK_SCROLL = 64;
const PHONE_SCROLL = 62;
const scrolled = (t: number, by: number): CSSProperties | undefined => {
  const p = ease(prog(t, T.low - 0.1, 0.5)) * (1 - ease(prog(t, T.ask - 0.3, 0.5)));
  return p > 0 ? { transform: `translateY(${(-by * p).toFixed(2)}px)` } : undefined;
};

/* ── Small parts ───────────────────────────────────────────────────────── */

const STAR = "M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.47L12 17.46l-5.8 3.06 1.1-6.47-4.7-4.6 6.5-.95z";

/** Whole stars, `n` of 5 filled. */
function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="dm-stars" role="img" aria-label={`${n} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} className={i < n ? "is-on" : undefined} aria-hidden="true">
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

/** A rating's stars, each filled as far as the rating reaches it (4.8: four, and most of the fifth). */
function RatingStars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="dm-stars" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="dm-star-part" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
              <path d={STAR} />
            </svg>
            <span style={{ width: `${(f * 100).toFixed(1)}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} className="is-on" aria-hidden="true">
                <path d={STAR} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** A value that ticks over at `at`: the old one rising out, the new one rising in. */
function Tick({ from, to, t, at }: { from: string; to: string; t: number; at: number }) {
  const p = ease(prog(t, at, 0.4));
  if (from === to || p >= 1) return <span className="dm-tick">{p >= 1 ? to : from}</span>;
  if (p <= 0) return <span className="dm-tick">{from}</span>;
  return (
    <span className="dm-tick">
      <span style={{ opacity: 1 - p, transform: `translateY(${(-0.7 * p).toFixed(3)}em)` }}>{from}</span>
      <span style={{ opacity: p, transform: `translateY(${(0.7 * (1 - p)).toFixed(3)}em)` }} aria-hidden="true">
        {to}
      </span>
    </span>
  );
}

/** Open to `open` (0 to 1) of its content's height. */
function Fold({ open, children, style }: { open: number; children: ReactNode; style?: CSSProperties }) {
  if (open >= 1) return <div style={style}>{children}</div>;
  return (
    <div className="dm-fold" style={{ gridTemplateRows: `${Math.max(0, open).toFixed(4)}fr`, opacity: Math.min(1, open * 1.6), ...style }}>
      <div>{children}</div>
    </div>
  );
}

/** One chip giving way to another at `at`. */
function ChipSwap({ a, b, t, at }: { a: [Tone, string]; b: [Tone, string]; t: number; at: number }) {
  const p = ease(prog(t, at, 0.3));
  return (
    <span className="dm-chipswap">
      <Chip tone={a[0]} style={{ opacity: 1 - p }}>
        {a[1]}
      </Chip>
      <Chip tone={b[0]} style={{ opacity: p }}>
        {b[1]}
      </Chip>
    </span>
  );
}

/** A step, waiting until `at`, then ticked. */
function Step({ t, at, children }: { t: number; at: number; children: ReactNode }) {
  const p = prog(t, at, 0.3);
  return (
    <span className="dm-rv-step" style={{ color: p > 0 ? undefined : "var(--faint)" }}>
      <span style={{ position: "relative", width: 16, height: 16, display: "inline-block", flex: "none" }}>
        <span style={{ position: "absolute", inset: 0, opacity: 1 - p }}>
          <Pending size={16} />
        </span>
        <span style={{ position: "absolute", inset: 0 }}>
          <Check p={p} size={16} />
        </span>
      </span>
      {children}
    </span>
  );
}

/** A review: who, their stars and when, a status, and what they wrote; then the reply, if any. */
function ReviewCard({
  r,
  status,
  note,
  hl = 0,
  body = 1,
  phone,
  children,
}: {
  r: Review;
  status?: ReactNode;
  /** A small line under the name (where it came from). */
  note?: string;
  /** Highlighted, while it's being answered (0 to 1). */
  hl?: number;
  /** How much of its words and reply show (folded away on the phone, once done with). */
  body?: number;
  phone?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`dm-rv${phone ? " dm-rv--phone dm-card" : ""}`}
      style={hl > 0 ? { boxShadow: `inset 3px 0 0 rgba(184, 142, 64, ${hl.toFixed(3)})`, background: `rgba(251, 245, 232, ${(hl * 0.55).toFixed(3)})` } : undefined}
    >
      <div className="dm-rv-head">
        <Avatar name={r.name} initials={r.initials} size={phone ? 32 : 34} />
        <div className="dm-rv-who">
          <strong>{r.name}</strong>
          <span>
            <Stars n={r.stars} size={phone ? 13 : 13} />
            <span>{r.ago}</span>
          </span>
        </div>
        {status}
      </div>
      <Fold open={body}>
        {note && (
          <span className="dm-rv-note">
            <Icon name="send" size={12} />
            {note}
          </span>
        )}
        <p className="dm-rv-text">{r.text}</p>
        {children}
      </Fold>
    </div>
  );
}

/**
 * The reply under a review: opening at `open`, drafted for them (written over
 * `type`), Post pressed at `post`, and from `posted` the owner's response.
 * Already `done`: just the response.
 */
function Reply({
  text,
  t,
  open,
  type,
  post,
  posted,
  done,
  phone,
}: {
  text: string;
  t: number;
  open?: number;
  type?: [number, number];
  post?: number;
  posted?: number;
  done?: boolean;
  phone?: boolean;
}) {
  if (done) {
    return (
      <div className="dm-reply is-posted">
        <span className="dm-reply-label">Response from the owner</span>
        <p className="dm-reply-text">{text}</p>
      </div>
    );
  }
  const o = ease(prog(t, open!, 0.4));
  const shown = writing(text, t, type![0], type![1]);
  const live = t >= type![0] && t < posted!;
  const caret = live && (t < type![1] || Math.floor((t - type![1]) * 2.4) % 2 === 0);
  const p = ease(prog(t, posted!, 0.3));
  const press = prog(t, post!, 0.16);
  const down = press > 0 && press < 1;
  return (
    <Fold open={o}>
      <div
        className="dm-reply"
        style={{ borderColor: `rgba(184, 142, 64, ${(0.85 * (1 - p)).toFixed(3)})`, boxShadow: p < 1 ? `0 0 0 3px rgba(184, 142, 64, ${(0.14 * (1 - p)).toFixed(3)})` : undefined }}
      >
        <span className="dm-reply-bg" style={{ opacity: p }} />
        <span className="dm-reply-top">
          <span className="dm-reply-labels">
            <span className="dm-reply-label dm-reply-label--draft" style={{ opacity: 1 - p }}>
              <Icon name="sparkle" size={13} />
              {t < type![0] ? "Drafting a reply…" : phone ? "Drafted for you" : "Reply, drafted for you"}
            </span>
            <span className="dm-reply-label" style={{ opacity: p }}>
              {phone ? "Owner’s response · Just now" : "Response from the owner · Just now"}
            </span>
          </span>
          {p < 1 && (
            <span className="dm-reply-actions" style={{ opacity: 1 - p }}>
              <span className="dm-btn">Edit</span>
              <span className="dm-btn dm-btn--main" style={{ transform: down ? "scale(.96)" : undefined, filter: down ? "brightness(.92)" : undefined, opacity: t < type![1] ? 0.55 : 1 }}>
                <Icon name="send" size={13} />
                Post{phone ? "" : " reply"}
              </span>
            </span>
          )}
        </span>
        <p className="dm-reply-text" style={{ minHeight: phone ? undefined : "2.9em" }}>
          {shown}
          {caret && <span className="dm-caret" />}
          {/* The rest, unseen, holds the box at its full size from the start. */}
          <span className="dm-reply-ghost" aria-hidden="true">
            {text.slice(shown.length)}
          </span>
        </p>
      </div>
    </Fold>
  );
}

/** The rating, its stars and the count, ticking as reviews land. */
function numbers(ind: DemoIndustry, t: number) {
  const R = REVIEWS[ind];
  const k = landedBy(t);
  const rating = (n: number) => ratingAfter(ind, n).toFixed(1);
  const count = (n: number) => `${R.count + n} reviews`;
  // The count ticks as each review comes in; the rating a moment after the second.
  const countEl = k === 0 ? <Tick from={count(0)} to={count(1)} t={t} at={T.arrive + 0.15} /> : <Tick from={count(1)} to={count(2)} t={t} at={T.land + 0.15} />;
  const ratingEl = <Tick from={rating(1)} to={rating(2)} t={t} at={T.rate} />;
  // The stars follow the rating shown.
  const value = t >= T.rate + 0.2 ? ratingAfter(ind, 2) : ratingAfter(ind, Math.min(1, k));
  const glow = Math.sin(Math.PI * prog(t, T.rate, 1.1));
  const split = R.split.map((c, i) => (i === 0 ? c + k : c));
  return { R, k, countEl, ratingEl, value, glow, split, total: R.count + k };
}

/* ── Desktop: the inbox, and the rating and the asking down the right ──── */

function Desktop({ ind, t }: { ind: DemoIndustry; t: number }) {
  const { R, countEl, ratingEl, value, glow, split, total } = numbers(ind, t);
  const needs = needsReply(t);
  const hlLow = ease(prog(t, T.low - 0.1, 0.35)) * (1 - ease(prog(t, T.lowPosted + 0.5, 0.4)));
  const hlFresh = ease(prog(t, T.draft - 0.2, 0.35)) * (1 - ease(prog(t, T.posted + 0.4, 0.4)));
  return (
    <Shell phone={false} ind={ind} nav={NAV(needs, NOUN[ind])} active={0} title="Reviews" sub="From Google · replies drafted for you" tools={<Chip tone="live">Live</Chip>}>
      <div className="dm-rvw">
        <div className="dm-card dm-rv-list">
          <div className="dm-rv-list-head">
            <span className="is-on">All reviews</span>
            <span>
              Needs reply
              <em>{needs}</em>
            </span>
            <span className="dm-rv-sort">Newest first</span>
          </div>
          <div className="dm-rv-view">
            <div className="dm-rv-items" style={scrolled(t, DESK_SCROLL)}>
              {/* Their review, after the text. */}
              <Fold open={ease(prog(t, T.land, 0.5))}>
                <div style={appear(t, T.land + 0.1, { dy: -6, len: 0.4 })}>
                  <ReviewCard r={R.landed} note="After your review request" status={<Chip tone="new">New</Chip>} hl={0.6 * (1 - ease(prog(t, T.land + 1.2, 0.6)))} />
                </div>
              </Fold>
              {/* The new review, and its reply. */}
              <Fold open={ease(prog(t, T.arrive, 0.5))}>
                <div style={appear(t, T.arrive + 0.1, { dy: -6, len: 0.4 })}>
                  <ReviewCard r={R.fresh} hl={hlFresh} status={<ChipSwap a={["new", "New"]} b={["done", "Replied"]} t={t} at={T.posted} />}>
                    <Reply text={R.fresh.reply} t={t} open={T.draft} type={T.type} post={T.post} posted={T.posted} />
                  </ReviewCard>
                </div>
              </Fold>
              {/* The 3-star one, waiting for a reply. */}
              <ReviewCard r={R.low} hl={hlLow} status={<ChipSwap a={["pending", "Needs reply"]} b={["done", "Replied"]} t={t} at={T.lowPosted} />}>
                <Reply text={R.low.reply} t={t} open={T.low} type={T.lowType} post={T.lowPost} posted={T.lowPosted} />
              </ReviewCard>
              <ReviewCard r={R.older} status={<Chip tone="done">Replied</Chip>}>
                <Reply text={R.older.reply} t={t} done />
              </ReviewCard>
            </div>
          </div>
        </div>

        <div className="dm-rv-side">
          <div className="dm-card dm-score">
            <span className="dm-label">Google rating</span>
            <div className="dm-score-row">
              <span className="dm-score-num">
                <span className="dm-score-glow" style={{ opacity: glow }} />
                {ratingEl}
              </span>
              <span className="dm-score-sub">
                <RatingStars value={value} size={16} />
                <span>{countEl}</span>
              </span>
            </div>
            <div className="dm-dist">
              {split.map((c, i) => (
                <span key={i}>
                  <b>{5 - i}</b>
                  <span className="dm-dist-bar">
                    <i style={{ width: `${((c / total) * 100).toFixed(2)}%` }} />
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="dm-card dm-askc">
            <div className="dm-askc-head">
              <strong>Ask for reviews</strong>
              <Chip tone="live">On</Chip>
            </div>
            <span className="dm-askc-sub">{R.askSub}</span>
            <div className="dm-askc-who">
              <Avatar name={R.ask.name} initials={R.ask.initials} size={30} />
              <span>
                <strong>{R.ask.name}</strong>
                <span>{R.ask.context}</span>
              </span>
            </div>
            <Fold open={ease(prog(t, T.ask, 0.45))}>
              <div className="dm-sms" style={appear(t, T.ask + 0.1, { dy: 6, len: 0.35 })}>
                <span className="dm-sms-who">Text message</span>
                <p>{R.ask.text}</p>
              </div>
            </Fold>
            <div className="dm-askc-steps">
              <Step t={t} at={T.sent}>
                Text sent · 9:52 AM
              </Step>
              <Step t={t} at={T.land + 0.1}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Left a review <Stars n={5} size={11} />
                </span>
              </Step>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ── Phone: the rating on top, the reviews under it, one at a time ─────── */

function Phone({ ind, t }: { ind: DemoIndustry; t: number }) {
  const { R, countEl, ratingEl, value, glow } = numbers(ind, t);
  const needs = needsReply(t);
  const ws = WORKSPACE[ind];
  // Each review folds to its first line once it's been answered, so the next comes up into view.
  const freshBody = 1 - ease(prog(t, T.low - 0.05, 0.45));
  const lowBody = 1 - ease(prog(t, T.ask - 0.3, 0.45));
  const askOpen = ease(prog(t, T.ask - 0.15, 0.45)) * (1 - ease(prog(t, T.land - 0.4, 0.4)));
  return (
    <Shell phone ind={ind} nav={NAV(needs, NOUN[ind])} tabs={TABS} active={0} title="Reviews" sub={`${ws.name} · Google`}>
      <div className="dm-rvp">
        <div className="dm-card dm-psum">
          <span className="dm-score-num dm-score-num--phone">
            <span className="dm-score-glow" style={{ opacity: glow }} />
            {ratingEl}
          </span>
          <span className="dm-score-sub">
            <RatingStars value={value} size={15} />
            <span>{countEl}</span>
          </span>
          <span className="dm-psum-need">
            Needs reply
            <em>{needs}</em>
          </span>
        </div>
        <Fold open={askOpen}>
          <div className="dm-card dm-pask">
            <div className="dm-askc-who">
              <Avatar name={R.ask.name} initials={R.ask.initials} size={28} />
              <span>
                <strong>Review request</strong>
                <span>
                  To {R.ask.name} · {R.ask.context}
                </span>
              </span>
            </div>
            <div className="dm-sms">
              <p>{R.ask.text}</p>
            </div>
            <Step t={t} at={T.sent}>
              Text sent · 9:52 AM
            </Step>
          </div>
        </Fold>
        <div className="dm-plist-view">
          <div className="dm-plist" style={scrolled(t, PHONE_SCROLL)}>
            <Fold open={ease(prog(t, T.land, 0.5))}>
              <div style={appear(t, T.land + 0.1, { dy: -6, len: 0.4 })}>
                <ReviewCard phone r={R.landed} note="After your review request" status={<Chip tone="new">New</Chip>} />
              </div>
            </Fold>
            <Fold open={ease(prog(t, T.arrive, 0.5))}>
              <div style={appear(t, T.arrive + 0.1, { dy: -6, len: 0.4 })}>
                <ReviewCard phone r={R.fresh} body={freshBody} status={<ChipSwap a={["new", "New"]} b={["done", "Replied"]} t={t} at={T.posted} />}>
                  <Reply phone text={R.fresh.reply} t={t} open={T.draft} type={T.type} post={T.post} posted={T.posted} />
                </ReviewCard>
              </div>
            </Fold>
            <ReviewCard phone r={R.low} body={lowBody} status={<ChipSwap a={["pending", "Needs reply"]} b={["done", "Replied"]} t={t} at={T.lowPosted} />}>
              <Reply phone text={R.low.reply} t={t} open={T.low} type={T.lowType} post={T.lowPost} posted={T.lowPosted} />
            </ReviewCard>
            <ReviewCard phone r={R.older} body={0} status={<Chip tone="done">Replied</Chip>} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

/** For checks: the rating and count shown before, after the first review, and at the end. */
export const reviewNumbers = (ind: DemoIndustry) => [0, 1, 2].map((k) => ({ count: REVIEWS[ind].count + k, rating: ratingAfter(ind, k).toFixed(1) }));
