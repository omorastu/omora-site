// Full-page captures for the film's loops (/film): Pearls Farm Labor's site,
// Pearls' Instagram profile, and the practice concept site.
//
//   npm run film-capture
//   npm run film-capture -- pearls        one of them (pearls | instagram | practice)
//
// Each page is shot at 1440 wide (desktop, 1.5×) and 390 wide (phone, 3×),
// as overlapping horizontal tiles in public/film-captures/, like
// scripts/capture.mjs does for Numen; where things sit goes to
// src/film-captures.json. src/FilmLoops.tsx scrolls through them.
//
// Pearls: the homepage, walked to the bottom first so every on-scroll reveal
// has happened, and the Request a crew page it ends on.
//
// Practice: Brightline Orthodontics, the made-up practice's concept site this
// app serves at /demos/practice (components/elorro/demos/practice.tsx), from
// the local dev server (PRACTICE_BASE, default http://[::1]:3001): the whole
// page, down to its Book a consult form.
//
// Instagram: instagram.com/pearlsfarmlabor seen logged in, with a session
// saved by hand into design/review/.auth/social.json (never committed: see
// .gitignore; this script only hands the file to the browser and never reads
// or prints what's in it). Everything pinned to the screen is hidden before
// the shots: Instagram's navigation, the Messages button, the app banner.
// Those are the only parts that belong to the account logged in; what's left
// is the profile's own header and grid. If the profile shows a login wall or
// a check, the capture stops.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "film-captures");
const MANIFEST = path.join(ROOT, "src", "film-captures.json");
const SESSION = path.resolve(ROOT, "..", "design", "review", ".auth", "social.json");

const SIZES = {
  desktop: { width: 1440, height: 900, dpr: 1.5, mobile: false },
  phone: { width: 390, height: 844, dpr: 3, mobile: true },
};
const TILE = { desktop: 1800, phone: 1300 };
const OVERLAP = 4;
const PHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

/** Each page: where it is, whether it needs the saved session, and the sections to find (by heading text). */
const PAGES = {
  pearls: {
    url: "https://www.pearlsfarminc.com",
    anchors: { close: /Let.s talk about your block/i, footer: "footer" },
  },
  pearlsRequest: {
    url: "https://www.pearlsfarminc.com/request-a-crew",
    anchors: {},
  },
  instagram: {
    url: "https://www.instagram.com/pearlsfarmlabor/",
    session: true,
    anchors: { grid: "grid" },
  },
  practice: {
    url: `${process.env.PRACTICE_BASE ?? "http://[::1]:3001"}/demos/practice`,
    anchors: { book: /^Book a consult$/i, form: ".bl-form", footer: "footer" },
  },
};
const GROUPS = { pearls: ["pearls", "pearlsRequest"], instagram: ["instagram"], practice: ["practice"] };

// Over the page in a screenshot: cookie banners, dialogs, chat launchers (and
// a dev server's own badge, for the pages this app serves).
const HIDE = `
  [role="dialog"], [aria-modal="true"], nextjs-portal,
  [class*="cookie" i], [id*="cookie" i], [class*="consent" i], [id*="consent" i] {
    display: none !important;
  }`;

const only = process.argv[2];
if (only && !GROUPS[only]) throw new Error(`No "${only}". Try: ${Object.keys(GROUPS).join(", ")}`);
const names = only ? GROUPS[only] : Object.values(GROUPS).flat();

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (names.some((n) => f.includes(`-${n}-`))) fs.rmSync(path.join(OUT, f));
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : { overlap: OVERLAP, sizes: {} };

