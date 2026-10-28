"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/motion";

/**
 * The four capability previews.
 *
 * Each one is a schematic of how that service actually behaves — a call being
 * answered, a page assembling, slots filling, leads sorting — rather than
 * decoration. They obey the palette rule: violet is structure (the built
 * thing), blue is only ever the live part (activity, the thing that moves).
 *
 * These render on the cream surface, so they use the ink-weight variants
 * (blue-ink / violet-ink) — the dark-theme blues vanish on light.
 *
 * Props:
 *   active  – the card is on screen; build-in animations run
 *   hot     – the card is hovered or keyboard-focused; motion intensifies
 *
 * Under prefers-reduced-motion every preview renders its *finished* state, so
 * the card still communicates the same idea with nothing moving.
 */
type PreviewProps = { active: boolean; hot: boolean };

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── 1. AI receptionist ───────────────────────────────────────────────── */

// Fixed bar heights so the server and client render identically.
const BARS = [
  0.32, 0.58, 0.9, 0.46, 0.72, 1, 0.54, 0.36, 0.66, 0.94, 0.42, 0.78, 0.5, 0.86,
  0.3, 0.62, 0.98, 0.44, 0.7, 0.34, 0.56, 0.88, 0.4, 0.68,
];

export function ReceptionistPreview({ active, hot }: PreviewProps) {
  const reduced = useReducedMotion();
  const live = active && !reduced;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          {live && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-ink opacity-70 animate-pulse-ring" />
          )}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-ink" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-ink">
          On call
        </span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-cream-muted">
          00:12
        </span>
      </div>

      {/* Waveform — the one genuinely continuous animation on the page. */}
      <div className="flex h-14 items-center justify-between gap-[3px]" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-full rounded-full bg-blue-ink",
              live && "origin-center"
            )}
            style={{
              height: `${Math.round(h * 100)}%`,
              transform: live ? undefined : `scaleY(${0.35 + h * 0.4})`,
              animation: live
                ? `wave ${hot ? 620 : 900}ms ${EASE} ${i * 45}ms infinite alternate`
                : undefined,
              opacity: 0.55 + h * 0.45,
            }}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-2 rounded-md border border-blue-ink/25 bg-blue-soft px-2.5 py-1.5 transition-all duration-500"
        style={{
          transitionDelay: active ? "700ms" : "0ms",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(6px)",
        }}
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-blue-ink" fill="none">
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="truncate font-mono text-[10px] text-blue-ink">
          Booked — Tue 9:40am
        </span>
      </div>
    </div>
  );
}

/* ── 2. Website ───────────────────────────────────────────────────────── */

export function WebsitePreview({ active, hot }: PreviewProps) {
  // Blocks assemble in reading order, the way a page is actually composed.
  const block = (i: number) => ({
    transitionDelay: active ? `${120 + i * 110}ms` : "0ms",
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0) scaleY(1)" : "translateY(8px) scaleY(0.6)",
  });

  return (
    <div className="flex w-full items-center">
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border border-cream-line bg-cream-raised transition-transform duration-500",
          hot && "scale-[1.02]"
        )}
      >
        {/* browser chrome */}
        <div className="flex items-center gap-1 border-b border-cream-line px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cream-line" />
          <span className="h-1.5 w-1.5 rounded-full bg-cream-line" />
          <span className="ml-1.5 h-2 w-16 rounded-sm bg-cream-line" />
        </div>

        <div className="space-y-2 p-3">
          <div
            className="h-2.5 w-3/4 origin-top rounded-sm bg-violet-line transition-all duration-500 ease-out"
            style={block(0)}
          />
          <div
            className="h-1.5 w-full origin-top rounded-sm bg-cream-line transition-all duration-500 ease-out"
            style={block(1)}
          />
          <div
            className="h-1.5 w-5/6 origin-top rounded-sm bg-cream-line transition-all duration-500 ease-out"
            style={block(2)}
          />
          <div className="flex gap-2 pt-1">
            <div
              className="h-10 flex-1 origin-top rounded-md border border-cream-line bg-cream transition-all duration-500 ease-out"
              style={block(3)}
            />
            <div
              className="h-10 flex-1 origin-top rounded-md border border-cream-line bg-cream transition-all duration-500 ease-out"
              style={block(4)}
            />
          </div>
          {/* The CTA is the live element, so it's the only blue in the frame. */}
          <div
            className="mt-1 h-5 w-24 origin-top rounded-md bg-blue-soft transition-all duration-500 ease-out"
            style={block(5)}
          />
        </div>
      </div>
    </div>
  );
}

/* ── 3. Booking ───────────────────────────────────────────────────────── */

// index → state. 2 = already taken, 1 = fills during the animation, 0 = free.
const SLOTS = [1, 2, 0, 1, 0, 1, 2, 1, 1, 0, 1, 2, 0, 1, 1, 0];
const TIMES = ["9:00", "9:40", "10:20", "11:00"];

