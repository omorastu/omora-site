# Omora — site

Next.js 16 (App Router) · React 19 · Tailwind 3 · TypeScript

```
npm run dev        # http://localhost:3000
npm run build
npm run lint       # ESLint (eslint.config.mjs) — Next 16 dropped `next lint`
npm run typecheck
```

## The site — "Names on the door"

Rebuilt from the design preview at omora-a.vercel.app. Two names on the door,
a seam down the middle, and everything on the side of whoever's hands it is
in. One ink on paper; the two people's colours (brass, cyan) mark names and
credits only.

| Route | What it is |
| --- | --- |
| `/` | hero, us, what we do, work (the first few projects), contact |
| `/services` | the four services, each with what's included (`/services#websites` …), then how it starts |
| `/work` | every project ready to show |
| `/work/clinical-scribe` | the case study (`lib/case-studies/`) |
| `/privacy`, `/terms` | legal |

There are no prices anywhere on the site. `/pricing` and `/team` are gone and
redirect permanently (`/pricing` → `/services`, `/team` → `/#us`), as does
every old `/services/<slug>` → `/services`; see `next.config.mjs`.

| File | What it is |
| --- | --- |
| `lib/kozmoz.ts` | **all copy and data**: people, services (with what's included), projects, contact, the inner pages' copy |
| `app/page.tsx` | the home page |
| `components/kozmoz/` | one file per home section, plus `hands.tsx` (the "pick a name" toggle, the names' entrance), `seam.tsx`, `page.tsx` (the frame every other page sits in) |
| `components/kozmoz/kozmoz.css` | every style on every page, scoped under `.kz` |
| `components/work/case-study.tsx` | the case-study template |
| `components/wordmark.tsx` | the OMORA wordmark (Cormorant Garamond 500, caps, 0.42em) |

(The `kozmoz` folder and file names date from a paused rename to Kozmoz; the
site is Omora.)

The pages scale as a poster: the root font size follows the viewport (a 1440
frame on desktop, 375 under 1024px), so every `rem` in `kozmoz.css` scales with
it.

## Editing content

Everything is in `lib/kozmoz.ts`.

- **Work.** Projects show in list order. The home page shows the first
  `homeWorkCount` (3), then "See all work"; `/work` shows them all. Set
  `hidden: true` on a project to keep it off every page until it's ready. A
  `link` starting `/` stays on the site (Clinical Scribe's case study); any
  other opens in a new tab.
- **Services.** Each has an `id` (its anchor on `/services`) and an
  `included` list.
- **Portraits** are placeholders until the shoot — set `photo` on a person.
- **Case studies** are data files in `lib/case-studies/`; screenshots print
  only once a study's shot has `media`.

The form posts to `/api/lead`, below.

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
components check the media query themselves (the intro, the names' entrance,
the work loops) and settle on a finished static state instead. When adding
motion, check both paths.

## v1

The previous site is archived in `app/_v1/`. Next ignores `_`-prefixed folders,
so those routes don't build. Delete the folder, or move a page back up into
`app/` to restore it — its styles reference v1 palette tokens that no longer
exist, so it would need restyling first.
