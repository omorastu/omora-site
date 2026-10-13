"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

type Status = "idle" | "sending" | "sent" | "error";

const businessTypes = [
  "Restaurant / Food",
  "E-Commerce",
  "Real Estate",
  "Nightlife / Events",
  "Salon / Barber",
  "Gym / Fitness",
  "Agency / Consulting",
  "Service Business",
  "Other",
];

const needOptions = [
  "Website",
  "AI System",
  "App / Dashboard",
  "E-commerce Store",
  "Automation",
  "Something Custom",
];

function pillClass(active: boolean) {
  return `px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
    active
      ? "text-night border-transparent"
      : "border-line text-muted hover:border-teal-dim hover:text-ink"
  }`;
}

const pillActiveStyle = {
  background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
  boxShadow: "0 4px 14px -4px rgba(18,174,219,0.5)",
};

export default function ContactForm() {
  const [mode, setMode] = useState<"mockup" | "quote">("mockup");
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [needs, setNeeds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleNeed(n: string) {
    setNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, mode, businessType, needs }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong sending this.");
      }

      setStatus("sent");
      track("form_completed", { mode });
      form.reset();
      setBusinessType(null);
      setNeeds([]);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong sending this."
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-line rounded-lg p-8 text-center">
        <p className="font-display text-xl text-ink mb-2">Got it.</p>
        <p className="text-muted text-sm">
          We reply to every message within 24 hours — usually faster. Nothing
          else to do on your end right now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("mockup");
            track("funnel_mode_selected", { mode: "mockup" });
          }}
          className={pillClass(mode === "mockup")}
          style={mode === "mockup" ? pillActiveStyle : undefined}
        >
          Free 1-hour mockup
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("quote");
            track("funnel_mode_selected", { mode: "quote" });
          }}
          className={pillClass(mode === "quote")}
          style={mode === "quote" ? pillActiveStyle : undefined}
        >
          Get a project quote
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">Name</span>
          <input
            required
            name="name"
            type="text"
            className="mt-1 w-full bg-transparent border border-line rounded-lg px-3 py-2 text-ink transition-colors duration-300 focus:border-teal outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">Email</span>
          <input
            required
            name="email"
            type="email"
            className="mt-1 w-full bg-transparent border border-line rounded-lg px-3 py-2 text-ink transition-colors duration-300 focus:border-teal outline-none"
          />
        </label>
      </div>

      <div>
        <span className="text-xs text-muted uppercase tracking-wide">
          What kind of business?
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {businessTypes.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBusinessType(b)}
              className={pillClass(businessType === b)}
              style={businessType === b ? pillActiveStyle : undefined}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-muted uppercase tracking-wide">
          What do you need? (pick all that apply)
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {needOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleNeed(n)}
              className={pillClass(needs.includes(n))}
              style={needs.includes(n) ? pillActiveStyle : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {mode === "quote" && (
        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">
            Rough budget
          </span>
          <select
            name="budget"
            className="mt-1 w-full bg-bg border border-line rounded-lg px-3 py-2 text-ink transition-colors duration-300 focus:border-teal outline-none"
          >
            <option value="under-1k">Under $1,000 (landing page)</option>
            <option value="3-5k">$3,000–$5,000 (website)</option>
            <option value="5-15k">$5,000–$15,000 (e-commerce / AI system)</option>
            <option value="15k-plus">$15,000+ (custom platform)</option>
            <option value="not-sure">Not sure yet</option>
          </select>
        </label>
      )}

      <label className="block">
        <span className="text-xs text-muted uppercase tracking-wide">
          Anything else? (optional)
        </span>
        <textarea
          name="message"
          rows={4}
          className="mt-1 w-full bg-transparent border border-line rounded-lg px-3 py-2 text-ink transition-colors duration-300 focus:border-teal outline-none"
          placeholder={
            mode === "mockup"
              ? "Tell us about the business — what you sell, who you sell to, and what your current site is missing."
              : "What are you trying to build, and what's not working about the current setup?"
          }
        />
      </label>

      <input type="hidden" name="page" value="omora.studio" />

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto px-6 py-3 rounded-lg text-night font-medium transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{
          background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
          boxShadow: "0 10px 26px -10px rgba(18,174,219,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {status === "sending"
          ? "Sending…"
          : mode === "mockup"
          ? "Request my free mockup"
          : "Get my quote"}
      </button>

      {status === "error" && (
        <p className="text-sm text-rust">
          {errorMsg} You can also reach us directly at{" "}
          <a href="mailto:studio.omora@gmail.com" className="underline">
            studio.omora@gmail.com
          </a>
          .
        </p>
      )}
    </form>
  );
}
