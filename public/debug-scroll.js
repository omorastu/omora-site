/*
 * The home page's scroll, in a box in the corner: loaded only with
 * ?debug=scroll in the address (components/kozmoz/scroll-debug.tsx), ahead
 * of the page's own script, so that it sees every touch listener the page
 * adds. Nothing here runs, or exists on the page, without it.
 *
 * It shows: the page's scroll; whether the page is held (data-kz-hold);
 * the overflow, position, touch-action and overscroll-behavior of <html>
 * and <body>, with any inline style; how many listeners that could stop a
 * touch from scrolling are attached (non-passive touchstart / touchmove);
 * the Work section's stage; and the last touch: where it started and ended,
 * whether its moves were cancelled and by which listener, and how far the
 * page moved.
 */
(function () {
  "use strict";
  var t0 = performance.now();
  var html = document.documentElement;
  var takenBefore = !!(window.__kzIntro && window.__kzIntro.taken);

  /* ── The listeners that could stop a touch from scrolling ─────────── */

  var add = EventTarget.prototype.addEventListener;
  var remove = EventTarget.prototype.removeEventListener;
  var live = new Map();
  var wraps = new WeakMap();
  var next = 0;
  var TOUCH = /^(touchstart|touchmove|touchend|touchcancel|wheel)$/;
  // Without `passive` said, these default to passive on the window, the document, <html> and <body>.
  var ROOTISH = function (t) { return t === window || t === document || t === document.documentElement || t === document.body; };
  var passiveOf = function (target, type, opts) {
    if (opts && typeof opts === "object" && "passive" in opts) return !!opts.passive;
    return /^(touchstart|touchmove|wheel)$/.test(type) && ROOTISH(target);
  };
  var captureOf = function (opts) { return typeof opts === "boolean" ? opts : !!(opts && opts.capture); };
  var where = function (t) { return t === window ? "window" : t === document ? "document" : desc(t); };

  // A bare addEventListener(...) in strict code comes with no `this`: it's the window's.
  var self = function (t) { return t == null ? window : t; };

  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    var target = self(this);
    if (!TOUCH.test(type) || !fn || target === box) return add.call(target, type, fn, opts);
    var capture = captureOf(opts);
    var list = wraps.get(fn);
    if (!list) wraps.set(fn, (list = []));
    for (var i = 0; i < list.length; i++) {
      if (list[i].target === target && list[i].type === type && list[i].capture === capture) return;
    }
    var id = ++next;
    var src = typeof fn === "function" ? Function.prototype.toString.call(fn) : "{handleEvent}";
    var info = { id: id, type: type, where: where(target), passive: passiveOf(target, type, opts), capture: capture, src: src.replace(/\s+/g, " ").slice(0, 46), cancelled: 0 };
    var w = function (e) {
      var before = e.defaultPrevented;
      var r = typeof fn === "function" ? fn.call(this, e) : fn.handleEvent(e);
      if (!before && e.defaultPrevented) {
        info.cancelled++;
        e.__kzBy = e.__kzBy || "#" + id + " " + info.type + "@" + info.where;
      }
      if (opts && opts.once) forget();
      return r;
    };
    var entry = { target: target, type: type, capture: capture, w: w, id: id };
    var forget = function () {
      live.delete(id);
      var at = list.indexOf(entry);
      if (at >= 0) list.splice(at, 1);
    };
    list.push(entry);
    live.set(id, info);
    if (opts && opts.signal) opts.signal.addEventListener("abort", forget);
    return add.call(target, type, w, opts);
  };
  EventTarget.prototype.removeEventListener = function (type, fn, opts) {
    var target = self(this);
    if (!TOUCH.test(type) || !fn) return remove.call(target, type, fn, opts);
    var capture = captureOf(opts);
    var list = wraps.get(fn);
    if (list) {
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (e.target === target && e.type === type && e.capture === capture) {
          list.splice(i, 1);
          live.delete(e.id);
          return remove.call(target, type, e.w, opts);
        }
      }
    }
    return remove.call(target, type, fn, opts);
  };

  /* ── The last touch ───────────────────────────────────────────────── */

  var touch = null;
  var later = function (fn) { setTimeout(fn, 0); };
  var round = Math.round;
  add.call(window, "touchstart", function (e) {
    var p = e.touches[0];
    if (!p || e.touches.length > 1) return;
    touch = { x: round(p.clientX), y: round(p.clientY), y0: round(scrollY), t: performance.now(), under: under(p.clientX, p.clientY), moves: 0, cancelled: 0, by: "", first: null, end: null };
    later(function () { if (touch && e.defaultPrevented) touch.by = "start cancelled by " + (e.__kzBy || "?"); paint(); });
  }, { capture: true, passive: true });
  add.call(window, "touchmove", function (e) {
    var p = e.touches[0];
    if (!touch || !p) return;
    var t = touch;
    t.moves++;
    if (!t.first) t.first = { dy: round(p.clientY - t.y), cancelable: e.cancelable };
    later(function () {
      if (e.defaultPrevented) {
        t.cancelled++;
        if (!t.by) t.by = e.__kzBy || "?";
      }
    });
  }, { capture: true, passive: true });
  var onEnd = function (e) {
    if (!touch) return;
    var p = e.changedTouches[0];
    var t = touch;
    t.end = { x: p ? round(p.clientX) : null, y: p ? round(p.clientY) : null, y1: round(scrollY), kind: e.type };
    // And where the page has got to once any momentum has run.
    setTimeout(function () { t.settled = round(scrollY); paint(); }, 900);
    paint();
  };
  add.call(window, "touchend", onEnd, { capture: true, passive: true });
  add.call(window, "touchcancel", onEnd, { capture: true, passive: true });

  /* ── The box ──────────────────────────────────────────────────────── */

  var box = null;
  function desc(el) {
    if (!el || !el.nodeName) return String(el);
    var s = el.nodeName.toLowerCase();
    if (el.id) s += "#" + el.id;
    if (typeof el.className === "string" && el.className.trim()) s += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    return s;
  }
  function under(x, y) {
    var el = document.elementFromPoint(x, y);
    var top = el ? desc(el) : "nothing";
    // The nearest box of its own that scrolls, if any: it would take the swipe before the page.
    for (var n = el; n && n !== document.body && n !== html; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)) {
        return top + " · scroller " + desc(n) + " (" + cs.overflowX + "/" + cs.overflowY + ")";
      }
    }
    return top;
  }
  function styles(el) {
    var cs = getComputedStyle(el);
    return "ovf " + cs.overflowX + "/" + cs.overflowY + " · pos " + cs.position + " · ta " + cs.touchAction + " · osb " + cs.overscrollBehaviorY + (el.getAttribute("style") ? ' · style "' + el.getAttribute("style") + '"' : "");
  }
  function work() {
    var pin = document.querySelector(".work-pin");
    var stage = pin && pin.firstElementChild;
    if (!pin || !stage) return "work: none";
    var a = pin.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return "work: pin " + round(a.top + scrollY) + "–" + round(a.bottom + scrollY) + " · stage on screen at " + round(b.top) + (Math.abs(b.top) < 2 && a.top < 2 && a.bottom > b.bottom - 2 ? " (pinned)" : "");
  }
  function paint() {
    if (!box) return;
    var blockers = [], others = 0;
    live.forEach(function (l) {
      if (l.passive) return;
      if (l.type === "touchstart" || l.type === "touchmove") blockers.push(l);
      else others++;
    });
    var vv = window.visualViewport;
    var lines = [
      "scrollY " + round(scrollY) + (vv ? " · vv " + round(vv.offsetTop) + "/" + round(vv.height) : "") + " · inner " + innerHeight + " · doc " + html.scrollHeight,
      "hold " + (html.hasAttribute("data-kz-hold") ? "ON" : "off") + (html.hasAttribute("data-menu") ? " · menu open" : ""),
      "html: " + styles(html),
      "body: " + styles(document.body),
      "can block a swipe: " + blockers.length + " (non-passive touchstart/touchmove)" + (others ? " · " + others + " other non-passive" : ""),
    ];
    blockers.slice(0, 4).forEach(function (l) {
      lines.push("  #" + l.id + " " + l.type + "@" + l.where + (l.capture ? " cap" : "") + (l.cancelled ? " ✗" + l.cancelled : "") + " " + l.src);
    });
    lines.push(work());
    if (touch) {
      var t = touch;
      lines.push(
        "touch: " + t.x + "," + t.y + " (scrollY " + t.y0 + ")" +
          (t.end ? " → " + t.end.x + "," + t.end.y + " (scrollY " + t.end.y1 + (t.settled != null ? ", then " + t.settled : "") + ")" + (t.end.kind === "touchcancel" ? " CANCELLED" : "") : " …")
      );
      lines.push(
        "  moves " + t.moves + (t.first ? " · 1st " + (t.first.dy < 0 ? "up " : "down ") + Math.abs(t.first.dy) + "px, " + (t.first.cancelable ? "cancelable" : "not cancelable") : "") +
          " · defaultPrevented " + (t.cancelled ? "YES " + t.cancelled + "/" + t.moves + " by " + t.by : t.by ? "YES (" + t.by + ")" : "no")
      );
      lines.push("  under: " + t.under);
    } else lines.push("touch: none yet");
    lines.push("debug from " + round(t0) + "ms" + (takenBefore ? " (late: some listeners may be missing)" : ""));
    box.textContent = lines.join("\n");
  }
  function mount() {
    box = document.createElement("div");
    box.id = "kz-scroll-debug";
    box.setAttribute("aria-hidden", "true");
    Object.assign(box.style, {
      position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 64px)", left: "6px", zIndex: "2147483647",
      maxWidth: "calc(100vw - 12px)", padding: "6px 7px", borderRadius: "6px",
      background: "rgba(0,0,0,.8)", color: "#fff", font: "10px/1.35 ui-monospace, Menlo, monospace",
      whiteSpace: "pre-wrap", wordBreak: "break-all", pointerEvents: "none",
    });
    document.body.appendChild(box);
    paint();
    setInterval(paint, 250);
    var queued = 0;
    add.call(window, "scroll", function () { if (!queued) queued = requestAnimationFrame(function () { queued = 0; paint(); }); }, { passive: true });
  }
  // Once the page is all in: the box goes last in <body>, after everything the page renders.
  if (document.readyState === "loading") add.call(document, "DOMContentLoaded", mount);
  else mount();
})();
