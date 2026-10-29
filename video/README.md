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
npm run sd           # SD cuts of Pearls' phone loop and Cubic Ship's
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
- `scripts/sd.mjs` makes `pearls-m-sd.mp4` and `cubic-d-sd.mp4` from the
  loops themselves: scaled to the SD size, and at most 900 KB and 60% of the
  loop. The Sticker Smith's loops are already lighter than that, so they have
  none.

The site picks between the cuts in `components/kozmoz/work-video.tsx`; the
files are listed on each project in `lib/kozmoz.ts`. One that's listed but not
in `public/m/work/` yet is left out when the site builds, named in the build
log, and its card shows the poster in its place (`lib/work-media.ts`).

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
