import { NextResponse } from "next/server";
import { Resend } from "resend";

// Required env vars (set these in Vercel → Project Settings → Environment Variables):
//   RESEND_API_KEY   – from resend.com, free tier is plenty to start
//   CONTACT_TO_EMAIL – the inbox that should receive new leads (e.g. hello@omora.studio)
//
// Until RESEND_API_KEY is set, this route will return a clear error instead of
// silently pretending to work — so a broken form never ships unnoticed.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, business, budget, message, mode, page, businessType, needs } =
      body ?? {};

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !toEmail) {
      console.error(
        "[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL env vars."
      );
      return NextResponse.json(
        {
          error:
            "Form backend isn't configured yet (missing email settings on the server).",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const subject =
      mode === "quote"
        ? `New quote request — ${business || name}`
        : `New free mockup request — ${business || name}`;

    const { error } = await resend.emails.send({
      from: "Omora Site <onboarding@resend.dev>", // swap for a verified sending domain once one's set up
      to: toEmail,
      reply_to: email,
      subject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Business: ${business || "—"}`,
        `Business type: ${businessType || "—"}`,
        `Needs: ${Array.isArray(needs) && needs.length ? needs.join(", ") : "—"}`,
        mode === "quote" ? `Budget: ${budget || "—"}` : null,
        `Mode: ${mode}`,
        `Source page: ${page || "unknown"}`,
        "",
        "Message:",
        message || "(none)",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "Email failed to send. Try again in a moment." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
