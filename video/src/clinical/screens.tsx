import React, { useContext, type ReactNode } from "react";
import { DENTIST_LETTER, DRAFT, FAMILY_LETTER, FOLLOW_UPS, LETTER_UI, PATIENT, RECOMMENDATION, RECORD, SUMMARY, SUMMARY_PAGE } from "./data";
import { B } from "./tw";
import { Button, Card, CardTitle, Category, Chip, Clock, easeInOut, INPUT, Muted, Page, PageHeader, pulse, Spinner, useSnap } from "./ui";

/**
 * The four screens of the loop, each a mirror of the app's component for
 * that step, drawn from explicit state so a frame is a pure function of
 * where the loop is:
 *
 * - RecordScreen: app/record/[consultId]/record-client.tsx
 * - SummaryScreen (summary, both letters): app/consult/[id]/summary/summary-client.tsx
 * - RecommendationCard: app/_components/recommendation.tsx
 * - FollowUpsScreen, DraftDialog: app/follow-ups/follow-ups-client.tsx, ui.tsx Dialog
 *
 * The blocks the camera frames carry a `cam` name (data-cam): "rec",
 * "sum-head", "sum-card", "letter-dentist", "letter-family", "fu-head" and
 * "row-<key>". ClinicalLoop.tsx's CAMERA aims at them by those names.
 */

/** "MM:SS", as record-client.tsx's clock(). */
export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Fades and lifts a block in as `k` goes 0 → 1, on whole frame pixels. */
function useReveal(k: number, lift = 6) {
  const snap = useSnap();
  const e = easeInOut(Math.max(0, Math.min(1, k)));
  return { opacity: e, transform: `translateY(${snap((1 - e) * lift)}px)` };
}

const Reveal: React.FC<{ k: number; children: ReactNode; spaceAfter?: number }> = ({ k, children, spaceAfter }) => (
  <div style={{ ...useReveal(k), marginBottom: spaceAfter }}>{children}</div>
);

/* -------------------------------------------------------------------------
 * Step 1: recording
 * ---------------------------------------------------------------------- */

/** Sixteen bars, as record-client.tsx's LevelMeter, driven by the clock. */
const LevelMeter: React.FC = () => {
  const t = useContext(Clock);
  return (
    <B c="flex h-12 items-end gap-1">
      {Array.from({ length: 16 }, (_, i) => {
        const duration = 0.6 + (i % 4) * 0.15;
        const delay = i * 0.07;
        const phase = (t - delay) / duration;
        const cycle = Math.floor(phase);
        let x = phase - cycle;
        if (((cycle % 2) + 2) % 2 === 1) x = 1 - x; // alternate
        const scale = 0.25 + 0.75 * easeInOut(x);
        return (
          <B
            key={i}
            as="span"
            c="w-2 rounded-sm bg-zinc-900"
            s={{ height: `${35 + ((i * 37) % 65)}%`, transformOrigin: "bottom", transform: `scaleY(${scale})` }}
          />
        );
      })}
    </B>
  );
};

/** A photographed paper exam sheet, as a thumbnail: shapes only, no writing. */
const SheetThumb: React.FC = () => (
  <B c="h-24 w-20 rounded-md ring-1 ring-zinc-200 overflow-hidden relative" s={{ background: "#d9d6cf" }}>
    <div
      style={{
        position: "absolute",
        left: 7,
        top: 6,
        width: 68,
        height: 88,
        background: "#fbfaf6",
        transform: "rotate(-2deg)",
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.18)",
        padding: "7px 6px",
      }}
    >
      <div style={{ height: 4, width: 34, background: "#3f3f46", opacity: 0.55, borderRadius: 1 }} />
      {[46, 52, 38, 50].map((w, i) => (
        <div key={i} style={{ height: 2, width: w, background: "#71717a", opacity: 0.45, marginTop: 5, borderRadius: 1 }} />
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 1.5, marginTop: 7 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{ height: 5, border: "0.75px solid rgb(113 113 122 / 0.6)", borderRadius: 1, background: i === 4 || i === 11 ? "rgb(37 99 235 / 0.35)" : "transparent" }} />
        ))}
      </div>
      {[40, 30].map((w, i) => (
        <div key={i} style={{ height: 2, width: w, background: "#2563eb", opacity: 0.45, marginTop: 5, borderRadius: 1 }} />
      ))}
    </div>
  </B>
);

