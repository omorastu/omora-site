import path from "node:path";
import type { ProjectMedia } from "@/lib/kozmoz";
import { onDisk } from "@/lib/public-files";

/**
 * What of a project's media is actually in public/, checked on the server as
 * the page is built. A loop cut or a reduced-motion still that lib/kozmoz.ts
 * lists but that isn't there yet is left out, so the card shows its still in
 * that place instead of asking for a file that isn't there; without both
 * stills the card has no screen at all. The build log names what's missing.
 */

/** A project's media with anything missing left out, and the files that are. */
export function mediaOnDisk(name: string, m?: ProjectMedia): { media?: ProjectMedia; missing: string[] } {
  if (!m) return { missing: [] };

  const listed = [m.desktop.src, m.mobile.src, ...Object.values(m.loop ?? {})];
  if (m.still) listed.push(m.still.desktop.src, m.still.mobile.src);
  const missing = listed.filter((src) => !onDisk(src));
  if (missing.length === 0) return { media: m, missing };
  report(name, missing);
  if (!onDisk(m.desktop.src) || !onDisk(m.mobile.src)) return { missing };

  const loop = Object.fromEntries(Object.entries(m.loop ?? {}).filter(([, src]) => onDisk(src)));
  const still = m.still && onDisk(m.still.desktop.src) && onDisk(m.still.mobile.src) ? m.still : undefined;
  return {
    media: { ...m, still, loop: Object.keys(loop).length ? loop : undefined },
    missing,
  };
}

/* Each project's missing files go to the log once per server, not on every render. */
const reported = new Set<string>();
function report(name: string, missing: string[]) {
  if (reported.has(name)) return;
  reported.add(name);
  console.warn(
    `Work: ${name} has no ${missing.map((src) => path.basename(src)).join(", ")} in public/ yet; its card shows what it has.`
  );
}
