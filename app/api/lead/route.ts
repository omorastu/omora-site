import { NextResponse } from "next/server";
import { newLead, saveLead } from "@/lib/leads";
import { NEED_OPTIONS } from "@/lib/prefill";
import { contact as homeContact, people } from "@/lib/kozmoz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Validation ───────────────────────────────────────────────────────── */

// Same list the form renders, derived from the service data — a service
// renamed in lib/content.ts must not leave the API silently discarding the
// checkbox the visitor actually ticked. (Type-only imports upstream, so this
// pulls in plain data, not client components.)
const NEEDS = NEED_OPTIONS;
const BUDGETS = ["under-2k", "2-5k", "5-15k", "15k-plus", "not-sure"];
// The home page's "Who should get back to you?" — one of the two of us, or
// either. Read from the same data the form renders, for the same reason.
const REPLY_FROM = [people.a.name, people.j.name, homeContact.either];

const LIMITS = { name: 100, email: 200, phone: 40, business: 120, message: 4000 } as const;

function str(v: unknown, max: number) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

// Deliberately permissive: the goal is to catch typos, not to adjudicate the
// RFC. Anything that gets past this is verified by the reply actually arriving.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// A phone number as people type one: digits plus the usual separators, and
// enough digits to be a real number (7 local, up to 15 international).
const PHONE_RE = /^\+?[\d\s().-]+$/;
function looksLikePhone(v: string) {
  const digits = v.replace(/\D/g, "").length;
  return PHONE_RE.test(v) && digits >= 7 && digits <= 15;
}

/* ── Rate limiting ────────────────────────────────────────────────────── */

/**
 * Per-instance sliding window. This is not a distributed limiter — on
 * serverless each instance keeps its own counter, so it throttles a single
 * abusive client without pretending to be airtight. Swap in Upstash/Redis if
 * this ever needs to hold globally.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ── Route ────────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send this as JSON." }, { status: 400 });
  }

  // Honeypot: a real person never fills a field they can't see.
  if (str(body.website, 200)) {
    // Answer as though it worked, so a bot gets no signal to retry differently.
    return NextResponse.json({ ok: true, ticket: "OMR-0000" });
  }

  // Bots submit near-instantly. Unlike the honeypot this is a heuristic, not a
  // certainty — autofill plus a fast typist can trip it — so it returns a
  // recoverable error rather than the silent fake-success above. Answering a
  // real person with a success screen while discarding their message is the one
  // outcome this form must never produce.
  const startedAt = Number(body.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 1500) {
    return NextResponse.json(
      { error: "That came through faster than we can trust. Press the button once more." },
      { status: 400 }
    );
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "That’s a few too many in a row. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const name = str(body.name, LIMITS.name);

  // The home page form sends one "email or phone" field as `contact`; the
  // longer form on the inner pages sends `email`. Errors go back under
  // whichever key the form used, so they land on the right field.
  const usesContact = typeof body.contact === "string";
  const contactKey = usesContact ? "contact" : "email";
  const contact = usesContact ? str(body.contact, LIMITS.email) : "";
  const email = usesContact ? (contact.includes("@") ? contact : "") : str(body.email, LIMITS.email);
  const phone = usesContact && !contact.includes("@") ? contact.slice(0, LIMITS.phone) : "";
  const business = str(body.business, LIMITS.business);
  const message = str(body.message, LIMITS.message);
  const budget = BUDGETS.includes(String(body.budget)) ? String(body.budget) : undefined;
  const replyFrom = REPLY_FROM.includes(String(body.who)) ? String(body.who) : undefined;
  const needs = Array.isArray(body.needs)
    ? body.needs.filter((n): n is string => typeof n === "string" && NEEDS.includes(n))
    : [];

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Tell us your name.";
  if (!email && !phone) {
    fieldErrors[contactKey] = usesContact
      ? "We need an email or a number to reply to."
      : "We need an email to reply to.";
  } else if (email && !EMAIL_RE.test(email)) {
    fieldErrors[contactKey] = "That email doesn’t look right.";
  } else if (phone && !looksLikePhone(phone)) {
    fieldErrors[contactKey] = "That doesn’t look like an email or a phone number.";
  }
  if (!message) fieldErrors.message = "Tell us what’s going wrong — a sentence is plenty.";

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ error: "Some fields need fixing.", fieldErrors }, { status: 400 });
  }

  const lead = newLead({
    name,
    email: email || undefined,
    phone: phone || undefined,
    business: business || undefined,
    needs,
    budget,
    replyFrom,
    message,
    source: str(body.source, 200) || "omora.studio",
    userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? undefined,
  });

  const { stored } = await saveLead(lead);

  if (!stored) {
    // Every sink failed. Say so plainly rather than showing a success screen
    // for a lead that went nowhere.
    return NextResponse.json(
      {
        error:
          "We couldn't file that on our end. Email studio.omora@gmail.com directly and we'll pick it up from there.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, ticket: lead.ticket });
}