export const RecordScreen: React.FC<{ seconds: number; stopPressed?: boolean }> = ({ seconds, stopPressed = false }) => {
  const t = useContext(Clock);
  return (
    <Page>
      <PageHeader
        cam="rec-head"
        title={`${PATIENT.name} · ${PATIENT.age}`}
        subtitle={RECORD.subtitle}
        actions={
          <B as="span" c="inline-flex items-center gap-2 text-xs font-medium text-rose-700">
            <B as="span" c="h-2 w-2 rounded-full bg-rose-600" s={{ opacity: pulse(t) }} />
            {RECORD.recording}
          </B>
        }
      />

      <Card cam="rec">
        <B c="flex flex-wrap items-center justify-between gap-6">
          <B as="p" c="text-5xl font-semibold text-zinc-900 tabular-nums">
            {clock(seconds)}
          </B>
          <LevelMeter />
          <B c="flex items-center gap-2">
            <Button variant="secondary">{RECORD.pause}</Button>
            <Button variant="primary" pressed={stopPressed}>
              {RECORD.stop}
            </Button>
          </B>
        </B>
      </Card>

      <B c="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardTitle>{RECORD.examSheet}</CardTitle>
          <Muted className="mt-0.5">{RECORD.examSheetHint}</Muted>
          <B c="mt-3 flex items-center gap-4">
            <SheetThumb />
            <B as="label" c="cursor-pointer rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-300">
              {RECORD.replacePhoto}
            </B>
          </B>
        </Card>

        <Card>
          <CardTitle right={<Button variant="amber">{RECORD.flag}</Button>}>{RECORD.moments}</CardTitle>
          <Muted className="mt-0.5">{RECORD.momentsHint}</Muted>
          <B as="ul" c="mt-3 space-y-1 text-sm">
            <B as="li" c="flex items-center gap-2">
              <Category>{clock(RECORD.firstMarker)}</Category>
              <B as="span" c="text-zinc-700">
                {`${RECORD.marker} 1`}
              </B>
            </B>
          </B>
        </Card>
      </B>
    </Page>
  );
};

/* -------------------------------------------------------------------------
 * Steps 2–4: summary and letters
 * ---------------------------------------------------------------------- */

export type Tab = "summary" | "family" | "dentist";

/**
 * How far each line of the summary has appeared, 0 → 1, in order: the chief
 * complaint, the five findings one by one, plan, alternatives, fee,
 * objection, outcome, next step, then the recommendation card below.
 */
export type Shown = (line: number) => number;
export const SUMMARY_LINES = 13;

/** Cuts streamed text at a word boundary, the way a draft arrives. */
export function streamed(text: string, chars: number): string {
  if (chars >= text.length) return text;
  if (chars <= 0) return "";
  const cut = text.lastIndexOf(" ", chars);
  const nl = text.lastIndexOf("\n", chars);
  return text.slice(0, Math.max(cut, nl, 0));
}

const SummaryHeader: React.FC<{ spaceAfter?: number }> = ({ spaceAfter }) => (
  <PageHeader
    cam="sum-head"
    spaceAfter={spaceAfter}
    title={
      <>
        {PATIENT.name}
        <B as="span" c="font-normal text-zinc-600">
          {` · ${PATIENT.age}`}
        </B>
      </>
    }
    subtitle={
      <>
        {SUMMARY_PAGE.subtitle[0]}
        <B as="a" c="underline underline-offset-2">
          {SUMMARY_PAGE.subtitle[1]}
        </B>
        {SUMMARY_PAGE.subtitle[2]}
        <B as="a" c="underline underline-offset-2">
          {SUMMARY_PAGE.subtitle[3]}
        </B>
      </>
    }
  />
);

