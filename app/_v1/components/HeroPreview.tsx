"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { projects } from "@/lib/projects";

// Only the automotive-relevant live sites rotate here.
const previewNames = ["FW Wheels", "Joon"];

const slides = previewNames
  .map((n) => projects.find((p) => p.name === n && p.verified))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

function Slide({
  href,
  active,
  screenshot,
  name,
}: {
  href: string;
  active: boolean;
  screenshot?: string;
  name: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || screenshot) return;
    // if the iframe hasn't loaded within 4s, assume it blocks embedding
    timer.current = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, loaded, screenshot]);

  const host = href.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Screenshot mode — always reliable, used for sites that block embedding
  if (screenshot) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={screenshot}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
    );
  }

  return (
    <>
      {!failed && (
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{ width: "250%", height: "250%", transform: "scale(0.4)" }}
        >
          <iframe
            src={active ? href : "about:blank"}
            title={host}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="w-full h-full border-0"
            scrolling="no"
          />
        </div>
      )}
      {failed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: "linear-gradient(160deg, #0F1216 0%, #1a2b30 100%)" }}
        >
          <div className="font-mono text-xs text-teal">{host}</div>
          <div className="text-white/80 text-sm font-medium">Live site — click to visit ↗</div>
        </div>
      )}
    </>
  );
}

export function HeroPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (slides.length === 0) return null;
  const current = slides[index];

  return (
    <div className="hidden lg:flex flex-col items-end absolute top-1/2 -translate-y-1/2 right-8 xl:right-16 w-[340px] z-10">
      {/* labels above the card */}
      <div className="mb-3 text-center w-full">
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-teal">
          Current automotive sites
        </div>
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted mt-0.5">
          Live now — click to visit
        </div>
      </div>

      <a
        href={current.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track("project_link_click", { project: current.name, location: "hero_preview" })
        }
        className="block w-full group"
      >
        <div className="rounded-xl border border-line bg-raised overflow-hidden shadow-[0_24px_60px_-24px_rgba(16,18,21,0.35)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_32px_70px_-20px_rgba(18,174,219,0.45)]">
          {/* browser chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-line bg-bg">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E5544E" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E5B84E" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#4EB868" }} />
            <div className="ml-2 flex-1 rounded bg-line/60 px-2 py-0.5">
              <span className="text-[10px] font-mono text-muted truncate block">
                {current.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </span>
            </div>
          </div>

          {/* live site previews, cross-fading */}
          <div className="relative h-[250px] overflow-hidden bg-white">
            {slides.map((p, i) => (
              <div
                key={p.name}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                <Slide href={p.href} active={i === index} screenshot={p.screenshot} name={p.name} />
              </div>
            ))}
            <div className="absolute inset-0" />
          </div>

          {/* caption */}
          <div className="px-4 py-3 border-t border-line flex items-center justify-between">
            <div>
              <div className="text-ink text-sm font-medium">{current.name}</div>
              <div className="text-xs text-muted font-mono mt-0.5">{current.category}</div>
            </div>
            <span className="text-teal text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              visit ↗
            </span>
          </div>
        </div>
      </a>

      {/* progress dots */}
      <div className="flex justify-center gap-1.5 mt-3 w-full">
        {slides.map((p, i) => (
          <span
            key={p.name}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? "18px" : "6px",
              background: i === index ? "#12AEDB" : "#C9CDD2",
            }}
          />
        ))}
      </div>
    </div>
  );
}
