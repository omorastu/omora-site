"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { RingsMark } from "./RingsMark";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-night border-b border-black/40" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-wrap mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`flex items-center gap-3 font-logo text-xl font-normal uppercase tracking-[0.35em] transition-colors duration-300 ${
            scrolled ? "text-night-ink" : "text-ink"
          }`}
        >
          <RingsMark className="w-7 h-5" />
          <span className="pl-1">Omora</span>
        </Link>
        <nav
          className={`hidden md:flex items-center gap-8 text-sm transition-colors duration-300 ${
            scrolled ? "text-night-muted" : "text-muted"
          }`}
        >
          <Link href="/services" className="hover:text-teal transition-colors">
            Services
          </Link>
          <Link href="/work" className="hover:text-teal transition-colors">
            Work
          </Link>
          <Link href="/pricing" className="hover:text-teal transition-colors">
            Pricing
          </Link>
          <Link href="/team" className="hover:text-teal transition-colors">
            About
          </Link>
          <Link
            href="/start"
            onClick={() => track("start_project_click", { location: "nav" })}
            className="text-night font-medium rounded-full px-5 py-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
              boxShadow:
                "0 6px 18px -6px rgba(18,174,219,0.55), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            Start a project
          </Link>
        </nav>
        <Link
          href="/start"
          onClick={() => track("start_project_click", { location: "nav_mobile" })}
          className="md:hidden text-sm text-night font-medium rounded-full px-4 py-1.5"
          style={{
            background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
          }}
        >
          Start
        </Link>
      </div>
    </header>
  );
}
