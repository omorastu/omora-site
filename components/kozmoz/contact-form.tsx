"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { brand, contact, people } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * The home page form, in the new design, on the V3 submission logic.
 *
 * It posts to the same /api/lead backend as V3's home form, so it gets the
 * same honeypot, submit-timing check, rate limit and never-silently-drop
 * guarantee, and reports the same analytics event. The second field goes as
 * `contact`; the API decides whether it's an email or a phone number. "Who
 * should get back to you?" goes as `who` and is filed with the lead.
 *
 * Browser validation runs first (the fields the API requires are marked
 * required); anything the API still rejects comes back per field, prints
 * under that field, and takes focus. Without JavaScript the form falls back
 * to the preview's mailto, so a visitor's details never end up in a URL.
 */

type Status = "idle" | "sending" | "done" | "error";

export function ContactForm({
  source = "omora.studio/home",
}: {
  /** Filed with the lead as where it came from. */
  source?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // aria-disabled rather than disabled while sending: disabling the focused
    // button would drop keyboard focus to <body>.
    if (status === "sending") return;
    const form = e.currentTarget;
    setStatus("sending");
    setMessage("");
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errors: Record<string, string> = payload.fieldErrors ?? {};
        setFieldErrors(errors);
        const first = Object.keys(errors)[0];
        if (first) form.querySelector<HTMLElement>(`#kz-${first}`)?.focus();
        throw new Error(payload.error || "That didn’t send. Try again in a moment.");
      }

      form.reset();
      setStatus("done");
      setMessage(contact.sent);
      track("lead_submitted", { form: "home" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "That didn’t send.");
    }
  }

  const busy = status === "sending";

  return (
    <form
      className="form"
      action={`mailto:${brand.email}`}
      method="post"
      encType="text/plain"
      onSubmit={onSubmit}
    >
      <div className="fields">
        <Field
          name="name"
          label={contact.fields.name}
          autoComplete="name"
          required
          error={fieldErrors.name}
        />
        <Field name="business" label={contact.fields.business} autoComplete="organization" />
        <Field
          name="contact"
          label={contact.fields.contact}
          autoComplete="email"
          required
          error={fieldErrors.contact}
        />
        <Field
          name="message"
          label={contact.fields.message}
          multiline
          required
          error={fieldErrors.message}
        />
      </div>

      <fieldset className="whom">
        <legend className="label">
          <span>{contact.whom}</span>
        </legend>
        <div className="whom-row">
          <input className="sr-only" type="radio" name="who" id="who-a" value={people.a.name} />
          <label className="whom-opt whom-a rule-a" htmlFor="who-a">
            {people.a.name}
          </label>
          <input
            className="sr-only"
            type="radio"
            name="who"
            id="who-e"
            value={contact.either}
            defaultChecked
          />
          <label className="whom-opt whom-e rule-both" htmlFor="who-e">
            <span className="whom-amp" aria-hidden="true">
              &amp;
            </span>
            <span className="label">{contact.either}</span>
          </label>
          <input className="sr-only" type="radio" name="who" id="who-j" value={people.j.name} />
          <label className="whom-opt whom-j rule-j" htmlFor="who-j">
            {people.j.name}
          </label>
        </div>
      </fieldset>

      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="source" value={source} />

      <div className="send-row">
        <button className="act" type="submit" aria-disabled={busy || undefined}>
          {busy ? contact.sending : contact.submit}
        </button>
        <p
          className="form-status"
          aria-live="polite"
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
        <p className="or">
          {contact.or} <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  multiline,
  ...control
}: {
  name: string;
  label: string;
  error?: string;
  multiline?: boolean;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = `kz-${name}`;
  const a11y = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    ...control,
  };

  return (
    <div className={cn("field", multiline && "field--msg")}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {multiline ? <textarea rows={3} {...a11y} /> : <input type="text" {...a11y} />}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