const Tabs: React.FC<{ tab: Tab; spaceAfter?: number }> = ({ tab, spaceAfter }) => (
  <B c="no-print flex gap-1 border-b border-zinc-200" spaceAfter={spaceAfter}>
    {(["summary", "family", "dentist"] as const).map((key) => (
      <B
        key={key}
        as="button"
        c={
          "-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm " +
          (tab === key ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-600")
        }
      >
        {SUMMARY_PAGE.tabs[key]}
      </B>
    ))}
  </B>
);

const Field: React.FC<{ label: string; children: ReactNode; k: number; spaceAfter?: number }> = ({ label, children, k, spaceAfter }) => (
  <Reveal k={k} spaceAfter={spaceAfter}>
    <div>
      <Category>{label}</Category>
      {children}
    </div>
  </Reveal>
);

const Finding: React.FC<{ k: number; children: ReactNode; spaceAfter?: number }> = ({ k, children, spaceAfter }) => (
  <B as="li" spaceAfter={spaceAfter} s={useReveal(k, 4)}>
    {children}
  </B>
);

const SummaryCard: React.FC<{ shown: Shown; spaceAfter?: number }> = ({ shown, spaceAfter }) => (
  <Card cam="sum-card" spaceAfter={spaceAfter}>
    <CardTitle right={<Button variant="secondary">{SUMMARY_PAGE.copy}</Button>}>{SUMMARY.title}</CardTitle>
    <B as="dl" c="mt-3 space-y-3 text-sm">
      <Field label={SUMMARY.chiefComplaint.label} k={shown(0)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.chiefComplaint.value}
        </B>
      </Field>
      <Field label={SUMMARY.findings.label} k={shown(1)}>
        <B as="ul" c="list-disc space-y-0.5 pl-5 text-zinc-800">
          {SUMMARY.findings.value.map((f, i) => (
            <Finding key={f} k={shown(1 + i)}>
              {f}
            </Finding>
          ))}
        </B>
      </Field>
      <Field label={SUMMARY.plan.label} k={shown(6)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.plan.value}
        </B>
      </Field>
      <Field label={SUMMARY.alternatives.label} k={shown(7)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.alternatives.value}
        </B>
      </Field>
      <Field label={SUMMARY.financial.label} k={shown(8)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.financial.value}
        </B>
      </Field>
      <Field label={SUMMARY.objection.label} k={shown(9)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.objection.value}
        </B>
      </Field>
      <Field label={SUMMARY.outcome.label} k={shown(10)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.outcome.value}
        </B>
        <B c="mt-1 flex flex-wrap gap-1.5">
          {SUMMARY.reasons.map((r, i) => (
            <Chip key={r} primary={i === 0}>
              {r}
              {i === 0 && SUMMARY.primary}
            </Chip>
          ))}
        </B>
      </Field>
      <Field label={SUMMARY.nextStep.label} k={shown(11)}>
        <B as="dd" c="text-zinc-800">
          {SUMMARY.nextStep.value}
        </B>
      </Field>
    </B>
  </Card>
);

/** recommendation.tsx's card, as the summary tab shows it under the summary. */
const RecommendationCard: React.FC<{ spaceAfter?: number }> = ({ spaceAfter }) => (
  <Card spaceAfter={spaceAfter}>
    <CardTitle
      right={
        <B as="span" c="rounded-full px-2 py-0.5 text-[0.6875rem] font-medium bg-emerald-100 text-emerald-900">
          {RECOMMENDATION.confidence}
        </B>
      }
    >
      {RECOMMENDATION.title}
    </CardTitle>
    <B as="p" c="mt-2 text-sm font-medium text-zinc-900">
      {RECOMMENDATION.headline}
    </B>
    <B as="ol" c="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-800">
      {RECOMMENDATION.steps.map((step) => (
        <B key={step} as="li">
          {step}
        </B>
      ))}
    </B>
    <B c="mt-3">
      <Category>{RECOMMENDATION.whyLabel}</Category>
      <B as="p" c="text-sm text-zinc-700">
        {RECOMMENDATION.why}
      </B>
    </B>
    <B c="mt-3">
      <Category>{RECOMMENDATION.evidenceLabel}</Category>
      <B as="ul" c="mt-1 space-y-1">
        {RECOMMENDATION.evidence.map((moment) => (
          <B key={moment.t} as="li" c="text-sm">
            <B as="button" c="text-left text-zinc-700">
              <B as="span" c="mr-2 font-mono text-[0.6875rem] text-amber-700">
                {moment.t}
              </B>
              <B as="span" c="italic">{`“${moment.quote}”`}</B>
            </B>
          </B>
        ))}
      </B>
    </B>
    <B c="mt-3">
      <Button variant="amber">{RECOMMENDATION.draftButton}</Button>
    </B>
  </Card>
);

/**
 * The letter tab: LetterEditor, with its text arriving as it is drafted.
 * The text still to come is laid out but invisible, so the box is its
 * finished size from the start and the camera can follow the draft down it.
 */
const LetterEditor: React.FC<{ kind: "family" | "dentist"; chars: number; drafting: boolean }> = ({ kind, chars, drafting }) => {
  const letter = kind === "family" ? FAMILY_LETTER : DENTIST_LETTER;
  const lineHeight = 14 * 1.625;
  const typed = streamed(letter.body, chars);
  return (
    <Card cam={`letter-${kind}`}>
      <CardTitle
        right={
          <B as="span" c="text-xs text-zinc-600">
            {drafting ? (
              <>
                <Spinner />
                {LETTER_UI.drafting}
              </>
            ) : (
              LETTER_UI.draft
            )}
          </B>
        }
      >
        {SUMMARY_PAGE.tabs[kind]}
      </CardTitle>
      <Muted className="mt-0.5">{`${LETTER_UI.to} ${letter.to}. ${LETTER_UI.editHint}`}</Muted>
      {/* AutoTextarea: grows to its text, eight rows at the least. */}
      <B
        c={`${INPUT} mt-3 font-serif text-sm leading-relaxed`}
        s={{ whiteSpace: "pre-wrap", overflowWrap: "break-word", minHeight: 8 * lineHeight + 12 + 2 }}
      >
        {typed}
        <span style={{ color: "transparent" }}>{letter.body.slice(typed.length)}</span>
      </B>
      <B c="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary">{LETTER_UI.copy}</Button>
        <Button variant="secondary">{LETTER_UI.print}</Button>
        <Button variant="primary">{LETTER_UI.markSent}</Button>
        <Muted>{LETTER_UI.sendingHint}</Muted>
      </B>
    </Card>
  );
};

export const SummaryScreen: React.FC<{
  tab: Tab;
  shown: Shown;
  letterChars: number;
  drafting: boolean;
  /** The card's opacity, below 1 while a tab switch brings it in. */
  opacity?: number;
  /** The tab being left during a switch, complete, fading out over the new one. */
  from?: { tab: Tab; opacity: number };
}> = ({ tab, shown, letterChars, drafting, opacity = 1, from }) => {
  const card = (key: Tab, complete: boolean) =>
    key === "summary" ? (
      <B c="space-y-6">
        <SummaryCard shown={complete ? () => 1 : shown} />
        <Reveal k={complete ? 1 : shown(12)}>
          <RecommendationCard />
        </Reveal>
      </B>
    ) : (
      <LetterEditor kind={key} chars={complete ? Infinity : letterChars} drafting={!complete && drafting} />
    );
  return (
    <Page>
      <SummaryHeader />
      <Tabs tab={tab} />
      <div style={{ position: "relative" }}>
        <div style={{ opacity }}>{card(tab, false)}</div>
        {from && from.opacity > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: from.opacity }}>{card(from.tab, true)}</div>
        )}
      </div>
    </Page>
  );
};

