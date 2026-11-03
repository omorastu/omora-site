# Elorro team file

This is the shared file where Ashan's Claude and Jordan's agents talk. If you're one of Jordan's agents, start here and read the whole thing before touching code. Then work through **Your tasks**, and write back in **Thread** at the bottom.

Goal: Elorro live on elorro.com by **Wednesday, November 4, 2026**.

## How this file works

- Read top to bottom. The rules and tasks are current as of the last entry in Thread.
- Talk back by adding an entry at the bottom of **Thread**: date and time (Pacific), who you are ("Jordan's Claude", "Jordan's Codex", etc.), what you did, and any questions. Never edit or delete someone else's entry.
- Questions for Ashan or Jordan go in your Thread entry under a line starting **Question:**. Don't guess on anything listed under **Ask first**.
- Commit this file on your own branch along with your work, so your Thread entries travel with your pull request.

## The project

- **What it is:** elorro.com, the site for Elorro, a two-person studio: Ashan Fernando and Jordan Lopez. They build websites, shoot photo and video, set up phone answering, booking and follow-up, and build custom tools for established Bay Area businesses (wineries, dental and ortho, med spas, builders, wedding venues, senior living).
- **Repo:** github.com/omorastu/omora-site. Working branch: **kozmoz-v1** (the folder and file names still say "kozmoz" from an earlier name; that's expected, don't rename them).
- **Stack:** Next.js (App Router), TypeScript, plain CSS in components/kozmoz/kozmoz.css, deployed on Vercel (project omora-v3, currently at omora-v3.vercel.app).
- **Look:** black, gold and paper (#F4F1EA). Headings in Cormorant Garamond, body in Hanken Grotesk. No blue. Gold is rare on purpose: the logo, the "&", the rings, the buttons.
- **Voice:** plain, confident, no agency jargon, no hype. "We" is Ashan and Jordan. No prices anywhere on the site, ever (prices come in a one-page plan after a 30-minute call).
- **Where the content lives:** almost all copy and project data is in **lib/kozmoz.ts** (projects, services, contact, hero). Work media lives in **public/m/work/**.

## Rules

1. Work on your own branch off kozmoz-v1, named **jordan-work**. Open a pull request into kozmoz-v1. Never push to kozmoz-v1 or main directly, never force-push, never deploy to production. Ashan merges and deploys.
2. **Don't change these files** (the design system and the motion, which took a lot of tuning): components/intro/*, components/kozmoz/hands.tsx, hero.tsx, hold.ts, work-pin.tsx, trail.tsx, header.tsx, menu.tsx, seam.tsx, scroll-debug.tsx. Don't restyle existing classes in kozmoz.css. If you truly need new CSS, add a clearly commented block at the end using the existing variables, fonts and spacing.
3. Reuse what exists: the project card in components/kozmoz/work.tsx, the Project and ProjectMedia types in lib/kozmoz.ts, the service page in components/kozmoz/service-page.tsx.
4. Before every push: `npm run lint`, a typecheck, and `npm run build` must pass.
5. Small, clear commits. Put desktop and phone screenshots of every page you changed in the pull request.
6. Ignore CLAUDE.md's "dale" and cc-report rules. Those are for Ashan's Claude Code only.

## Your tasks

### 1. The full Work page (/work)

Right now the homepage shows 4 projects and /work shows the same 6. Jordan has 20+ live client builds (listed on jdlo.site). Build /work out to show every project Jordan approves.

- Group /work by service, using these four headings in this order: **Websites & getting found**, **Photo & video**, **Phones, booking & follow-up**, **Custom tools**. A project can appear under one service only (its main one).
- Add each project to `projects` in lib/kozmoz.ts using the existing `Project` type: name, place, status ("Live" or "In progress"), line (one sentence: what the business is, then what we made for them), media, link. If you need a service field to group by, add one optional field to the type and set it on the existing projects too.
- Keep the homepage exactly as it is: it shows the first `homeWorkCount` (4) projects, in the current order (Pearls Farm Labor, Clinical Scribe, Numen Ventures, Cubic Ship). New projects go after the existing ones.
- Leave Estética de Génesis hidden (`hidden: true`).
- Every link must be live. Open each one before adding it. Skip anything that's down or looks broken.

**Media, per project** (same naming as the existing files, e.g. `name-d-poster.jpg`):
- desktop still: 16:10, 1280×800 JPG, `name-d-poster.jpg`
- phone still: 4:5, 800×1000 JPG, `name-m-poster.jpg`
- optional muted loops, each under 2 MB: `name-d.mp4` (desktop) and `name-m.mp4` (phone), plus `-sd` versions under 0.9 MB if you have them. Jordan's existing jdlo.site posters and loops are ideal.
- Never show anyone's private data or patient information in a screenshot.

### 2. Real work on the service pages

Each of the four services has its own page at /services/[slug] (slugs: websites-and-getting-found, photo-and-video, phones-booking-follow-up, custom-tools). Each page has a Work slot that's currently two placeholder boxes (components/kozmoz/service-page.tsx, the TODO around line 54). The /services index cards also have an empty preview box (components/kozmoz/services.tsx, the TODO around line 56).

- Fill each service page's Work slot with 2–4 matching real projects, using the same card as /work.
- Fill each /services card's preview box with the best single project for that service.
- Photo & video: Jordan's reels, drone footage and shoots. If something is Instagram-only, use a still plus a link to the post.
- Websites & getting found: include real Google or SEO results only if Jordan confirms the numbers. Never invent or round up a result.

### 3. Report back

Add an entry in Thread with: the pull request link, the full list of projects you added and under which service, anything you skipped and why, and any questions.

## Ask first (don't guess)

- Which projects are OK to show publicly, especially client dashboards and enterprise tools. Jordan decides.
- Casino projects. Elorro targets wineries, dental and ortho, senior living and similar. Ask Jordan whether casino work should appear at all.
- Any client result, number or quote.

## Not yours (Ashan's side, for context)

- The intro, the hero, motion, the header and the overall design.
- Copy edits from Jordan's language review (Jordan sends those to Ashan).
- Going live: pointing elorro.com at Vercel, the Elorro email for the contact form (the site still shows studio.omora@gmail.com), and the production deploy.
- An iPhone-only bug: on some iPhones the first swipe down at the very top of the home page doesn't scroll. Jordan, if you can, open omora-v3.vercel.app/?debug=scroll on your iPhone, wait for the box to say "hold off", swipe up once from the top, and screenshot the box for Ashan.

## Thread

**2026-11-02, 22:20 PT — Ashan's Claude:** Set up this file. The tasks above are the ask for Tuesday. Branch jordan-work, pull request into kozmoz-v1 by Tuesday night so Ashan can merge, test on phones and go live Wednesday. Jordan: please send your agents the list of projects you're OK showing, so they don't have to guess.
