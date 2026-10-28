import { randomUUID, randomInt } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Lead capture.
 *
 * A lead is written to every configured sink. The route only reports success if
 * at least one *durable* sink accepted it — a lead must never be silently
 * dropped because a service was misconfigured.
 *
 * Sinks:
 *   email — Resend. Durable. The primary sink on serverless hosting, where the
 *           filesystem is ephemeral.
 *   file  — .data/leads.jsonl. Durable on a normal server or in local dev;
 *           treated as best-effort because Vercel's runtime disk is read-only
 *           outside /tmp and does not survive between invocations.
 *
 * Adding a database: implement a third sink returning DurableResult and push it
 * into the Promise.allSettled below. Nothing else needs to change.
 */

export type Lead = {
  id: string;
  ticket: string;
  createdAt: string;
  name: string;
  /** At least one of email or phone is always set; the route enforces it. */
  email?: string;
  phone?: string;
  business?: string;
  needs: string[];
  budget?: string;
  /** Who the visitor asked to hear back from: "Ashan", "Jordan" or "Either". Home page form only. */
  replyFrom?: string;
  message?: string;
  source?: string;
  userAgent?: string;
};

type DurableResult = { sink: string; ok: boolean; durable: boolean; error?: string };

/** Crockford-ish alphabet: no I/L/O/U, so a ticket read aloud is unambiguous. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function makeTicket() {
  let out = "";
  for (let i = 0; i < 4; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return `KZM-${out}`;
}

export function newLead(input: Omit<Lead, "id" | "ticket" | "createdAt">): Lead {
  return {
    id: randomUUID(),
    ticket: makeTicket(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

async function toFile(lead: Lead): Promise<DurableResult> {
  const dir = path.join(process.cwd(), ".data");
  try {
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(lead) + "\n", "utf8");
    // Durable only where the disk persists. On Vercel this write either throws
    // (read-only FS) or lands on a container that's about to disappear, so it
    // is never counted as the durable sink there.
    return { sink: "file", ok: true, durable: !process.env.VERCEL };
  } catch (err) {
    return {
      sink: "file",
      ok: false,
      durable: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function toEmail(lead: Lead): Promise<DurableResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Kozmoz <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return {
      sink: "email",
      ok: false,
      durable: false,
      error: "RESEND_API_KEY or CONTACT_TO_EMAIL not set",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const lines = [
      `Ticket:   ${lead.ticket}`,
      `Name:     ${lead.name}`,
      `Email:    ${lead.email || "—"}`,
      `Phone:    ${lead.phone || "—"}`,
      `Business: ${lead.business || "—"}`,
      `Needs:    ${lead.needs.length ? lead.needs.join(", ") : "—"}`,
      `Budget:   ${lead.budget || "—"}`,
      `Reply:    ${lead.replyFrom || "—"}`,
      `Source:   ${lead.source || "—"}`,
      "",
      "The problem:",
      lead.message || "(not filled in)",
      "",
      `— id ${lead.id} · ${lead.createdAt}`,
    ].join("\n");

    const { error } = await resend.emails.send({
      from,
      to,
      // resend v3 spells this snake_case; v4+ renamed it to `replyTo`. A lead
      // that left only a phone number has nothing to reply to by email.
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject: `${lead.ticket} — ${lead.business || lead.name}`,
      text: lines,
    });

    if (error) {
      return { sink: "email", ok: false, durable: false, error: String(error.message ?? error) };
    }
    return { sink: "email", ok: true, durable: true };
  } catch (err) {
    return {
      sink: "email",
      ok: false,
      durable: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function saveLead(lead: Lead) {
  const results = await Promise.allSettled([toFile(lead), toEmail(lead)]);

  const settled: DurableResult[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          sink: i === 0 ? "file" : "email",
          ok: false,
          durable: false,
          error: String(r.reason),
        }
  );

  for (const r of settled) {
    if (!r.ok) console.error(`[lead] sink "${r.sink}" failed: ${r.error}`);
  }

  return { stored: settled.some((r) => r.ok && r.durable), results: settled };
}