export function BookingPreview({ active, hot }: PreviewProps) {
  let fillOrder = 0;
  // Derived from the grid itself so the label can't drift out of sync with it.
  const open = SLOTS.filter((s) => s === 0).length;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-ink">
          This week
        </span>
        <span className="font-mono text-[10px] text-cream-muted">{open} open</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {SLOTS.map((state, i) => {
          const isFilling = state === 1;
          const delay = isFilling ? 150 + fillOrder++ * 130 : 0;

          return (
            <span
              key={i}
              className={cn(
                "flex h-6 items-center justify-center rounded font-mono text-[9px] transition-all duration-500 ease-out",
                state === 2 && "border border-cream-line bg-transparent text-cream-muted",
                state === 0 && "border border-dashed border-cream-line text-cream-muted"
              )}
              style={
                isFilling
                  ? {
                      // Available → booked: blue-soft fill, blue-ink text.
                      transitionDelay: active ? `${delay}ms` : "0ms",
                      background: active ? "#C9D8E6" : "transparent",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: active ? "#35597E" : "#DED4C3",
                      color: active ? "#35597E" : "#6E6355",
                      transform: active ? "scale(1)" : "scale(0.9)",
                      // A ring reads on cream where a glow does not.
                      boxShadow:
                        active && hot ? "0 0 0 3px rgba(53,89,126,0.15)" : "none",
                    }
                  : undefined
              }
            >
              {state === 2 ? "—" : TIMES[i % 4]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── 4. Sales intelligence ────────────────────────────────────────────── */

const LEADS = [
  { label: "Ridgeline Auto", score: 94 },
  { label: "Cortez & Sons", score: 71 },
  { label: "Bayview Dental", score: 52 },
  { label: "Third St. Salon", score: 28 },
];

export function IntelPreview({ active, hot }: PreviewProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {LEADS.map((lead, i) => {
        const top = i === 0;
        return (
          <div key={lead.label} className="flex items-center gap-2">
            <span
              className={cn(
                "w-[4.5rem] shrink-0 truncate font-mono text-[10px] transition-colors duration-500 sm:w-24",
                top && active ? "text-cream-ink" : "text-cream-muted"
              )}
            >
              {lead.label}
            </span>

            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-cream-line">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-[width] ease-out [transition-duration:900ms]",
                  // All score bars sit in the blue family (they are live data);
                  // the top-ranked one brightens to full blue.
                  top ? "bg-blue-ink" : "bg-blue-ink/65"
                )}
                style={{
                  width: active ? `${lead.score}%` : "0%",
                  transitionDelay: active ? `${i * 120}ms` : "0ms",
                  boxShadow:
                    top && active && hot ? "0 0 10px 0 rgba(127,160,196,0.55)" : "none",
                }}
              />
            </span>

            <span
              className={cn(
                "w-6 shrink-0 text-right font-mono text-[10px] tabular-nums transition-colors duration-500",
                top && active ? "text-cream-ink" : "text-cream-muted"
              )}
            >
              {lead.score}
            </span>
          </div>
        );
      })}

      <div
        className="mt-0.5 flex items-center gap-1.5 transition-all duration-500"
        style={{
          transitionDelay: active ? "900ms" : "0ms",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(4px)",
        }}
      >
        <span className="h-px flex-1 bg-cream-line" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-ink">
          Call Ridgeline first
        </span>
      </div>
    </div>
  );
}

/* ── Fallback ─────────────────────────────────────────────────────────── */

/**
 * Drawn for a service that has no bespoke preview yet.
 *
 * Every animated preview above is hand-built for one specific service, so a new
 * service will not have one on day one. This keeps that card looking deliberate
 * — a quiet spec plate in the same palette and at the same height — instead of
 * blowing up on an undefined component or leaving a hole in the row.
 *
 * It takes the same props as the others and ignores them: there is nothing to
 * animate, which also means nothing to gate on reduced motion.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- takes the shared props, uses none
export function StaticPreview(_: PreviewProps) {
  return (
    <div className="flex w-full items-center" aria-hidden="true">
      <div className="w-full rounded-lg border border-cream-line bg-cream p-4">
        <div className="h-2 w-1/3 rounded-sm bg-violet-line" />
        <div className="mt-2.5 h-1.5 w-full rounded-sm bg-cream-line" />
        <div className="mt-2 h-1.5 w-4/5 rounded-sm bg-cream-line" />
        <div className="mt-4 flex items-center gap-2">
          <span className="h-5 w-14 rounded bg-blue-soft" />
          <span className="h-5 flex-1 rounded border border-dashed border-cream-line" />
        </div>
      </div>
    </div>
  );
}

export const PREVIEWS = {
  receptionist: ReceptionistPreview,
  website: WebsitePreview,
  booking: BookingPreview,
  intel: IntelPreview,
} as const;

/** Valid keys of PREVIEWS — what `previewId` on a service must be. */
export type PreviewId = keyof typeof PREVIEWS;

/**
 * Resolve a service's preview. Unknown or missing id → the static plate.
 *
 * Typed as a lookup rather than indexing PREVIEWS directly at the call site so
 * that bad data (a typo, a CMS value, a service added before its animation is
 * written) degrades instead of throwing.
 */
export function previewFor(id?: string): React.ComponentType<PreviewProps> {
  if (id && id in PREVIEWS) return PREVIEWS[id as PreviewId];
  return StaticPreview;
}
