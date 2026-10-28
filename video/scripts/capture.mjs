// Full-page captures of numenventures.co for the live-card loops.
//
//   npm run capture
//
// Each page is shot at 1440 wide (desktop, 1.5×) and 390 wide (phone, 3×) once
// its fonts and images have loaded and any popup is hidden, and saved as
// overlapping horizontal tiles in public/captures/, so the composition never
// has to hold one enormous image. Where the sections it pauses on start, and
// whether the page's header sticks, go to src/captures.json.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "captures");
const SITE = "https://www.numenventures.co";

const SIZES = {
  // 1.5× is 2160px across, well over the 1280px video. The phone needs more:
  // 1.5× of 390 is 585px, narrower than its 720px video, so it stays at 3×.
  desktop: { width: 1440, height: 900, dpr: 1.5, mobile: false },
  phone: { width: 390, height: 844, dpr: 3, mobile: true },
};

// The sections the loop pauses on, found by their heading text.
const PAGES = {
  home: {
    url: SITE,
    anchors: {
      whatWeDo: { section: /^$/, after: "stats" }, // the pale cards section straight after the hero's stats
      partners: { heading: /We have worked with these organizations/i },
      pitchScore: { heading: /Ten years of evaluating startup decks/i },
    },
  },
  pitch: {
    url: `${SITE}/pitch-score`,
    anchors: {
      howItWorks: { heading: /^How it works$/i },
    },
  },
};

// Tiles are this many CSS px tall (chosen so each starts on a whole capture
// pixel: 1800 × 1.5 = 2700; 1300 × 3 = 3900), and overlap by OVERLAP so no
// seam can show where two meet. PNG, so small text keeps its edges.
const TILE = { desktop: 1800, phone: 1300 };
const OVERLAP = 4;

const PHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

// Anything that would sit over the page in a screenshot: cookie and consent
// banners, dialogs, chat launchers.
const HIDE = `
  [role="dialog"], [aria-modal="true"],
  [class*="cookie" i], [id*="cookie" i], [class*="consent" i], [id*="consent" i],
  [id*="intercom" i], [class*="crisp" i], iframe[src*="chat" i], iframe[title*="chat" i] {
    display: none !important;
  }`;

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f));

const browser = await chromium.launch();
const manifest = { site: SITE, capturedAt: new Date().toISOString(), overlap: OVERLAP, sizes: {} };

for (const [size, vp] of Object.entries(SIZES)) {
  manifest.sizes[size] = { width: vp.width, dpr: vp.dpr, tile: TILE[size], pages: {} };
  for (const [name, page] of Object.entries(PAGES)) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      userAgent: vp.mobile ? PHONE_UA : undefined,
      locale: "en-US",
      reducedMotion: "no-preference",
    });
    const p = await ctx.newPage();
    await p.goto(page.url, { waitUntil: "load", timeout: 90_000 });
    await p.addStyleTag({ content: HIDE });
    await p.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

    // Walk down the page so lazy images and on-scroll reveals happen, then back up.
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 160));
      }
      scrollTo(0, 0);
    });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() =>
      Promise.race([
        Promise.all(
          [...document.images].map((i) =>
            i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })
          )
        ),
        new Promise((r) => setTimeout(r, 10_000)),
      ])
    );
    await p.waitForTimeout(2500); // counters, glows and fades settle

    const geo = await p.evaluate((anchors) => {
      const top = (e) => Math.round(e.getBoundingClientRect().top + scrollY);
      const header = document.querySelector("header");
      const sticky = header && ["sticky", "fixed"].includes(getComputedStyle(header).position);
      const sections = [...document.querySelectorAll("section")];
      const out = {};
      for (const [key, a] of Object.entries(JSON.parse(anchors))) {
        if (a.heading) {
          const re = new RegExp(a.heading.source, a.heading.flags);
          const h = [...document.querySelectorAll("h1, h2, h3")].find((e) => re.test(e.textContent.trim()));
          if (h) out[key] = top(h.closest("section") ?? h);
        } else if (a.after === "stats") {
          // The hero is the first section, its stats the second; the cards come next.
          if (sections[2]) out[key] = top(sections[2]);
        }
      }
      return {
        height: document.documentElement.scrollHeight,
        header: header ? Math.round(header.getBoundingClientRect().height) : 0,
        stickyHeader: !!sticky,
        anchors: out,
      };
    }, JSON.stringify(page.anchors, (_, v) => (v instanceof RegExp ? { source: v.source, flags: v.flags } : v)));

    const tiles = [];
    for (let y = 0, i = 0; y < geo.height; y += TILE[size], i++) {
      const h = Math.min(TILE[size] + OVERLAP, geo.height - y);
      const file = `${size}-${name}-${String(i).padStart(2, "0")}.png`;
      await p.screenshot({
        path: path.join(OUT, file),
        type: "png",
        fullPage: true,
        clip: { x: 0, y, width: vp.width, height: h },
      });
      tiles.push({ file, y, h });
    }
    manifest.sizes[size].pages[name] = { url: page.url, ...geo, tiles };
    console.log(`${size} ${name}: ${geo.height}px, ${tiles.length} tiles, header ${geo.header}px${geo.stickyHeader ? " (sticky)" : ""}, anchors ${JSON.stringify(geo.anchors)}`);
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(ROOT, "src", "captures.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("wrote src/captures.json");
