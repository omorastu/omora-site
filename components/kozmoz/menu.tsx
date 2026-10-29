"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, menu, nav } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";

/**
 * The menu: the site's links, off the header and over the whole screen, in
 * the paper (kozmoz.css, "the menu"). A modal <dialog>, opened by the
 * header's button (header.tsx): the home page's sections large down the
 * page's grid, the two pages under them, and Close where the button was.
 * While it's open, focus goes round inside it and the page behind doesn't
 * scroll; it closes on a link, on Close or on Escape, and focus goes back
 * to the button.
 *
 * On the home page the section links are its own ("#us"). Every other page
 * leads back to the home page's ("/#us"), except any listed in `local`,
 * which that page has itself.
 */
export function Menu({
  id,
  open,
  home,
  local,
  onClose,
}: {
  id: string;
  open: boolean;
  home: boolean;
  local: string[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const shutting = useRef(false);
  const pathname = usePathname();

  /** The page behind holds still while the menu is open. */
  const hold = (on: boolean) => {
    if (on) document.documentElement.dataset.menu = "";
    else delete document.documentElement.dataset.menu;
  };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open || dialog.open) return;
    dialog.showModal();
    hold(true);
    // Focus starts on Close, where the button that opened it was.
    dialog.querySelector<HTMLElement>(".menu-close")?.focus();
    if (reducedMotion()) return;
    dialog.animate({ opacity: [0, 1] }, { duration: 250, easing: "ease" });
    dialog.querySelectorAll(".menu-body li, .menu-pages-label").forEach((el, i) =>
      el.animate(
        { transform: ["translateY(.75rem)", "none"], opacity: [0, 1] },
        { duration: 400, delay: 60 + i * 35, easing: "cubic-bezier(.2, .7, .3, 1)", fill: "backwards" }
      )
    );
  }, [open]);

  // Gone with the page (a link to another one): let the page scroll again.
  useEffect(() => () => hold(false), []);

  /** Fades out, then closes; the page behind can scroll again at once, so a section link's scroll isn't held. */
  const shut = () => {
    const dialog = ref.current;
    if (!dialog?.open || shutting.current) return;
    shutting.current = true;
    hold(false);
    const done = () => {
      fade?.cancel();
      dialog.close();
      shutting.current = false;
      onClose();
    };
    const fade = reducedMotion() ? null : dialog.animate({ opacity: [1, 0] }, { duration: 200, easing: "ease", fill: "forwards" });
    if (fade) fade.finished.then(done, done);
    else done();
  };

  /** Tab and Shift+Tab go round the menu's own buttons and links. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const stops = [...e.currentTarget.querySelectorAll<HTMLElement>("a[href], button")];
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <dialog
      ref={ref}
      id={id}
      className="menu"
      aria-label={menu.label}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        shut();
      }}
      onClose={() => {
        hold(false);
        if (!shutting.current) onClose();
      }}
    >
      <div className="menu-bar">
        {home ? (
          <a className="brand" href="#top" onClick={shut}>
            <Image src={brand.mark} alt="" width={192} height={192} />
            <Wordmark className="gold" />
          </a>
        ) : (
          <Link className="brand" href="/" onClick={shut}>
            <Image src={brand.mark} alt="" width={192} height={192} />
            <Wordmark className="gold" />
          </Link>
        )}
        <button type="button" className="menu-close label" onClick={shut}>
          {menu.close}
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </div>
      <nav className="menu-body" aria-label={menu.label}>
        <ul className="menu-links">
          {nav.map((l) => (
            <li key={l.href}>
              {home || local.includes(l.href) ? (
                <a href={l.href} onClick={shut}>
                  {l.label}
                </a>
              ) : (
                <Link href={`/${l.href}`} onClick={shut}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <p className="menu-pages-label label" id={`${id}-pages`}>
          {menu.pagesLabel}
        </p>
        <ul className="menu-pages" aria-labelledby={`${id}-pages`}>
          {menu.pages.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={current(l.href)} onClick={shut}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </dialog>
  );
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
