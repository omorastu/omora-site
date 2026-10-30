"use client";

import { useSyncExternalStore } from "react";

/**
 * With ?debug=scroll in the address, a box in the corner on what's holding
 * the home page's scroll (public/debug-scroll.js, which has the details).
 * Only this test goes out with the page: the box, and the count of touch
 * listeners it keeps, load only on a visit that asks for them. It's written
 * in as the page is read, straight into <body>, so that it runs ahead of the
 * page's own script and sees every listener that adds.
 */
const GATE = `if(/[?&]debug=scroll(&|$)/.test(location.search))document.write('<script src="/debug-scroll.js"><\\/script>')`;

const noSubscribe = () => () => {};

export function ScrollDebug() {
  // Only in the page as sent (a script React adds later never runs).
  const firstRender = useSyncExternalStore(
    noSubscribe,
    () => false,
    () => true
  );
  return firstRender ? <script dangerouslySetInnerHTML={{ __html: GATE }} /> : null;
}
