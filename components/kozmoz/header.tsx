"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { brand, nav, people, type Who } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";
import { WhoButton } from "@/components/kozmoz/hands";
import { cn } from "@/lib/utils";

/**
 * The door plate: the wordmark on the left, the two names on the seam, the
 * section links on the right. On phones it drops to two rows and steps out of
 * the way on the way down, returning the moment you scroll back up.
 *
 * On the home page the names are the "pick a name" buttons and the links are
 * its own sections. Every other page sets `home` false: the names are just
 * names, and the links lead back to the home page's sections ("#us" becomes
 * "/#us") — except any listed in `local`, which that page has itself.
 */
export function Header({ home = false, local = [] }: { home?: boolean; local?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 1023px)");
    let lastY = scrollY;

    const onScroll = () => {
      const y = scrollY;
      const focusInside = ref.current?.contains(document.activeElement) ?? false;
      if (small.matches && y > 160 && y > lastY + 4 && !focusInside) setHidden(true);
      else if (y < lastY - 4 || y < 160) setHidden(false);
      lastY = y;
    };

    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
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
    <header ref={ref} className={cn("top", hidden && "is-hidden")}>
      {home ? (
        <a className="brand" href="#top">
          <Image src={brand.mark} alt="" width={192} height={192} priority />
          <Wordmark />
        </a>
      ) : (
        <Link className="brand" href="/">
          <Image src={brand.mark} alt="" width={192} height={192} priority />
          <Wordmark />
        </Link>
      )}
      {name("a")}
      <span className="top-amp" aria-hidden="true">
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
