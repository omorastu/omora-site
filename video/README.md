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
npm run film-capture # captures for the film's loops (/film): Pearls' site, Pearls' Instagram
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
| `photo-reel-{d,m}` | The Photo & video demo (11 s): Jordan's drone footage of a crew in the rows, dissolving into Pearls' Instagram profile, scrolled from its header down its grid | `src/FilmLoops.tsx` (PhotoReel), from the captures and the drone footage |
| `clinical-film-{d,m}` | The Custom tools demo (15.5 s): Clinical Scribe's invented consult recorded, written up, its coaching ("Recommended next move"), then "Draft this message" and the follow-up letter drafting | `src/ClinicalFilm.tsx`, from the same replica as the Work card (which it leaves as it is) |

```
npm run film-capture          # both captures
npm run film-capture -- pearls
npm run film                  # every loop, both sizes
npm run film -- clinical phone
```

- **The captures** (`scripts/film-capture.mjs`) are full-page tiles, as for
  Numen, in `public/film-captures/`, with where things sit in
  `src/film-captures.json`. They aren't committed.
- **The Instagram capture needs a logged-in session.** Instagram puts a login
  wall over a profile seen logged out. The session is saved by hand from a
  visible browser window, logged in by a person, into
  `design/review/.auth/social.json`. That folder is never committed
  (`.gitignore`), and the script only hands the file to the browser.
- **Nothing from that account shows.** Before the shots, the capture hides
  everything pinned to the screen: Instagram's navigation (with the account's
  avatar), Messages, and the app banner. What's left is Pearls' own header and
  grid. If the profile shows a login wall or a check, the capture stops.
- **The drone footage** is the hero video on pearlsfarminc.com
  (`home-two-angle-graded-v6-16x9.mp4`). Save it as
  `public/film-captures/drone-src.mp4`. The reel plays the crew's stretch from
  5.4 s, cropped as `scripts/pearls-drone.mjs` crops it.
- **They play once,** so they have no seam. Each poster is the still the film
  shows until its video plays, and instead of it under reduced motion. The
  site's is its first frame; each demo's is its finished state.

## Elora's voice (/film)

`voice/elora-sia-take2.mp3` is Elora's voice in the film: ElevenLabs, voice
"Sia - Natural Conversational Creator", model Eleven v4, the whole script
(`components/elorro/film/script.ts`) read as one paragraph, in one take,
generated and picked by Ashan. It's the source, kept here (Vercel ignores
`video/`); the site plays `public/m/film/elora-sia.m4a`, made from it with
one phrase cut out (below):

```
ffmpeg -i voice/elora-sia-take2.mp3 -map_metadata -1 \
  -filter_complex "[0:a]atrim=end=30.30,asetpts=N/SR/TB[a];[0:a]atrim=start=31.98,asetpts=N/SR/TB[b];[a][b]concat=n=2:v=0:a=1[o]" \
  -map "[o]" -ac 1 -c:a aac_at -b:a 64k -movflags +faststart ../public/m/film/elora-sia.m4a
```

(`aac_at` is macOS's AAC encoder; elsewhere, `-c:a aac`.)

**The cut.** The website scene shows Pearls Farm Labor's site now, not
Prosperando's, so ", like this one for Prosperando" is cut from her line
"They build one that's clear and easy to use, like this one for
Prosperando." The take runs 30.30–31.98 s through it. Both ends sit in her
own silences: after "use" (quiet from 30.25 to 30.36 s) and after
"Prosperando." (quiet from 31.95 to 32.33 s). What's left of the two pauses
adds up to 0.42 s before "Booking by text…", the pause the take had there.
The file is 1.68 s shorter, so every cue after the cut is 1.68 s earlier
than in the take. The website scene keeps its length, so she waits those
1.68 s while Pearls' site plays, and everything after it starts when it did.
To change the cut, find a new pair of quiet points the same way (step 1),
re-encode, and move the later cues by the difference.

How the timings in `script.ts` were made, to redo them for a new take:

1. Find the quiet between her lines:
   `ffmpeg -i <file> -af silencedetect=noise=-40dB:d=0.25 -f null -`
   prints each pause's start (where she finishes a line) and end (where the
   next starts). Match them to the lines in order. A pause inside a line can
   be as long as one between lines, and two lines read as one sentence may
   show none, so where it's unclear, look closer (`d=0.12`, `-35dB`, or the
   loudness every 10 ms) and check a cut of the file by ear or with a local
   speech-to-text (whisper.cpp's `whisper-cli`, with its `ggml-small.en`
   model; `-ml 1` gives each word's time). For this take, three boundaries
   needed that: "search, / and into", "all three, / and build" and "two of
   them, / and looked after"; and the cut above.
2. Each scene's `cue`: where its first line starts in the site's file. Each
   line's `at` is where it starts less its scene's cue, so 0 for a scene's
   first line (the first scene's is `at` seconds in, after the logo; a demo's,
   a moment in, as it comes out of the dark). Its `end`, where she finishes
   it, the same way: her glow follows it. A line with no voice yet is
   `silent`: captioned only.
3. Each scene's `duration` is its length in the film. Within a part of the
   film, it is at least from its first line to the next scene's, as the file
   has them; the last scene of a part is at least as long as her lines in it
   (`timeline()` makes it so). Any longer and her voice waits, in the quiet
   between her lines, while the pictures play on. As cut: the opening (1 s,
   for her glide to the corner) and the website (1.68 s, where the phrase
   was). The demos and the plan run on past her lines too. The film jumps
   from the choice to each demo and back, and on to the plan; her voice picks
   up at each from the right place in the file.

**New takes, a part or a line at a time.** Every scene, every part of the film
(`SEGMENTS`) and every single line can have a file of its own (`voice`, with a
`cue` where it starts in that file). The nearest wins: line, scene, part,
then the long take. So a re-recorded line drops in without re-cutting the
take: save its AAC copy in `public/m/film/voice/`, name it on the line, and
re-time its `end`. The film moves her from file to file in the quiet between
lines, and loads the other files early. The lines that need one, and how to
record them, are listed in `design/review/elora-new-lines.md`.

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

### Prosperando owner path

The winery path plays the twelve-second Prosperando scroll from commit
`4586345` and then the existing portrait bottle footage at
`public/m/work/prosperando-m.mp4`. The scroll opens with portfolio artwork and
holds on the vineyard and signup sections. The four checked-in encodes and their
posters live at `public/m/film/prosperando-site-*`. The capture and Remotion
recipe are in `4586345`, along with the original capture manifest.

`public/m/film/voice/prosperando.m4a` is 27.41–32.14 seconds of
`voice/elora-sia-take2.mp3`, cued at 0.22 seconds. For the bottle shot,
`wine-photo.m4a` is 57.14–59.95 seconds of `public/m/film/elora-sia.m4a`.
The full walkthrough and standalone Website example use the Pearls scroll.
