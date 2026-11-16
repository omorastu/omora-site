"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { brand, hero, menu, nav } from "@/lib/elorro";
import { Wordmark } from "@/components/wordmark";
import { Menu } from "@/components/elorro/menu";
import { PlayIcon } from "@/components/elorro/marks";
import { cn } from "@/lib/utils";

/**
 * The bar along the top: the rings and the wordmark on the left; on wide
 * screens the home page's chapters, the film and "Book a call" along it; on
 * phones and tablets, the film and the menu button (the links are in the
 * menu, menu.tsx). Over the home page's opening it's clear, on the black;
 * once the opening has gone under it, it's paper, with a hairline. On
 * phones it steps out of the way on the way down and returns the moment you
 * scroll back up.
 *
 * On the home page the links are its own chapters ("#us"); every other page
 * leads back to them ("/#us"), except any listed in `local`, which that
 * page has itself.
 */
export function Header({ home = false, local = [] }: { home?: boolean; local?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [over, setOver] = useState(home);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 1023px)");
    // What the bar sits clear over: the home page's opening, on the black.
    const dark = document.querySelector<HTMLElement>(".open");
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      const focusInside = ref.current?.contains(document.activeElement) ?? false;
      if (small.matches && y > 160 && y > lastY + 4 && !focusInside) setHidden(true);
      else if (y < lastY - 4 || y < 160) setHidden(false);
      lastY = y;
      const under = ref.current ? ref.current.offsetHeight : 0;
      setOver(!!dark && dark.getBoundingClientRect().bottom > under);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const to = (href: string) => (home || local.includes(href) ? href : `/${href}`);
  const book = to(hero.cta.href);

  return (
    <>
      <header ref={ref} className={cn("bar", over && "is-over", hidden && "is-hidden")}>
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
        <nav className="bar-nav" aria-label="Sections">
          <ul>
            {nav
              .filter((n) => n.href !== "#contact")
              .map((n) => (
                <li key={n.href}>
                  <a href={to(n.href)}>{n.label}</a>
                </li>
              ))}
          </ul>
        </nav>
        <div className="bar-acts">
          <Link className="bar-film" href={hero.film.href}>
            <PlayIcon />
            <span className="bar-film-label">Watch the film</span>
          </Link>
          <a className="bar-book" href={book}>
            Book a call
          </a>
          <button
            type="button"
            className="bar-menu label"
            aria-label={menu.label}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen(true)}
          >
            {menu.label}
          </button>
        </div>
      </header>
      <Menu id="menu" open={menuOpen} home={home} local={local} onClose={() => setMenuOpen(false)} />
    </>
  );
}
