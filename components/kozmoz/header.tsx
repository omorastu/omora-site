"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { brand, nav, people } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";
import { WhoButton } from "@/components/kozmoz/hands";
import { cn } from "@/lib/utils";

/**
 * The door plate: the wordmark on the left, the two names on the seam, the
 * section links on the right. On phones it drops to two rows and steps out of
 * the way on the way down, returning the moment you scroll back up.
 */
export function Header() {
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

  return (
    <header ref={ref} className={cn("top", hidden && "is-hidden")}>
      <a className="brand" href="#top">
        <Image src={brand.mark} alt="" width={192} height={192} priority />
        <Wordmark />
      </a>
      <WhoButton who="a" className="who who--a">
        {people.a.name}
      </WhoButton>
      <span className="top-amp" aria-hidden="true">
        &amp;
      </span>
      <WhoButton who="j" className="who who--j">
        {people.j.name}
      </WhoButton>
      <nav className="nav" aria-label="Sections">
        {nav.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
