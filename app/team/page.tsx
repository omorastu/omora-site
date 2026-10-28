import type { Metadata } from "next";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";
import { Team } from "@/components/site/team";

export const metadata: Metadata = {
  title: "Team — Kozmoz",
  description:
    "The people who actually build it. You talk to them directly, not to an account manager.",
};

/**
 * /team — the full team grid, which used to be a section on the home page.
 *
 * It moved because it outgrew the slot: four cards is a page. The home page
 * keeps a two-line strip pointing here (TeamStrip), so the claim still gets
 * made where it matters and the detail lives where there's room for it.
 *
 * Structure matches /work — dark hero, cream body, dark close — including the
 * `data-light-zone` marker the nav watches to flip to its light treatment.
 */
export default function TeamPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <section className="layer px-6 pb-[120px] pt-40 sm:pt-48">
          <div className="mx-auto max-w-wrap">
            <p className="plate">Team</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tightest text-ink">
              The people who actually build it.
            </h1>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-muted">
              You talk to the people building the thing. Nobody hands your
              project to a junior once the contract&rsquo;s signed.
            </p>
          </div>
        </section>

        <div
          data-light-zone
          className="border-t border-[rgba(123,92,176,0.35)] bg-cream"
        >
          <section className="layer px-6 pb-[100px] pt-[100px] sm:pb-32">
            <div className="mx-auto max-w-wrap">
              <Team />
            </div>
          </section>
        </div>

        <Closing />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