/* -------------------------------------------------------------------------
 * Step 5: follow-ups
 * ---------------------------------------------------------------------- */

type Row = (typeof FOLLOW_UPS.rows)[number];

const GROUP_TONE = { overdue: "text-rose-700", today: "text-amber-700", upcoming: "text-zinc-600" };

const DueDate: React.FC<{ row: Row }> = ({ row }) => (
  <B as="span" c={`font-medium ${row.group === "overdue" ? "text-rose-700" : row.group === "today" ? "text-amber-700" : "text-zinc-700"}`}>
    {row.due}
    {row.group === "overdue" && FOLLOW_UPS.overdue}
    {row.group === "today" && FOLLOW_UPS.dueToday}
  </B>
);

const Chevron: React.FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden style={{ width: 16, height: 16, color: "oklch(44.2% 0.017 285.786)" }}>
    <path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** One case. `pointed` is the hover:bg-zinc-50 the pointer gives it just before it's picked. */
const FollowUpRow: React.FC<{ row: Row; selected: boolean; pointed: boolean; spaceAfter?: number }> = ({ row, selected, pointed, spaceAfter }) => (
  <B
    c={
      "cursor-pointer rounded-lg p-4 ring-1 transition-colors " +
      (pointed ? "bg-zinc-50 " : "bg-white ") +
      (selected ? "ring-2 ring-zinc-900" : "ring-zinc-200")
    }
    spaceAfter={spaceAfter}
    p={{ "data-cam": `row-${row.key}` }}
  >
    <B c="flex items-start gap-4">
      <B c="min-w-0 flex-1">
        <B c="flex flex-wrap items-center gap-x-3 gap-y-1">
          <B as="p" c="text-sm font-medium text-zinc-900">
            {row.name}
            <B as="span" c="font-normal text-zinc-600">
              {` · ${row.age}`}
            </B>
          </B>
          <Chip>{row.status}</Chip>
          <B as="span" c="text-xs text-zinc-600">
            {row.since}
          </B>
        </B>
        <B c="mt-1.5 flex flex-wrap gap-1.5">
          {row.reasons.map((r, i) => (
            <Chip key={r} primary={i === 0}>
              {r}
              {i === 0 && SUMMARY.primary}
            </Chip>
          ))}
        </B>
        <B as="dl" c="mt-2 grid gap-x-8 gap-y-1 text-xs sm:grid-cols-3">
          <div>
            <Category>{FOLLOW_UPS.followUp}</Category>
            <B as="dd" c="text-sm">
              <DueDate row={row} />
            </B>
          </div>
          <div>
            <Category>{FOLLOW_UPS.fee}</Category>
            <B as="dd" c="text-sm text-zinc-800">
              {row.fee}
            </B>
          </div>
          <B c="sm:col-span-3">
            <Category>{FOLLOW_UPS.nextStep}</Category>
            <B as="dd" c="text-sm text-zinc-800">
              {row.nextStep}
            </B>
          </B>
        </B>
      </B>
      <B c="flex shrink-0 items-center gap-2">
        <Button variant="secondary">{FOLLOW_UPS.logCall}</Button>
        <B as="button" c="rounded-md px-2 py-1 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-300">
          {FOLLOW_UPS.more}
        </B>
        <B as="span" c="pl-1">
          <Chevron />
        </B>
      </B>
    </B>
  </B>
);

