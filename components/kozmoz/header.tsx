"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { brand, nav, people, type Who } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";
import { WhoButton } from "@/components/kozmoz/hands";
import { cn } from "@/lib/utils";

/**
 * The door plate: the wordmark on the left, the section links on the right.
 * Once the page's first heading has gone under it (the names on the door, on
 * the home page) it turns black and the two names fade in on the seam
 * (kozmoz.css, "header"); back above it, it's paper again. On phones it
 * drops to two rows and steps out of the way on the way down, returning the
 * moment you scroll back up.
 *
 * On the home page the names are the "pick a name" buttons and the links are
 * its own sections. Every other page sets `home` false: the names are just
 * names, and the links lead back to the home page's sections ("#us" becomes
 * "/#us") — except any listed in `local`, which that page has itself.
 */
export function Header({ home = false, local = [] }: { home?: boolean; local?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 1023px)");
    // What the header turns dark past: the names on the door, or the page's title.
    const mark = document.querySelector(".hero .names") ?? document.querySelector("main h1");
    let lastY = scrollY;

    const onScroll = () => {
      const y = scrollY;
      const focusInside = ref.current?.contains(document.activeElement) ?? false;
      if (small.matches && y > 160 && y > lastY + 4 && !focusInside) setHidden(true);
      else if (y < lastY - 4 || y < 160) setHidden(false);
      lastY = y;
      // Measured from where the header sits when it's showing, so a header
      // stepping out of the way doesn't count as the heading going under it.
      const under = ref.current ? ref.current.offsetHeight : 0;
      setDark(mark ? mark.getBoundingClientRect().bottom <= under : y > 160);
    };

    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const name = (who: Who) =>
    home ? (
      <WhoButton who={who} className={`who who--${who}`}>
        {people[who].name}
      </WhoButton>
    ) : (
      <span className={`who who--${who}`}>{people[who].name}</span>
    );

  return (
    <header ref={ref} className={cn("top", hidden && "is-hidden", dark && "is-dark")}>
      {home ? (
        <a className="brand" href="#top">
          <Image src={brand.mark} alt="" width={192} height={192} priority />
          <Wordmark className="gold" />
        </a>
      ) : (
        <Link className="brand" href="/">
          <Image src={brand.mark} alt="" width={192} height={192} priority />
          <Wordmark className="gold" />
        </Link>
      )}
      {name("a")}
      <span className="top-amp gold" aria-hidden="true">
        &amp;
      </span>
      {name("j")}
      <nav className="nav" aria-label="Sections">
        {nav.map((l) =>
          home || local.includes(l.href) ? (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ) : (
            <Link key={l.href} href={`/${l.href}`}>
              {l.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
