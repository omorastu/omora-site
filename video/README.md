# Work-section live cards

The loops on the site's Work cards, made with [Remotion](https://www.remotion.dev):
Numen Ventures (the real site, captured) and Clinical Scribe (a replica, see
below); Pearls Farm Labor's desktop loop, captured frame by frame from its
live site; and the SD cuts of the older loops. A separate package with its
own dependencies; the site never imports anything from here.

```
cd video
npm install          # first time only
npm run capture      # full-page screenshots of numenventures.co → public/captures/
npm run render       # every project's videos, posters and stills → ../public/m/work/
npm run build        # capture, then render
npm run pearls       # pearls-d.mp4 and its SD cut, from pearlsfarminc.com
npm run pearls-drone # Pearls' Photo & video loops and posters, from its hero video
npm run sd           # SD cuts of Pearls' phone loop and Cubic Ship's
npm run film-capture # captures for the film's loops (/film): Pearls' site, Pearls' Instagram, the practice's concept site
npm run film         # the film's loops → ../public/m/film/
npm run studio       # preview and scrub the compositions in the browser
```

`npm run render -- numen` (or `clinical`) does one project, and
`npm run render -- numen phone` one size of it.

What `render` writes into `public/m/work/` for each project (`numen-…`,
`clinical-…`):

| File | Size | For |
| --- | --- | --- |
| `<name>-d.mp4` | 1280×800, under 2 MB | wide screens |
| `<name>-d-sd.mp4` | 864×540, under 900 KB | wide screens on slow or Save-Data connections |
| `<name>-m.mp4` | 720×900, under 2 MB | phones |
| `<name>-m-sd.mp4` | 544×680, under 900 KB | phones on slow or Save-Data connections |
| `<name>-d-poster.jpg`, `<name>-m-poster.jpg` | 960×600, 544×680 | the first frame, shown until the loop plays |
| `<name>-d-still.jpg`, `<name>-m-still.jpg` | 1920×1200, 1080×1350 | the clearest frame, for visitors with reduced motion on |

All H.264 (High, yuv420p), 30 fps, no audio, index first (Numen 18 s,
Clinical Scribe 24.3 s). Each
composition is drawn larger than any file made from it (its master: 2160×1350
on desktop, 1170×1462 on the phone) and rendered once near-lossless; every file
is a lanczos downscale of that master, encoded at the lowest CRF that keeps it
under its cap (a bisection over CRF, x264 veryslow, one keyframe per loop).
It uses Remotion's own ffmpeg, so nothing needs installing.

- `scripts/capture.mjs` shoots each Numen page at 1440 wide at 1.5× and 390
  wide at 3× (1.5× of 390 would be narrower than the 720px video), as PNG
  tiles, with fonts and images loaded and any popup hidden. The tiles land 1:1
  on the master, so nothing is resampled before the final downscale. It also
  records where the sections the loop pauses on sit (`src/captures.json`).
  The captures aren't committed; capture again before rendering on a new
  machine. If Playwright says its browser is missing, run
  `npx playwright install chromium-headless-shell`.
- `src/NumenLoop.tsx` is the Numen loop: the beats (pauses, eased scrolls,
  cross-fades) for each size, and the page drawn from the tiles. The sticky
  header stays put while the page scrolls under it.
- `scripts/render.mjs` renders, `scripts/encode.mjs` encodes (shared with
  `scripts/sd.mjs`).
- `scripts/pearls.mjs` remakes `pearls-d.mp4` (1280×800, under 2 MB),
  `pearls-d-sd.mp4` and `pearls-d-poster.jpg` from pearlsfarminc.com: the
  homepage at 1440×900 and 1.5×, with each of its hero video's 534 frames
  (cut from the video's own file) shown in turn in the video's place and the
  page captured, into a near-lossless master that's encoded as above. Nothing
  is dropped or doubled, as a screen recording would. The phone loop is the
  older one.
- `scripts/pearls-drone.mjs` makes Pearls' Photo & video card (`pearls-drone-…`,
  every size above, posters 1280×800 and 800×1000) from the drone footage in
  pearlsfarminc.com's hero video, with no site around it: 8 s of the crew in
  the rows, whose last second dissolves into its first. The source file and
  the timings are in its opening comment.
- `scripts/sd.mjs` makes `pearls-m-sd.mp4` and `cubic-d-sd.mp4` from the
  loops themselves: scaled to the SD size, and at most 900 KB and 60% of the
  loop. The Sticker Smith's loops are already lighter than that, so they have
  none.

The site picks between the cuts in `components/elorro/work-video.tsx`; the
files are listed on each project in `lib/elorro.ts`. One that's listed but not
in `public/m/work/` yet is left out when the site builds, named in the build
log, and its card shows the poster in its place (`lib/work-media.ts`).