const Filters: React.FC<{ spaceAfter?: number }> = ({ spaceAfter }) => {
  const f = FOLLOW_UPS.filters;
  const select = (label: string, options: readonly string[]) => (
    <B as="label" c="flex flex-col gap-1">
      <B as="span" c="text-zinc-600">
        {label}
      </B>
      <B as="select" c={INPUT} p={{ defaultValue: "" }}>
        <option value="">{f.any}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </B>
    </B>
  );
  const date = (label: string) => (
    <B as="label" c="flex flex-col gap-1">
      <B as="span" c="text-zinc-600">
        {label}
      </B>
      <B as="input" c={INPUT} p={{ type: "date", defaultValue: "", readOnly: true }} />
    </B>
  );
  return (
    <Card className="!py-3" spaceAfter={spaceAfter}>
      <B c="flex flex-wrap items-end gap-3 text-xs">
        {select(f.reason, f.reasons)}
        {select(f.owner, f.owners)}
        {select(f.status, f.statuses)}
        {date(f.from)}
        {date(f.to)}
      </B>
    </Card>
  );
};

/**
 * The follow-up list, with Zz-Maya's case being picked. In the app, picking
 * a case opens a 26rem panel beside the list, which at this window width
 * would leave the list a sliver; here the case's drafted message opens over
 * the list instead (DraftDialog), as the app's own Dialog does.
 */
