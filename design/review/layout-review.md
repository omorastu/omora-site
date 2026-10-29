# Layout review

Covers this round's follow-up fixes:
- the Clinical Scribe card re-filmed as close-ups;
- the portrait plates in the "us" section;
- /services on the grid;
- the reduced-motion repeat on the case study;
- the phone swipe row on the homepage;
- Pearls re-made at 1280×800.

Screenshots are in `layout-review.pdf`: the homepage, /services, /work and /work/clinical-scribe at 1440 and 390, plus a cover page of measured checks. All of it was captured from the dev server on port 3100, with reduced motion on so the pages are settled.

## Page heights

"Before" is where each page stood at the start of this round (the last review's numbers; /services measured from the previous commit).

| Page | Window | Before | After |
| --- | --- | --- | --- |
| Homepage | Desktop 1440×900 | 4,425 | 4,425 |
| Homepage | Phone 390×844 | 6,824 | 4,781 |
| /services | Desktop 1440×900 | 3,765 | 2,393 |
| /services | Phone 390×844 | 5,019 | 3,418 |
| /work | Desktop 1440×900 | 2,190 | 2,190 |
| /work | Phone 390×844 | 4,478 | 4,478 |
| /work/clinical-scribe | Desktop 1440×900 | 5,716 | 5,716 |
| /work/clinical-scribe | Phone 390×844 | 6,125 | 6,125 |

- **Homepage on the phone:** the four Work cards are one swipe row now instead of a stack, which takes about 2,000px off. Desktop is unchanged.
- **/services:** about a third shorter on both, because the 6.5rem centred titles and seam spacing are gone.
- **/work and the case study:** the same heights. Their cards and stills kept their sizes; only what's in them changed.

## Clinical Scribe, filmed in close-up

It's still a replica, not a recording, for the same reasons as before: the real app reaches production even in its synthetic mode. Nothing in `~/Projects/omora-clinical` was run; its source was read for layout only.

**Why the card was an empty white box.** The old video showed the whole 1440px app screen, so in a 584px card the app's 14px text was about 6px high.

**What changed.** The app is now laid out in a narrow window: 840 CSS px with its sidebar on desktop, 360 on the phone. There each panel is a single column, and a camera frames that column.
- **Desktop:** about 2.4× closer than the whole screen.
- **Phone:** the panel edge to edge.
- **Moves:** the camera eases between panels and follows each draft down as it arrives.

**Scenes, in order (21 s):**
1. The recording, with the timer running and the level meter moving.
2. The summary filling in line by line.
3. The doctor letter typing itself out.
4. The patient take-home letter typing itself out.
5. The follow-up list, with Zz-Maya's case picked and its message drafting over the list.

**Text size on the site.** At the card's display size the app's 14px body text shows at about:
- 13.5px in a 584px desktop card (1440 window);
- 18px at 1920;
- 13–14px in a phone card.

**Same as before:**
- **Data:** the same Zz- demo data from one file.
- **Banner:** the app's demo banner, pinned across the top of every frame.
- **Caps:** the same as Numen's.

| File | Size | Limit | CRF |
| --- | --- | --- | --- |
| `clinical-d.mp4` | 1.98 MB | 2 MB | 25.5 |
| `clinical-d-sd.mp4` | 880 KB | 900 KB | 27 |
| `clinical-m.mp4` | 1.99 MB | 2 MB | 24.5 |
| `clinical-m-sd.mp4` | 866 KB | 900 KB | 29 |

**Stills.** The posters and stills are re-exported from the new render.
- **Case study:** the summary, the doctor letter and the follow-up draft.
- **Reduced-motion still:** the family letter. It's a frame the case study doesn't otherwise show, so with reduced motion on nothing repeats there (checked at both sizes, see the PDF's cover).

**How the frames were checked:**
- **The data file:** every word on screen comes from `video/src/clinical/data.ts`. This round only removed text from it, and it was re-read: only Zz- names, no dates of birth and no identifiers.
- **The renders:** around 60 frames across both sizes were looked at during the render checks, including every poster and still.

**Changes from the old flow:**
- **The processing checklist is gone,** so the five scenes you asked for get the time.
- **On a picked follow-up case,** the app opens a 26rem side panel. At this window width that would leave the list a sliver, so the drafted message opens over the list instead, using the app's own dialog.

## Pearls, re-made at 1280×800

`pearls-d.mp4` was 864×540, the size of an SD cut. There was no source file for it, so it was re-made from the live pearlsfarminc.com homepage (`video/scripts/pearls.mjs`).
- **Capture:** the page was shot at 1440×900 and 1.5×.
- **Frames:** each of the hero video's 534 frames was shown in turn in the video's place and the page captured.
- **Encoding:** like the other loops, from a near-lossless master.

| File | Size | Limit | CRF |
| --- | --- | --- | --- |
| `pearls-d.mp4` | 1.86 MB | 2 MB | 36 |
| `pearls-d-sd.mp4` | 835 KB | 900 KB | 36 |

- **Quality:** 18 seconds of detailed aerial footage at 1280×800 needs CRF 36 to stay under 2 MB, much higher than the screen recordings need. At card size it looks as good as the old 864×540 file, and the headline and navigation over it are noticeably sharper.
- **Poster:** new, taken from the live site, whose buttons have moved since the old capture.
- **Phone loop:** `pearls-m.mp4` is unchanged.

## Video files still missing

Unchanged from the last round. The build log names each one, and its card shows its poster.
- **Cubic Ship:** `cubic-m.mp4`, `cubic-m-sd.mp4`.
- **Galvan Dental Care:** `galvan-d.mp4`, `galvan-d-sd.mp4`, `galvan-m.mp4`, `galvan-m-sd.mp4`.

## Checks

- **Lint, typecheck and build** all pass (`npx eslint .`, `npx tsc --noEmit`, `npm run build`).
- **Text on lines:** none crosses a rule or border on any of the four pages at either size.
- **Centred text:** none below the hero.
- **The seam:** only in the homepage hero. None on /services, /work or the case study.
- **Homepage Work on the phone:** one row with scroll snap, each card 85% of the screen, and "See all work" under it. Desktop keeps the 2-across grid, and /work stays a stacked list on the phone.
- **Portraits:** each frame is a plate a shade under the paper with a hairline border, and the letter is in the person's ink. Dropping a test image in at `public/m/us/ashan.jpg` showed it in Ashan's frame in place of the letter, with the name on a paper ground. The test file was removed afterwards.

## Not done, or worth a look

- **Phone zoom factor:** the phone video doesn't zoom 2–2.5×. It's already laid out at phone width, so 2× would cut every line in half. The camera fills the frame with the panel instead, which gives the readable sizes above.
- **Portrait photos need a rebuild:** they're picked up when the site builds. After adding `ashan.jpg` and `jordan.jpg` to `public/m/us/`, rebuild and deploy. They should be 4:5, at least 800×1000.
- **/services lost its A+J and J tags.** They sat on the seam, so they went with it. The credit lines say who does what, as on the homepage.
- **Pearls phone loop:** still the older 544×680 cut.
- **Stale images on a running dev server:** it keeps its own optimized copies of images for hours. After replacing an image under an existing name, clear `.next/dev/cache/images` or restart it. Production builds aren't affected. This round's review clears it before capturing.
