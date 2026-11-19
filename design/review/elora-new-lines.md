# Elora: lines to record as standalone sentences

The film plays her voice from one long take (`video/voice/elora-sia-take2.mp3`). The film now cuts it into parts: the first minute, a demo at a time, then the plan and the close. A few lines start or stop mid-sentence where it cuts, so they sound clipped: they run on, or they begin with "And". A few others have never been recorded.

The film can now take a separate file per part, or per line, so new takes drop in without re-cutting the long one. Until they exist, it keeps playing the current take.

## The lines

Record each as its own sentence that ends naturally: a full stop and a falling voice, not a pause before more.

| # | Where it plays | What she says now | Record this | File to save |
|---|---|---|---|---|
| 1 | 03 · The website, her second line (about 0:27) | "They build one that's clear and easy to use", cut from "…easy to use, like this one for Prosperando." Her voice is still rising on "use". | **They build one that's clear and easy to use.** | `site-2.m4a` |
| 2 | 06 · Behind the scenes, her last line before the choice (about 0:55) | "They make one entry fill in all three", where the take runs on: "…all three, and build tools…" | **They make one entry fill in all three.** | `office-2.m4a` |
| 3 | The choice, its heading | Nothing yet. It's on screen only. | **Pick one to see it in action.** | `choice.m4a` |
| 4 | Demo · Custom tools | "and build tools around how you work, like one that writes up each consult": the second half of line 2's sentence. | **They build tools around how you work, like one that writes up each consult.** | `tools.m4a` |
| 5 | Demo · Photo & video | "And photos and video that show what you do.", a fragment from the take's list. | **They shoot photos and video that show what you do.** | `photo.m4a` |
| 6 | Demo · Front desk, first caption | Nothing yet. It's a caption only. | **A call comes in while the desk is busy, and it's answered for them.** | `frontdesk-1.m4a` |
| 7 | Demo · Front desk, second caption | Nothing yet. | **As she talks, what she wants is picked out.** | `frontdesk-2.m4a` |
| 8 | Demo · Front desk, third caption | Nothing yet. | **A slot is found and booked, and her record fills in.** | `frontdesk-3.m4a` |
| 9 | Demo · Front desk, fourth caption | Nothing yet. | **The confirmation goes out by text. Nobody had to stop.** | `frontdesk-4.m4a` |

Lines 4 and 5 are suggested wordings. They keep the take's words but stand on their own: "They build" instead of "and build", and "They shoot" instead of "And". Change them if you'd rather.

**Optional: the demos show more than their lines now say.**
- The Custom tools demo now shows the coaching and the follow-up letter. A longer line 4 would cover them: "They build tools around how you work, like one that writes up each consult, coaches the next step and drafts the follow-up."
- The Photo & video demo ends on Pearls' Instagram posts. Line 5 could add "…and turn them into posts people see."

**Every other line is fine as it is.** I checked each place the film cuts the take into parts. Apart from lines 1, 2, 4 and 5, every cut falls in a pause between sentences, so nothing else needs re-recording.

## Recording them

- **Voice:** the same as the take. ElevenLabs, voice "Sia - Natural Conversational Creator", model Eleven v4.
- **One line per file,** each in a generation of its own, so each one starts and ends as a whole sentence.
- **About 0.3 s of quiet** before and after each line. Don't trim to the word.
- **Keep the MP3s** in `video/voice/`, as the take is kept. The site plays an AAC copy of each, made like the take's (`video/README.md`, "Elora's voice"), saved to `public/m/film/voice/` under the names above:

  ```
  ffmpeg -i video/voice/<line>.mp3 -map_metadata -1 -ac 1 -c:a aac_at -b:a 64k \
    -movflags +faststart public/m/film/voice/<line>.m4a
  ```

## How they drop in

In `components/elorro/film/script.ts`, a line with a file of its own gets a `voice` (its file) and a `cue` (where the line starts in it), and its `end` is re-timed to the new length:

```ts
{ text: "They make one entry fill in all three.", at: 4.12, end: 6.3, voice: "/m/film/voice/office-2.m4a", cue: 0.3 },
```

- A whole part can take one file instead, as `voice` on that part in `SEGMENTS`. Its scenes then take cues in that file.
- The film moves her from file to file in the quiet between lines, and loads the next file early. Nothing else changes.
- If a new line runs longer than the old one, its scene grows to fit (`timeline()`).

Two lines need a little more than a file:

- **The choice line (3).** The film stops on the choice one second in. A spoken line there has to keep playing while the film waits, so it will need a small change to how the film holds there.
- **The front desk lines (6–9).** They're captions now. Each needs `silent` taken off and a file added.

Send me the files and I'll time them in, both of those included.

## Owner paths follow-up

The winery website example uses Sia's original Prosperando line. The clip
`/m/film/voice/prosperando.m4a` is 27.41–32.14 seconds of
`video/voice/elora-sia-take2.mp3`, cued 0.22 seconds into the clip. The full
walkthrough's Pearls website scene uses Ashan's cut of the original track.

These are draft reads for Ashan to review. The front desk illustration is
captioned with optional effects. The local service path is disabled in the
picker while its lines are pending.

| Where it plays | What she says now | Record this | File to save |
|---|---|---|---|
| Front desk opening | Caption only | **Busy with a patient? Here’s how a front desk could handle an incoming call.** | `frontdesk-1.m4a` |
| Local business opening | Path hidden | **Customers have questions before they come in. Cubic Ship shows them where to start.** | `local-1.m4a` |
| Local business close | Path hidden | **Start online, then finish in person.** | `local-2.m4a` |

The dental path starts 0.312 seconds into the existing calls scene. The short
cut drops “Or” while retaining “Say,” checked against Whisper word times and
the waveform. The full walkthrough keeps the original read.

**Optional wording for JP and Ashan to review.** In the search scene, consider
“They help customers find you when they search,” and “They also make the
business easier for AI tools to understand and reference.” The film retains
Ashan’s existing narration and wording, including the five plan items.

In the original take, have Ashan or JP listen to the pronunciation of “Ashan”
near the start. The transcription alone did not establish an error.

Proposed credit wording for the founders to confirm: Pearls Farm Labor site
and film by Jordan. Clinical Scribe built by Ashan, shown in recreated screens
with fictional data. The winery path credits Prosperando for website,
photography and video, with the bottle footage showing the photo and video work.
