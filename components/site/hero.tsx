import { AuroraBackground } from "@/components/ui/aurora-background";
import { Particles } from "@/components/ui/particles";

/**
 * Hero. Aurora (violet haze) + particles (blue signal) over the bg-brown ground.
 *
 * Entrance is a single orchestrated cascade — plate, both headline lines, the
 * subline, then the CTA — rather than each element animating on its own terms.
 */
export function Hero() {
  // justify-end + a fixed bottom pad: the hero still fills the first screen,
  // but the gap under the last line is a known 120px rather than whatever
  // vertical centring happens to leave.
  return (
    <AuroraBackground className="min-h-[100svh] w-full justify-end overflow-hidden px-6 pb-[120px] pt-32">
      <Particles
        className="absolute inset-0 z-0"
        quantity={90}
        staticity={40}
        ease={60}
        size={0.5}
        color="#7FA0C4"
      />

      {/* Settles the lower half back to the bg brown so the headline never sits on
          a competing gradient. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-2/3 bg-gradient-to-t from-bg via-bg/85 to-transparent"
      />

      <div className="layer mx-auto flex w-full max-w-wrap flex-col items-start">
        <p
          className="rise flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          style={{ animationDelay: "80ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue opacity-70 animate-pulse-ring" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue" />
          </span>
          Taking on work
        </p>

        <h1 className="mt-6 font-display text-[clamp(2.6rem,9vw,7rem)] font-bold leading-[0.94] tracking-tightest">
          <span className="rise block text-ink" style={{ animationDelay: "180ms" }}>
            You&rsquo;ve got a problem.
          </span>
          <span
            className="rise block bg-gradient-to-br from-violet via-violet to-violet-deep bg-clip-text text-transparent"
            style={{ animationDelay: "320ms" }}
          >
            We&rsquo;re the fixers.
          </span>
        </h1>

        <p
          className="rise mt-7 max-w-prose text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "460ms" }}
        >
          Websites, AI agents, booking systems — whatever your business needs, we
          build it.
        </p>

        <p
          className="rise mt-4 max-w-prose text-pretty text-sm leading-relaxed text-muted"
          style={{ animationDelay: "530ms" }}
        >
          Built in the East Bay. We work with businesses across the Tri-Valley
          and the greater Bay Area.
        </p>

        <div className="rise mt-10" style={{ animationDelay: "600ms" }}>
          <a
            href="#contact"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-violet-deep px-7 py-4 font-medium text-ink shadow-[0_14px_40px_-14px_rgba(139,79,230,0.7)] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Sheen sweeping across the button on hover. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
            />
            <span className="relative">Tell us the problem</span>
            <svg
              viewBox="0 0 16 16"
              className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 8h11m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <p
          className="rise mt-6 font-mono text-[11px] text-muted/70"
          style={{ animationDelay: "720ms" }}
        >
          One conversation. No charge, no pitch deck.
        </p>
      </div>
    </AuroraBackground>
  );
}
