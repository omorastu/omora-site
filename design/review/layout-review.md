# Layout review

Covers the editorial grid, the Work cards and Clinical Scribe. Screenshots are in `layout-review.pdf`: the homepage, /work and /work/clinical-scribe at 1440 and 390, plus a cover page of measured checks. All of it was captured from the dev server on port 3100.

## Homepage height

The site's type scales with the window up to 1920px wide, so the same page is taller on a bigger screen. The old page's "about 12,400px" is what a 1920–2560px-wide window shows.

| Window | Before | After | Change |
| --- | --- | --- | --- |
| Desktop 1440×900 | 8,983 | 4,425 | 49% |
| Desktop 1920×1080 | 11,546 | 5,674 | 49% |
| Desktop 2560×1440 | 12,186 | 6,034 | 50% |
| Phone 390×844 | 8,131 | 6,824 | 84% |

The phone page is shorter, but by less than desktop:
- **The hero:** it's unchanged, as asked, at about 820px including the header.
- **Work:** its four 4:5 live cards stack in one column, about 2,600px together.
- **What's left:** spacing was tightened, but the rest is content.

## Video files still missing

- **Cubic Ship:** `cubic-m.mp4`, `cubic-m-sd.mp4`. On phones the card shows its poster.
- **Galvan Dental Care:** `galvan-d.mp4`, `galvan-d-sd.mp4`, `galvan-m.mp4`, `galvan-m-sd.mp4`. The card shows its posters.

Each card lists the full set of cuts in `lib/kozmoz.ts`. A listed file that isn't in `public/m/work/` is left out when the site builds, and the build log names it, so dropping the file in turns that cut on.

What every other card has:
- **Numen and Clinical Scribe:** the full set of cuts, plus their own reduced-motion stills.
- **Pearls and Cubic:** SD cuts are new this round, made from their existing loops by `video/scripts/sd.mjs`.
- **The Sticker Smith:** no SD cuts, on purpose. Its loops (388 KB and 325 KB) are already lighter than an SD cut may be.
- **Reduced-motion images:** every project except Numen and Clinical Scribe uses its poster, which is already a frame of its loop.

## Clinical Scribe: a replica, not a recording

Nothing in `~/Projects/omora-clinical` was run or recorded. The video is a replica built in `video/` from the app's source code. It uses the app's own layout, Tailwind classes, colours, Geist fonts, labels and demo banner, with made-up data.

I couldn't guarantee the app would run fully on synthetic data:
- **The consult flow calls production.** The routes it uses (status, generate, letters, audio) call `kickPipeline`, which invokes the production Lambda named in `.env` whatever `DATA_MODE` is set to.
- **Drafting calls live Bedrock.** The summary and letters are drafted through live AWS Bedrock in both modes.
- **The local `.env` points at production.** It holds the production database, PHI bucket and Cognito identifiers, so the app is one setting away from live.
- **The demo patients aren't Zz- names.** The synthetic seed that `/today` and `/follow-ups` list uses names like any others.

What the replica's data contains:
- **People:** only invented ones, all Zz- names, for example Zz-Maya Example, Dr. Zz-Demo and Dr. Zz-Lee Sample.
- **No personal data:** no dates of birth and no identifiers.
- **The practice:** called "Demo Orthodontics", because the real practice is not named, by agreement.
- **The banner:** the app's own demo banner is on every frame.

How the frames were checked:
- **The data file:** it is the only source of on-screen text, and it was read in full.
- **The rendered frames:** every 10th frame of each composition was checked, and again for the desktop cut after its camera change.

What the page shows:
- **Under the intro:** the live card, captioned "Demo data".
- **In "02 The build":** the three stills (summary, doctor letter, follow-ups), each captioned "Demo data".

## Numen, re-rendered sharper

- **Capture:** the desktop pages were captured at 1.5× as PNG.
- **Phone capture:** it stays at 3×, because 1.5× of 390px is 585px, narrower than the 720px video.
- **Scaling:** every tile lands 1:1 on the master. Each file is a lanczos downscale of the master, encoded at the lowest CRF that fits.

| File | Size | Limit | CRF |
| --- | --- | --- | --- |
| `numen-d.mp4` | 1.98 MB | 2 MB | 28.5 |
| `numen-m.mp4` | 1.94 MB | 2 MB | 25.5 |
| `numen-d-sd.mp4` | 870 KB | 900 KB | 31 |
| `numen-m-sd.mp4` | 865 KB | 900 KB | 30.5 |

The caps set those CRFs, so they can't go lower at these sizes. The text is still visibly cleaner than in the last render.

## Checks

- **Lint, typecheck and build** all pass (`npx eslint .`, `npx tsc --noEmit`, `npm run build`).
- **Text on lines:** none crosses a rule, border or the seam on any of the three pages at either size.
- **Centred text:** none below the hero.
- **The seam:** it is only in the hero and ends where the hero does.
- **Loop loading on /work, with motion on:**
  - Normally, every card plays its HD cut.
  - On 3G or Save-Data, the SD cut plays where there is one.
  - On 2G, posters only.

## Not done, or worth a look

- **/services** still has the old seam and centred layout. It wasn't in this brief, so I left it as it was (same height as before). It can move to the new grid in a later pass.
- **Duplicate image under reduced motion:** the Clinical Scribe live card's reduced-motion still is the summary frame. That is also the first still in "02 The build", so visitors with reduced motion see that image twice on the case study.
- **Galvan Dental Care** has no link (unchanged), so its card ends with its line.