const browser = await chromium.launch({ args: ["--mute-audio"] });
for (const [size, vp] of Object.entries(SIZES)) {
  manifest.sizes[size] ??= { width: vp.width, dpr: vp.dpr, tile: TILE[size], pages: {} };
  for (const name of names) {
    const page = PAGES[name];
    if (page.session && !fs.existsSync(SESSION)) throw new Error(`${name} needs a saved session at ${SESSION}`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      userAgent: vp.mobile ? PHONE_UA : undefined,
      locale: "en-US",
      reducedMotion: "no-preference",
      ...(page.session ? { storageState: SESSION } : {}),
    });
    const p = await ctx.newPage();
    await p.goto(page.url, { waitUntil: "load", timeout: 90_000 });
    await p.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    if (page.session) {
      await p.waitForTimeout(4000);
      const blocked = await p.evaluate(() => ({
        wall: [...document.querySelectorAll('[role="dialog"]')].some((d) => /log in|sign up/i.test(d.innerText)),
        check: /captcha|challenge|suspicious|confirm it.s you/i.test(document.body.innerText),
        login: /accounts\/login/.test(location.href),
      }));
      if (blocked.wall || blocked.check || blocked.login) throw new Error(`${name}: the profile is behind a login wall or a check (${JSON.stringify(blocked)}). Stopping.`);
    } else {
      await p.addStyleTag({ content: HIDE });
    }

    // Walk down the page so lazy images, more posts and on-scroll reveals load, then back up.
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 350));
      }
      scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((r) => setTimeout(r, 1500));
      scrollTo(0, 0);
    });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() =>
      Promise.race([
        Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))),
        new Promise((r) => setTimeout(r, 10_000)),
      ])
    );
    await p.waitForTimeout(2500);

    // Nothing that belongs to the account logged in: everything pinned to the screen goes.
    if (page.session) {
      await p.evaluate(() => {
        for (const el of document.querySelectorAll("body *")) {
          const pos = getComputedStyle(el).position;
          if (pos === "fixed" || pos === "sticky") el.style.setProperty("visibility", "hidden", "important");
        }
      });
      await p.waitForTimeout(300);
    }

    const geo = await p.evaluate((anchors) => {
      const top = (e) => Math.round(e.getBoundingClientRect().top + scrollY);
      const header = document.querySelector("header");
      const sticky = !!header && ["sticky", "fixed"].includes(getComputedStyle(header).position) && getComputedStyle(header).visibility !== "hidden";
      const out = {};
      for (const [key, a] of Object.entries(JSON.parse(anchors))) {
        if (a === "footer") {
          const f = document.querySelector("footer");
          if (f) out[key] = top(f);
        } else if (a === "grid") {
          const posts = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')];
          if (posts[0]) out[key] = top(posts[0]);
          if (posts.length) out.gridEnd = Math.max(...posts.map((e) => Math.round(e.getBoundingClientRect().bottom + scrollY)));
          out.posts = posts.length;
        } else if (typeof a === "string") {
          // A selector: where that element starts.
          const e = document.querySelector(a);
          if (e) out[key] = top(e);
        } else {
          const re = new RegExp(a.source, a.flags);
          const h = [...document.querySelectorAll("h1, h2, h3")].find((e) => re.test(e.textContent.trim()));
          if (h) out[key] = top(h.closest("section") ?? h);
        }
      }
      // A sticky header that doesn't start at the very top (a notice bar above
      // it) is drawn from where it sits; Pearls' is at 0, and leaves it out.
      const headerTop = sticky ? Math.round(header.getBoundingClientRect().top + scrollY) : 0;
      return {
        height: document.documentElement.scrollHeight,
        header: sticky ? Math.round(header.getBoundingClientRect().height) : 0,
        stickyHeader: sticky,
        ...(headerTop ? { headerTop } : {}),
        anchors: out,
      };
    }, JSON.stringify(page.anchors, (_, v) => (v instanceof RegExp ? { source: v.source, flags: v.flags } : v)));

    const tiles = [];
    for (let y = 0, i = 0; y < geo.height; y += TILE[size], i++) {
      const h = Math.min(TILE[size] + OVERLAP, geo.height - y);
      const file = `${size}-${name}-${String(i).padStart(2, "0")}.png`;
      await p.screenshot({ path: path.join(OUT, file), type: "png", fullPage: true, clip: { x: 0, y, width: vp.width, height: h } });
      tiles.push({ file, y, h });
    }
    manifest.sizes[size].pages[name] = { url: page.url, capturedAt: new Date().toISOString(), ...geo, tiles };
    console.log(`${size} ${name}: ${geo.height}px, ${tiles.length} tiles, header ${geo.header}px${geo.stickyHeader ? " (sticky)" : ""}, ${JSON.stringify(geo.anchors)}`);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log("wrote src/film-captures.json");
