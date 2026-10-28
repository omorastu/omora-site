# Kozmoz — site

Next.js 16 (App Router) · React 19 · Tailwind 3 · TypeScript

```
npm run dev      # http://localhost:3000
npm run build
```

## Home page — "Names on the door"

`/` is the Kozmoz home page, rebuilt from the design preview at
omora-a.vercel.app. Two names on the door, a seam down the middle, and
everything on the side of whoever's hands it is in. One ink on paper; the two
people's colours (brass, cyan) mark names and credits only.

| File | What it is |
| --- | --- |
| `app/page.tsx` | assembles the sections |
| `components/kozmoz/` | one file per section, plus `hands.tsx` (the "pick a name" view, the names' entrance, the seam) |
| `components/kozmoz/kozmoz.css` | every style on the page, ported rule for rule from the preview and scoped under `.kz` so none of it reaches the inner pages |
| `lib/kozmoz.ts` | **all home page copy and data**: people, services, projects, contact |
| `components/wordmark.tsx` | the KOZMOZ wordmark (Cormorant Garamond 500, caps, 0.42em), used on every page |

The page scales as a poster: its root font size follows the viewport (a 1440
frame on desktop, 375 under 1024px), so every `rem` in `kozmoz.css` scales
with it. Portraits are placeholders until the shoot — set `photo` on a person
in `lib/kozmoz.ts`. The form posts to the same `/api/lead` backend as before.

The inner pages (services, work, pricing, team, legal) still run the V3 design
described below. The V3 home sections are kept, unused, in `components/home/`.

## V3 design system (inner pages) — "Brass & Signal"

A dark workshop lit by a live machine signal. One rule governs colour, and
keeping it is what stops the palette turning into decoration:

| Role | Meaning | Tokens |
| --- | --- | --- |
| Brass / gold | **the built thing** — structure, rules, plates, headings, primary CTAs | `brass` `brass-lo` `foil` |
| Teal | **the running thing** — only what is genuinely live: waveforms, filling slots, active states, pulses | `signal` `signal-lo` `signal-hi` |
| Brown | ground and panels | `espresso` `bark` `umber` `umber-hi` |

If an element isn't moving or live, it's brass. Tokens live in
`tailwind.config.ts`.

**Type:** Bricolage Grotesque (display, used big and sparingly) · Instrument
Sans (body) · JetBrains Mono (labels, data, ticket numbers).

## Layout

| File | What it is |
| --- | --- |
| `components/site/` | one file per section |
| `components/previews.tsx` | the four animated capability previews |
| `components/ui/` | shadcn background components (aurora, particles, beams) |
| `lib/content.ts` | **all site copy and data** — edit here, not in JSX |
| `lib/leads.ts` | lead persistence |
| `app/api/lead/route.ts` | form backend |

## Editing content

Copy, work items, steps and team all live in `lib/content.ts`. Adding a project
to the Proof grid means adding an object to `work` — nothing else.

**Screenshots:** work items with no `screenshot` render a schematic diagram of
the job instead. That's deliberate — a mocked-up browser window on a real
portfolio implies a screen that never existed. To use a real image, drop it in
`public/previews/` and set `screenshot: "/previews/name.jpg"` on the item.

## The lead form

`POST /api/lead`. Validates server-side and writes to every configured sink,
reporting success only if a **durable** one accepted the lead — a submission is
never silently dropped.

Sinks:

- **email** (Resend) — durable. The primary sink on Vercel.
- **file** (`.data/leads.jsonl`) — durable in local dev or on a normal server.
  Not counted as durable on Vercel, where the disk is ephemeral.

If every sink fails the API returns 503 and tells the visitor to email directly,
rather than showing a success screen for a lead that went nowhere.

To add a database, implement one more sink returning `DurableResult` and add it
to the `Promise.allSettled` in `lib/leads.ts`. Nothing else changes.

**Spam handling.** A honeypot field returns a fake success (zero false
positives — a person never fills a hidden field). The submit-timing check is a
heuristic, so it returns a *recoverable* error instead: autofill plus a fast
typist can trip it, and answering a real person with a success screen while
discarding their message is the one thing this form must never do. Rate limit is
5 per 10 minutes per IP, per instance — swap in Redis if it needs to hold across
instances.

### Environment

Copy `.env.example` to `.env.local`, and set the same keys in Vercel. Without
`RESEND_API_KEY` + `CONTACT_TO_EMAIL` the form works locally (file sink) but
returns 503 in production.

## Motion

Everything respects `prefers-reduced-motion`. CSS animation is handled by the
global rule in `globals.css`; canvas and JS-driven motion can't be, so those
components gate on `useReducedMotion` in `components/motion.tsx` and render a
finished static state instead. When adding motion, check both paths.

## v1

The previous site is archived in `app/_v1/`. Next ignores `_`-prefixed folders,
so those routes don't build. Delete the folder, or move a page back up into
`app/` to restore it — its styles reference v1 palette tokens that no longer
exist, so it would need restyling first.