## The film's loops (/film)

Three videos made for the film, in `public/m/film/`, encoded like the Work
loops (1280×800 and 720×900 under 2 MB, SD cuts at 864×540 and 544×680 under
900 KB, posters at 1280×800 and 720×900). The Work section's own files in
`public/m/work/` are never touched.

| Files | What | Made by |
| --- | --- | --- |
| `pearls-site-{d,m}` | Pearls Farm Labor's site as one flow (9 s): the hero, one scroll down the homepage through every section to "Let's talk about your block", then a dissolve into the Request a crew page | `src/FilmLoops.tsx` (PearlsSite), from `npm run film-capture` |
| `pearls-crew-{d,m}` | Pearls' site from its crew side, for a contractor (9 s): the services list (harvest, orchard and labor crews), one scroll past the crews at work to "Let's talk about your block", then a dissolve into the Request a crew page (in by 7.2 s) | `src/FilmLoops.tsx` (PearlsCrew), from `npm run film-capture -- pearls` |
| `practice-site-{d,m}` | Brightline Orthodontics, a made-up practice's concept site (`/demos/practice`), for a practice's website scene (9 s): its top, then one smooth scroll down the whole site, resting on its Book a consult form from 7.5 s. Labelled "Concept site", never client work | `src/FilmLoops.tsx` (PracticeSite), from `npm run film-capture -- practice` (needs the dev server; `PRACTICE_BASE` to point elsewhere) |
| `photo-reel-{d,m}` | The Photo & video demo (11 s): Jordan's drone footage of a crew in the rows, dissolving into Pearls' Instagram profile, scrolled from its header down its grid | `src/FilmLoops.tsx` (PhotoReel), from the captures and the drone footage |
| `clinical-film-{d,m}` | The Custom tools demo (15.5 s): Clinical Scribe's invented consult recorded, written up, its coaching ("Recommended next move"), then "Draft this message" and the follow-up letter drafting | `src/ClinicalFilm.tsx`, from the same replica as the Work card (which it leaves as it is) |

```
npm run film-capture          # every capture
npm run film-capture -- pearls
npm run film-capture -- practice
npm run film                  # every loop, both sizes
npm run film -- clinical phone
```

- **The captures** (`scripts/film-capture.mjs`) are full-page tiles, as for
  Numen, in `public/film-captures/`, with where things sit in
  `src/film-captures.json`. They aren't committed. `npm run film-capture --
  practice` captures `/demos/practice` from the local dev server; the page is
  static, so the tiles are exactly what it serves.
- **The Instagram capture needs a logged-in session.** Instagram puts a login
  wall over a profile seen logged out. The session is saved by hand from a
  visible browser window, logged in by a person, into
  `design/review/.auth/social.json`. That folder is never committed
  (`.gitignore`), and the script only hands the file to the browser. (The
  session used for round 7 was deleted in round 9; a new capture needs a new
  login.)
- **Nothing from that account shows.** Before the shots, the capture hides
  everything pinned to the screen: Instagram's navigation (with the account's
  avatar), Messages, and the app banner. What's left is Pearls' own header and
  grid. If the profile shows a login wall or a check, the capture stops.
- **The drone footage** is the hero video on pearlsfarminc.com
  (`home-two-angle-graded-v6-16x9.mp4`). Save it as
  `public/film-captures/drone-src.mp4`. The reel plays the crew's stretch from
  5.4 s, cropped as `scripts/pearls-drone.mjs` crops it.
- **Where each plays,** now the film is told for the visitor's business
  (round 11): in the website scene, a winery's plays Prosperando's site, then
  a quick cut to Pearls' (below); a practice's, the concept site; a
  contractor's, Pearls' from the crew side; any other business's, Pearls'
  site. The reel is every business's photo & video, credited to Pearls
  Farm Labor. Clinical Scribe is a practice's tool of their own. (Since
  round 10 the film opens on the way in, a door, not on Pearls' site, and
  the closer look is gone.)
- **The picker's dental card picture** (`choice-dental.jpg`, 640×400) is a
  frame of round 10's film: the practice's waiting room, its illustrated
  photo & video scene (gone since round 11) with the viewfinder hidden,
  taken in Chromium at 1440×900 with the camera's moves stilled, and scaled
  down.
- **Clinical Scribe's film cut has no prices** (round 10): `ClinicalFilm.tsx`
  gives its fee line ("A monthly payment plan was explained. Insurance may
  cover part of it, to be verified.") and its drafted message ("…on the
  payment plan we discussed…") their own words (`FILM_COPY` in
  `src/clinical/data.ts`); the Work card's loop keeps the originals. Its
  beats fall on the same frames as before.
- **The demo loops** (`demo-reviews-*`, `demo-booking-*`, `demo-desk-*`,
  `demo-entry-*`, `demo-tool-*`, per business, `-d` and `-m`, with SD cuts
  and posters) are the app screens under `/demos` (`/demos/reviews`,
  `/demos/booking`, `/demos/front-desk`, `/demos/one-entry`, `/demos/tool`,
  each with `?for=<business>`):
  noindexed, linked from nowhere, labelled Demo, their data made up. Each
  page draws its flow as a pure function of one time; with `?capture` it
  waits for `window.__demo.seek(t)`. `scripts/demos.mjs` (`npm run demos`;
  `npm run demos -- desk dental phone` for one) captures every frame in
  turn, as `pearls.mjs` does: desktop at 1440×900 at 1.5×, the phone at
  390×488 at 3×, 30 fps, into a near-lossless master encoded like the
  film's other loops; the poster is the last frame, the finished state.
  `BASE` picks the server (default `http://localhost:3001`, with Chromium
  told to reach `localhost` at `[::1]`: on this Mac, `localhost:3001` over
  IPv4 is another project's process, and the dev server doesn't hydrate a
  page opened as `http://[::1]:3001`, so the demo would never start);
  recapture from a server that compiles cleanly at the time. The film plays
  them in the reviews, booking, calls, behind-the-scenes and tool scenes
  (`DEMO_AT` in `components/elorro/film/scenes.tsx` has when things happen
  in each). The reviews demo's ratings are each the stars' sum over the
  count, and its replies to a practice's reviews never confirm anyone is a
  patient.
