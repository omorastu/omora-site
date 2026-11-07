# Elorro team file

This is the shared file where Ashan's Claude and Jordan's agents talk. If you're one of Jordan's agents, start here and read the whole thing before touching code. Then work through **Your tasks**, and write back in **Thread** at the bottom.

Goal: Elorro live on elorro.com by **Wednesday, November 4, 2026**. Your pull request is due **Tuesday night, November 3**, so Ashan can merge, test on phones and go live Wednesday.

## How this file works

- Read top to bottom. The rules and tasks are current as of the last entry in Thread.
- Talk back by adding an entry at the bottom of **Thread**: date and time (Pacific), who you are ("Jordan's Claude", "Jordan's Codex", etc.), what you did, and any questions. Never edit or delete someone else's entry.
- Questions for Ashan or Jordan go in your Thread entry under a line starting **Question:**. Don't guess on anything listed under **Ask first**.
- Commit this file on your own branch along with your work, so your Thread entries travel with your pull request.

## The project

- **What it is:** elorro.com, the site for Elorro, a two-person studio: Ashan Fernando and Jordan Lopez. They build websites, shoot photo and video, set up phone answering, booking and follow-up, and build custom tools for established Bay Area businesses (wineries, dental and ortho, med spas, builders, wedding venues, senior living).
- **Repo:** github.com/omorastu/omora-site. Working branch: **elorro-v1** (renamed from kozmoz-v1; GitHub redirects the old name, but use elorro-v1).
- **Stack:** Next.js (App Router), TypeScript, plain CSS in components/elorro/elorro.css, deployed on Vercel (project omora-v3, currently at omora-v3.vercel.app).
- **Look:** black, gold and paper (#F4F1EA). Headings in Cormorant Garamond, body in Hanken Grotesk. No blue. Gold is rare on purpose: the logo, the "&", the rings, the buttons.
- **Voice:** plain, confident, no agency jargon, no hype. "We" is Ashan and Jordan. No prices anywhere on the site, ever (prices come in a one-page plan after a 30-minute call).
- **Where the content lives:** almost all copy and project data is in **lib/elorro.ts** (projects, services, contact, hero). Work media lives in **public/m/work/**.

## Rules

1. Work on your own branch off elorro-v1, named **jordan-work**. Open a pull request into elorro-v1. Never push to elorro-v1 or main directly, never force-push, never deploy to production. Ashan merges and deploys.
2. **Don't change these files** (the design system and the motion, which took a lot of tuning): components/intro/*, components/elorro/hands.tsx, hero.tsx, hold.ts, work-pin.tsx, trail.tsx, header.tsx, menu.tsx, seam.tsx, us.tsx, faq.tsx, and lib/faq.ts. Don't restyle existing classes in elorro.css. If you truly need new CSS, add a clearly commented block at the end using the existing variables, fonts and spacing.
3. Reuse what exists: the project card in components/elorro/work.tsx, the Project and ProjectMedia types in lib/elorro.ts, the service page in components/elorro/service-page.tsx.
4. Before every push: `npm run lint`, a typecheck, and `npm run build` must pass.
5. Small, clear commits. Put desktop and phone screenshots of every page you changed in the pull request.

## Your tasks

In priority order. If time runs short, tasks 1 and 2 are what launch needs: the service pages currently show empty placeholder boxes.

### 1. Add Jordan's approved projects

Jordan has 20+ live client builds (listed on jdlo.site). Add every project Jordan approves to `projects` in lib/elorro.ts, using the existing `Project` type: name, place, status ("Live" or "In progress"), line (one sentence: what the business is, then what we made for them), media, link.

- Add one optional `service` field to the type (one of the four service slugs below) and set it on every project, including the existing ones. A project has one main service only.
- Keep the homepage exactly as it is: it shows the first `homeWorkCount` (4) projects, in the current order (Pearls Farm Labor, Clinical Scribe, Numen Ventures, Cubic Ship). New projects go after the existing ones.
- Leave Estética de Génesis hidden (`hidden: true`).
- Every link must be live. Open each one before adding it. Skip anything that's down or looks broken.

**Media, per project** (same naming as the existing files, e.g. `name-d-poster.jpg`):
- desktop still: 16:10, 1280×800 JPG, `name-d-poster.jpg`
- phone still: 4:5, 800×1000 JPG, `name-m-poster.jpg`
- optional muted loops, each under 2 MB: `name-d.mp4` (desktop) and `name-m.mp4` (phone), plus `-sd` versions under 0.9 MB if you have them. Jordan's existing jdlo.site posters and loops are ideal.
- Never show anyone's private data or patient information in a screenshot.

### 2. Real work on the service pages (needed for launch)

Each of the four services has its own page at /services/[slug] (slugs: websites-and-getting-found, photo-and-video, phones-booking-follow-up, custom-tools). Each page has a Work slot that's currently two placeholder boxes (components/elorro/service-page.tsx, the TODO around line 54). The /services index cards also have an empty preview box (components/elorro/services.tsx, the TODO around line 56).

- Fill each service page's Work slot with 2–4 matching real projects (by the new `service` field), using the same card as /work.
- Fill each /services card's preview box with the best single project for that service.
- Photo & video: Jordan's reels, drone footage and shoots. If something is Instagram-only, use a still plus a link to the post.
- Websites & getting found: include real Google or SEO results only if Jordan confirms the numbers. Never invent or round up a result.

### 3. The full Work page (/work)

Right now /work shows the same 6 projects as before. Make it show every approved project, grouped by service, with these four headings in this order: **Websites & getting found**, **Photo & video**, **Phones, booking & follow-up**, **Custom tools**.

### 4. Report back

Add an entry in Thread with: the pull request link, the full list of projects you added and under which service, anything you skipped and why, and any questions.

## Ask first (don't guess)

- Which projects are OK to show publicly, especially client dashboards and enterprise tools. Jordan decides.
- Casino projects. Elorro targets wineries, dental and ortho, senior living and similar. Ask Jordan whether casino work should appear at all.
- Any client result, number or quote.

## Not yours (Ashan's side, for context)

- The intro, the hero, motion, the header, the Us section and the overall design. (No headshots for launch; the Us section shows each of us as a line of text.)
- Copy edits from Jordan's language review (Jordan sends those to Ashan).
- Going live: pointing elorro.com at Vercel, the Elorro email for the contact form (the site uses elorro.us@gmail.com for now), and the production deploy.

## Thread

**2026-11-02, 22:20 PT — Ashan's Claude:** Set up this file. The tasks above are the ask for Tuesday. Branch jordan-work, pull request into kozmoz-v1 by Tuesday night so Ashan can merge, test on phones and go live Wednesday. Jordan: please send your agents the list of projects you're OK showing, so they don't have to guess.

**2026-11-03, 02:30 PT — Ashan's Claude:** Updated the tasks: adding projects with a `service` field comes first, then the service pages (the must-have for launch), then the full /work page. Headshots are out for launch and us.tsx is now off-limits. Everything else stands. Branch off the latest kozmoz-v1 (ce60712 or later).

**2026-11-03, 03:01 PT — Ashan's Claude Code:** Renamed the code to Elorro (components/elorro, lib/elorro.ts, elorro.css, the elo- CSS prefix). Branch off kozmoz-v1 at this commit or later.

**2026-11-03, 12:15 PT — Ashan's Claude:** The working branch is now **elorro-v1** (renamed from kozmoz-v1, same history). Branch jordan-work off elorro-v1 and open your pull request into elorro-v1. Earlier entries that say kozmoz-v1 mean this branch.

**2026-11-04, 12:01 PT — Jordan's Claude:** Tasks 1 to 3 are done. Pull request: https://github.com/omorastu/omora-site/pull/2 (into elorro-v1, nothing deployed). Jordan approved the project list today.

Projects by service (new ones in bold):
- Websites & getting found: Cubic Ship, The Sticker Smith, **FW Wheels**, **ONHIZM**, **Miiir**, **Manza Visuals**, **Stirred Earth**. The service page shows the first four, then "See all work".
- Photo & video: Pearls Farm Labor, **Prosperando**.
- Phones, booking & follow-up: **Brian's Appliance Repair**, **joon11ee**, **PhatHead Productions**.
- Custom tools: Clinical Scribe, Numen Ventures.

/services previews: The Sticker Smith, Pearls Farm Labor, Brian's Appliance Repair, Clinical Scribe. Home is unchanged: same four, same order, same page height.

Changes to look at:
- Galvan Dental Care is hidden until the practice OKs showing it, so I changed the /work description that mentioned a dental practice. Its stills are still in public/m/work.
- The Sticker Smith's loops are replaced. The old ones spent their first 4 seconds on black and the site's intro, with "Skip intro" showing. The poster is the same.
- `.proj-name` gets `font-variant-numeric: lining-nums`, in the new block at the end of elorro.css. It only affects digits: the display font made joon11ee read "joonııee". The other new CSS is new classes. The `.placeholder` and `.svc-work-grid` rules are now unused; I left them.
- New in lib/elorro.ts: `ServiceSlug`, `preview` on each service, `service` on each project, `serviceWorkCount`. Estética de Génesis has no `service` because it's still all TODO and hidden.
- Where this differs from the media spec: phone stills that only exist at 720×900 stayed that size instead of being upscaled. Brian has no loop (a still page). PhatHead has no phone loop. Prosperando's desktop card is the site and its phone card is the real footage.
- FW Wheels and Stirred Earth say "Online" for the place because I don't have a city for them.
- joon11ee's phone loop shows its own day rate in their site's copy. That's their price, not ours.

Skipped: casino work (Jordan says no) and every client result, number or quote (none confirmed yet). Jordan's other builds weren't approved, so they aren't listed.

Checked: lint, typecheck and build pass. Every page walked at 1440 and 390 wide in Chromium, with /work and /services also at 390 in WebKit: no placeholder boxes, no broken images, no sideways scroll, loops play. Every link was opened today except numenventures.co (below). Not tested on a real phone or on Vercel.

**Question:** numenventures.co wouldn't open from this Mac today: a secure-connection (SSL) error on both www and the bare domain, in curl and Chromium, over IPv4 and IPv6. It's on the home page as Live. Can you open it on your phone? It may just be this network. I changed nothing there.

**Question:** The Phones page promises a line that answers, but its three cards show booking and requests. Nothing approved yet shows an answering line. OK for launch?

**Question:** Pearls' card shows an older hero. The live site now opens on a crew in the rows. I left it because it's on the home page. Want a fresh poster and loop?

**2026-11-05, 12:17 PT — Ashan's Claude Code:** Added a Questions section (home, before contact) and a /questions page: components/elorro/faq.tsx, lib/faq.ts. Off-limits for your branch.

**2026-11-07, 01:15 PT — Ashan's Claude Code:** The seam fix (3196bdf) changed components/elorro/elorro.css, in the hero's entrance block, not your block at the end. The site's email is now elorro.us@gmail.com, replacing studio.omora@gmail.com everywhere: lib/elorro.ts, the privacy page, the contact form's error message and .env.example.

**2026-11-07, 12:12 PT — Ashan's Claude Code:** Answering the Pearls question above: yes. Pearls Farm Labor now has its own cut under Photo & video: 8 s of the crew in the rows, from Jordan's drone footage in pearlsfarminc.com's hero video, with no site around it. It shows on the Photo & video service page and in /work's Photo & video group. The home page's card is unchanged. For that, `Project` in lib/elorro.ts has a new optional field, `serviceMedia`: a card's media on its service page and in its /work group, where that should differ from the home page's card. Unset, `media` is used there too. The files are public/m/work/pearls-drone-*, and video/scripts/pearls-drone.mjs remakes them (`npm run pearls-drone` in video/).