export const FollowUpsScreen: React.FC<{ pointed: boolean; picked: boolean }> = ({ pointed, picked }) => {
  const groups = (["overdue", "today", "upcoming"] as const)
    .map((g) => ({ g, members: FOLLOW_UPS.rows.filter((r) => r.group === g) }))
    .filter((x) => x.members.length > 0);
  return (
    <Page wide>
      <PageHeader cam="fu-head" title={FOLLOW_UPS.title} subtitle={FOLLOW_UPS.subtitle} />
      <Filters />
      <B c="min-w-0 space-y-6">
        {groups.map(({ g, members }) => (
          <B key={g} as="section" c="space-y-2">
            <B as="h2" c={`text-[0.6875rem] font-medium tracking-wide uppercase ${GROUP_TONE[g]}`}>
              {`${FOLLOW_UPS.groups[g]} · ${members.length}`}
            </B>
            {members.map((row) => (
              <FollowUpRow key={row.key} row={row} selected={picked && row.key === "maya"} pointed={pointed && row.key === "maya"} />
            ))}
          </B>
        ))}
      </B>
    </Page>
  );
};

/**
 * ui.tsx's Dialog with recommendation.tsx's draft in it, over the camera's
 * view. `visible` fades the scrim's tint and blur and the card together; an
 * opacity on a parent would stop the blur reaching the page behind. `zoom`
 * and `width` size the card as the page under it is seen.
 */
export const DraftDialog: React.FC<{ chars: number; visible: number; zoom: number; width: number }> = ({ chars, visible, zoom, width }) => (
  <B
    c="fixed inset-0 z-30 flex items-center justify-center bg-zinc-900/30 p-4 backdrop-blur-[2px] font-sans"
    s={{
      backgroundColor: `color-mix(in oklab, oklch(21% 0.006 285.885) ${30 * visible}%, transparent)`,
      backdropFilter: `blur(${2 * visible}px)`,
    }}
  >
    <B c="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl ring-1 ring-zinc-200" s={{ opacity: visible, zoom, width }}>
      <B c="flex items-baseline justify-between gap-4">
        <B as="h2" c="text-sm font-semibold text-zinc-900">
          {DRAFT.title}
        </B>
        <Button variant="link">{DRAFT.close}</Button>
      </B>
      <B c="mt-3">
        <B c={`${INPUT} font-mono text-xs`} s={{ whiteSpace: "pre-wrap", overflowWrap: "break-word", minHeight: 6 * 16 + 12 + 2 }}>
          {streamed(DRAFT.body, chars)}
        </B>
        <B c="mt-3 flex items-center gap-2">
          <Button variant="primary">{DRAFT.copy}</Button>
          <Button variant="secondary">{DRAFT.closeButton}</Button>
          <Muted>{DRAFT.hint}</Muted>
        </B>
      </B>
    </B>
  </B>
);