- **They play once,** so they have no seam. Each poster is the still the film
  shows until its video plays, and instead of it under reduced motion. The
  site's is its first frame; each demo's is its finished state.

### Prosperando (the winery's walkthrough)

The winery's website scene plays Jordan's twelve-second Prosperando scroll
(`public/m/film/prosperando-site-*`, after the dated site gives way) for
5.6 s, to its vineyards, then cuts to Pearls' site (`pearls-site-*`), whole;
the scene grows to fit both, the label and the address bar going from
Prosperando's credit to Pearls'. Its photo & video scene plays the reel, as
every business's does (round 11). The capture and Remotion recipe for the
scroll are in `4586345`, with the original capture manifest.

The phone encodes and poster open on the desktop crest and vineyard frame,
cropped to 4:5 (a centered 592 by 740 crop starting at y=60). In the phone
video, a 0.76-second dissolve starts at 2.97 seconds and leads into the
original phone site cut starting at 3.8 seconds from `f56921f`. The signup
frame holds through 12 seconds.

## Elora's voice (/film)

Since round 9 the film is told for the visitor's business, and Elora speaks
Ashan's approved script from eight takes: ElevenLabs, voice "Sia - Natural
Conversational Creator", model Eleven v4, stability 50, similarity 75, each
line its own paragraph. They're the source, kept in `voice/v2/` (Vercel
ignores `video/`):

| Take | Its lines, in order |
| --- | --- |
| `take-shared.mp3` | hook-1, hook-2, hook-3, hook-4, found-top, site-shared, office, closer (no longer used: found, so the cuts either side of it are right, and skipped), plan, close |
| `take-winery.mp3`, `take-dental.mp3`, `take-contractor.mp3`, `take-general.mp3` | that business's found, site, booking, calls, tools, photo (in `take-dental.mp3`, its old photo line, `dental-photo-old`, no longer used: found and skipped) |
| `take-extra.mp3` | ask-1 ("Real quick, is this something your business needs?"), ask-2 ("And this one?", no longer used since round 11.3: found and skipped; its old file is left in place), then round 10's send line (`send-old`, no longer used: found and skipped) |
| `take-r11.mp3` | reviews-shared, winery-reviews, dental-reviews, contractor-reviews, general-reviews, dental-photo (the new one), send (the new one) |
| `take-asks.mp3` | each chapter's own question: ask-reviews, ask-site, ask-booking, ask-calls, ask-office, ask-photo |

The words of every line, and the chunks its captions show, are in
`components/elorro/film/lines.ts`; the takes' lists above are its `TAKES`.

```
WHISPER_MODEL=/path/to/ggml-small.en.bin npm run voice-v2
```

`scripts/voice-v2.mjs` cuts each take into a file per line,
`public/m/film/voice/v2/<line>.m4a`:

1. whisper.cpp's `whisper-cli` (Homebrew's `whisper-cpp`, with its
   `ggml-small.en` model from huggingface.co/ggerganov/whisper.cpp) hears the
   take, a time for every word;
