/**
 * The home page held still while the intro and the hero's entrance play,
 * so that everyone who gets them sees them through, from the top of the
 * page: nothing scrolls it (a wheel, a finger, the keys, or a #link or a
 * focused element moving it from inside), and nothing on it can be pressed,
 * until it's let go. The pointer still moves (the mouse bends the intro's
 * logo, the cursor's trail follows it), and two fingers can still zoom.
 *
 * The boot script in components/intro/intro.tsx starts it during the first
 * paint, with html[data-kz-hold] (kozmoz.css: the page can't scroll), so
 * nothing moves before the page's script is in; hold() takes it over from
 * there (components/kozmoz/hands.tsx), or starts it on a move to the home
 * page from within the site. Whatever stalls, it lets go by HOLD_MAX.
 */

export const HOLD_ATTR = "data-kz-hold";
/** At the latest, from the first paint, the page is let go and the hero shown finished. */
export const HOLD_MAX = 12000;

/** Keys that scroll the page. */
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]);

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Lets go of a hold the boot script started, when there's nothing to hold for. */
export const free = () => document.documentElement.removeAttribute(HOLD_ATTR);

/** The browser's last move back or forward, and where to: a page come back to is left where it was. */
let traversed: { at: number; href: string } | null = null;
if (typeof window !== "undefined") {
  addEventListener("popstate", () => (traversed = { at: performance.now(), href: location.href }), true);
}
/** Just come back to this page with the back or forward button: the browser is putting it where it was. */
export const cameBack = () => !!traversed && traversed.href === location.href && performance.now() - traversed.at < 3000;

/**
 * Holds the page at its top until the returned function lets it go (at
 * its top, unless `atTop` is false: the page is going). At `until` (a
 * performance.now() time), or on the first press, key or scroll past it
 * should its timer never come, `late` runs: it should show the hero
 * finished and let go.
 */
export function hold(until: number, late: () => void): (atTop?: boolean) => void {
  const root = document.documentElement;
  let held = true;
  const due = () => {
    if (performance.now() < until) return false;
    late();
    return true;
  };
  const top = () => {
    if (scrollX || scrollY) scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  const onScroll = () => {
    if (!due()) top();
  };
  const onWheel = (e: WheelEvent) => {
    if (!due()) e.preventDefault();
  };
  // One finger only: a pinch still zooms.
  const onTouch = (e: TouchEvent) => {
    if (e.touches.length < 2 && !due()) e.preventDefault();
  };
  const onKey = (e: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(e.key) || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
    if (!due()) e.preventDefault();
  };
  // Before anything on the page hears it: no link, button or menu opens.
  const onClick = (e: MouseEvent) => {
    if (due()) return;
    e.preventDefault();
    e.stopPropagation();
  };
  const active = { capture: true, passive: false };

  root.setAttribute(HOLD_ATTR, "");
  top();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("wheel", onWheel, active);
  addEventListener("touchmove", onTouch, active);
  addEventListener("keydown", onKey, true);
  addEventListener("click", onClick, true);
  const timer = window.setTimeout(late, until - performance.now());

  return (atTop = true) => {
    if (!held) return;
    held = false;
    // Even if something moved it since the last scroll was put back.
    if (atTop) top();
    clearTimeout(timer);
    removeEventListener("scroll", onScroll);
    removeEventListener("wheel", onWheel, active);
    removeEventListener("touchmove", onTouch, active);
    removeEventListener("keydown", onKey, true);
    removeEventListener("click", onClick, true);
    free();
  };
}
