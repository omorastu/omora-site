"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { cn } from "@/lib/utils";

/**
 * The home page's three-field form: name, email or phone, the problem.
 *
 * Same /api/lead backend as the longer form on the inner pages, so it gets
 * the same spam handling and the same never-silently-drop guarantee. It sends
 * the second field as `contact`; the API decides whether it's an email or a
 * phone number.
 */

type Status = "idle" | "sending" | "done" | "error";

const fieldBase =
  "w-full rounded-[3px] border border-line bg-bg px-3.5 py-3.5 text-[15px] text-ink outline-none transition-colors duration-300 focus:border-violet-deep";

export function ContactForm({
  submitLabel,
  source = "omora.studio/home",
}: {
  submitLabel: string;
  /** Filed with the lead as where it came from. */
  source?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

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
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        throw new Error(payload.error || "That didn't send. Try again in a moment.");
      }

      setStatus("done");
      track("lead_submitted", { form: "home" });
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "That didn't send.");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[5px] border border-violet-deep bg-raised p-9 text-center"
      >
        <p className="plate">Got it</p>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">We&rsquo;ve got it.</h3>
        <p className="mx-auto mt-3 max-w-[40ch] text-pretty leading-relaxed text-muted">
          One of us reads every message that comes in — usually same day, always within one
          business day.
        </p>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-[5px] border border-line bg-raised p-7 sm:p-9"
    >
      <Field label="Name" id="name" error={fieldErrors.name}>
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

      {/* id, not name, is "contact-method": the section this form sits in is
          #contact, the anchor every "Start a project" lands on. The field
          name stays `contact`, which is what /api/lead reads. */}
      <Field label="Email or phone" id="contact-method" error={fieldErrors.contact}>
        <input
          id="contact-method"
          name="contact"
          type="text"
          autoComplete="email"
          className={fieldBase}
          aria-invalid={!!fieldErrors.contact}
          aria-describedby={fieldErrors.contact ? "contact-method-error" : undefined}
        />
      </Field>

      <Field label="What's the problem" id="message" error={fieldErrors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={cn(fieldBase, "resize-y")}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
        />
      </Field>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="source" value={source} />

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-[3px] bg-violet-strong px-4 py-[17px] font-display text-[15px] font-semibold text-ink transition-colors duration-300 hover:bg-violet-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Sending…" : submitLabel}
      </button>

      <p aria-live="polite" className="sr-only">
        {busy ? "Sending." : ""}
      </p>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-[3px] border border-[#E0663C]/40 bg-[#E0663C]/10 px-4 py-3 text-sm text-[#E0663C]"
        >
          {formError}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  /** The control's id. Labels it, and prefixes the error line's id. */
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-[9px] block font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[#E0663C]">
          {error}
        </p>
      )}
    </div>
  );
}