2. the words heard are matched to the script's (an edit distance, word by
   word), so each line is found by its words, not by counting pauses: some
   lines are two sentences, and a pause inside one can be as long as one
   between two;
3. whisper folds a pause into the words either side of it, so each end of a
   line is put at the quiet there (`silencedetect`, -40 dB, 0.08 s or more),
   and the line is cut at the middle of the quiet around it, keeping at most
   0.35 s of it either side;
4. each is encoded as the site's voice files always have been:
   `-map_metadata -1 -ac 1 -c:a aac_at -b:a 64k -movflags +faststart`
   (`aac_at` is macOS's AAC encoder; elsewhere, `-c:a aac`).

It then writes `components/elorro/film/voice-v2.ts`: each line's file length,
and where each of its caption chunks starts and ends in its file (a chunk
split falls in the pause at its comma or full stop). The film lays her lines
out from it (`script.ts`): a scene's first line starts a moment in, the next
half a second after the one before ends, a line's chunks keep the spacing
they have in its file, and a scene grows to fit her lines (she's never cut
off). The pictures that go with her words (the fix arriving as she says
"Now…") are timed from where her chunks start. A line missing from
`voice-v2.ts` is captioned only, on timing estimated from its words.

Any word whisper hears differently from the script is printed, line by line,
so a misread line can be re-recorded. It spells some names its own way
("Ashan" as "Ashawn" or "Ashton"), which isn't a misread.

After every chapter of the walkthrough she asks its own question, and the
question card shows the same words as its heading: ask-1 after getting found,
then ask-reviews, ask-site, ask-booking, ask-calls, ask-office (after behind
the scenes and a tool of their own) and ask-photo. send is her line on the
note, for a visitor who said yes to anything.

**The cuts** are listed in `design/review/cc-report.md` for each round: every
line, its file, its length, and the link and time where it plays.

## Clinical Scribe

The Clinical Scribe card (`ClinicalDesktop`, `ClinicalPhone`): one consult
going through the app, filmed in close-up — the recording with its timer and
level meter running, the summary filling in line by line, the referring
dentist's letter and then the family's take-home letter typing themselves
out, then the follow-up list with one case picked and its message drafting.
The finished message holds for four seconds, the loop's last beat, before it
fades back into frame 0.

The close-up is what makes it readable at card size. The app is laid out in
a narrow window (840 CSS px with its sidebar; 360 on the phone), where each
panel is one column, and a camera frames that column: on desktop about 2.4×
closer than a whole 1440px screen, so the app's 14px text shows at about
13px in a 584px card; on the phone the panel edge to edge. The camera eases
between panels on keyframes (`CAMERA` in `src/ClinicalLoop.tsx`) and finds
each panel by its `cam` mark (`data-cam`) in the laid-out page, so the
framing follows the layout if the wording changes. The demo banner is pinned
across the top of every frame.

It is a replica, not a recording. The real app runs against a live backend
that holds real patient data, so it is never run or captured for this. The
screens are rebuilt from its source instead: the same layout, Tailwind
classes (translated by `src/clinical/tw.tsx`), Geist and the app's Arial
chrome, labels and states, and the app's own demo banner, pinned so every
frame says the data is invented. Everything on screen comes from
`src/clinical/data.ts`, which holds only invented people (all `Zz-` names),
no dates of birth and no identifiers, and calls the practice "Demo
Orthodontics": the practice is not named, by agreement. Read that file
before changing any wording.

```
cd video
npm run render -- clinical          # both sizes
npm run render -- clinical phone    # one
```

What it writes into `public/m/work/` (the same sizes and encoding as
Numen's, under the script's caps of 2 MB HD and 900 KB SD):
`clinical-d.mp4`, `clinical-d-sd.mp4`, `clinical-m.mp4`,
`clinical-m-sd.mp4`, `clinical-d-poster.jpg`, `clinical-m-poster.jpg`,
`clinical-d-still.jpg` and `clinical-m-still.jpg` (the family letter, so
the case study, which shows the other three, never repeats an image), and
three 1920×1200 frames for the case study:
`clinical-summary.jpg`, `clinical-doctor-letter.jpg` and
`clinical-follow-ups.jpg`. No capture step: it needs only the fonts, which
`@remotion/google-fonts` fetches while rendering.

- `src/ClinicalLoop.tsx`: the beats (`T`), the camera (`CAMERA`), the page
  and tab transitions, and the frames the still and extras come from (keep
  `STILL_FRAME`/`EXTRA_FRAMES` in step with `scripts/render.mjs`).
- `src/clinical/screens.tsx`, `src/clinical/ui.tsx`: the app's screens and
  components, each noting the file in the app it mirrors.
