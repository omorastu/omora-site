"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { cn } from "@/lib/utils";
import { NEED_LABELS, NEED_OPTIONS, PREFILL_EVENT, type PrefillDetail } from "@/lib/prefill";

/**
 * The work order.
 *
 * The page's signature element: the CTA doesn't "get in touch", it opens a job
 * ticket, and on success the server issues a real reference number that's
 * stamped onto the docket. The number comes back from the API — it's the
 * identifier the lead is actually filed under, not a decoration.
 */

const BUDGETS = [
  { value: "not-sure", label: "Not sure yet" },
  { value: "under-2k", label: "Under $2k" },
  { value: "2-5k", label: "$2k – $5k" },
  { value: "5-15k", label: "$5k – $15k" },
  { value: "15k-plus", label: "$15k+" },
];

type Status = "idle" | "sending" | "done" | "error";

const fieldBase =
  "w-full rounded-md border border-line bg-bg/60 px-3 py-2.5 text-ink placeholder:text-muted/45 outline-none transition-colors duration-300 focus:border-blue";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [needs, setNeeds] = useState<string[]>([]);
  const [ticket, setTicket] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // A capability card was clicked — preselect what it maps to.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<PrefillDetail>).detail;
      const label = NEED_LABELS[detail?.need];
      if (label) setNeeds((prev) => (prev.includes(label) ? prev : [...prev, label]));
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  function toggleNeed(n: string) {
    setNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setFormError("");
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, needs, startedAt: startedAt.current }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        throw new Error(payload.error || "That didn't send. Try again in a moment.");
      }

      setTicket(payload.ticket ?? null);
      setStatus("done");
      track("lead_submitted", { needs: needs.join(",") || "unspecified" });
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "That didn't send.");
    }
  }

  /* ── Stamped docket ─────────────────────────────────────────────────── */

  if (status === "done") {
    return (
      <div
        className="relative overflow-hidden rounded-xl border border-violet-deep bg-raised/80 p-8 text-center sm:p-12"
        role="status"
        aria-live="polite"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(193,140,255,0.14),transparent_65%)]"
        />
        <div className="relative">
          <p className="plate">Project started</p>

          <p className="mt-5 inline-block -rotate-2 rounded-lg border-2 border-violet px-6 py-3 font-mono text-2xl tracking-[0.14em] text-violet shadow-[0_0_36px_-10px_rgba(193,140,255,0.65)] sm:text-3xl">
            {ticket ?? "OMR-—"}
          </p>

          <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-ink">
            We&rsquo;ve got it.
          </h3>
          <p className="mx-auto mt-3 max-w-prose text-pretty leading-relaxed text-muted">
            One of us reads every message that comes in — usually same day, always
            within one business day. Quote your number if you need to chase it.
          </p>
        </div>
      </div>
    );
  }

  /* ── The docket ─────────────────────────────────────────────────────── */

  const busy = status === "sending";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="overflow-hidden rounded-xl border border-line bg-raised/70 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center justify-between border-b border-line bg-bg/50 px-5 py-3 sm:px-7">
        <span className="plate">Work order</span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-blue animate-blink" />
          Awaiting details
        </span>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" name="name" error={fieldErrors.name} required>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={fieldBase}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
          </Field>

          <Field label="Email" name="email" error={fieldErrors.email} required>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={fieldBase}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
          </Field>
        </div>

        <Field label="Business" name="business" hint="optional">
          <input
            id="business"
            name="business"
            type="text"
            autoComplete="organization"
            className={fieldBase}
          />
        </Field>

        <fieldset>
          <legend className="plate">What do you need?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {NEED_OPTIONS.map((n) => {
              const on = needs.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNeed(n)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-300",
                    on
                      ? "border-blue bg-blue/15 text-blue"
                      : "border-line text-muted hover:border-violet-deep hover:text-ink"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Rough budget" name="budget" hint="optional">
          <select id="budget" name="budget" className={cn(fieldBase, "bg-bg")} defaultValue="not-sure">
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="What's the problem?"
          name="message"
          error={fieldErrors.message}
          required
        >
          <textarea
            id="message"
            name="message"
            rows={4}
            className={cn(fieldBase, "resize-y")}
            placeholder="Calls going to voicemail, a site nobody books from, a process eating your week — whatever it is."
            aria-invalid={!!fieldErrors.message}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
          />
        </Field>

        {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <input type="hidden" name="source" value="omora.studio/v2" />

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={busy}
            className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-violet-deep px-7 py-3.5 font-medium text-ink shadow-[0_14px_40px_-16px_rgba(139,79,230,0.75)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:hover:translate-y-0"
          >
            {busy ? "Sending…" : "Start the project"}
            {!busy && (
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" aria-hidden="true">
                <path d="M2.5 8h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <p className="font-mono text-[11px] leading-relaxed text-muted/70">
            No newsletter, no drip sequence.
            <br className="hidden sm:block" /> A person reads it and replies.
          </p>
        </div>

        <p aria-live="polite" className="sr-only">
          {busy ? "Sending." : ""}
        </p>

        {status === "error" && (
          <p role="alert" className="rounded-md border border-[#E0663C]/40 bg-[#E0663C]/10 px-4 py-3 text-sm text-[#E0663C]">
            {formError}
          </p>
        )}
      </div>
    </form>
  );
}

/* ── Field wrapper ────────────────────────────────────────────────────── */

function Field({
  label,
  name,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="plate flex items-baseline gap-2">
        {label}
        {required && <span className="text-blue">*</span>}
        {hint && <span className="tracking-normal text-muted/50 normal-case">{hint}</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-[#E0663C]">
          {error}
        </p>
      )}
    </div>
  );
}
