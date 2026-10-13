import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import { Eyebrow } from "../components/Eyebrow";


export const metadata = {
  title: "About — Omora",
};

export default function Team() {
  return (
    <>
      <Nav />
      <section className="max-w-wrap mx-auto px-6 md:px-8 pt-16 pb-8 md:pt-24">
        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">
            Who's building it.
          </h1>
          <p className="text-muted max-w-lg">
            Two people, not a faceless studio. Here&apos;s the short version.
          </p>
        </Reveal>
      </section>

      {/* BIOS */}
      <section className="border-t border-line">
        <div className="max-w-wrap mx-auto px-6 md:px-8 py-16 md:py-24 space-y-16">
          <Reveal>
            <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
              <div>
                <div className="text-ink font-medium text-xl">Jordan Lopez</div>
                <div className="text-xs text-teal uppercase tracking-wide mt-1">
                  Engineering &amp; Systems
                </div>
                <a
                  href="https://instagram.com/jdlo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-teal transition-colors inline-block mt-3"
                >
                  @jdlo ↗
                </a>
              </div>
              <div className="p-6 rounded-lg border border-line transition-all duration-300 hover:border-teal hover:-translate-y-0.5 hover:shadow-[0_0_28px_-10px_rgba(18,174,219,0.25)]">
                <p className="text-ink text-sm leading-relaxed">
                  Jordan is the engineering half of Omora — the one who
                  builds the parts of a project people don&apos;t see but feel:
                  the booking flows, the databases, the AI follow-up, the
                  integrations that make a site actually run a business. His
                  work spans full platforms, dashboards, e-commerce, and
                  custom systems, and it&apos;s all live and in use.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
              <div>
                <div className="text-ink font-medium text-xl">Ashan Fernando</div>
                <div className="text-xs text-teal uppercase tracking-wide mt-1">
                  Design &amp; Experience
                </div>
              </div>
              <div className="p-6 rounded-lg border border-line transition-all duration-300 hover:border-teal hover:-translate-y-0.5 hover:shadow-[0_0_28px_-10px_rgba(18,174,219,0.25)]">
                <p className="text-ink text-sm leading-relaxed">
                  Ashan leads design and client experience at Omora. His
                  focus is UX/UI — the difference between a site that just
                  exists and one that actually moves people to act. He owns
                  the look, the copy, and the quality bar, obsessing over the
                  details most agencies skip and killing the generic,
                  built-by-a-template patterns before they ever reach a
                  client. If it ships with Omora&apos;s name on it, it&apos;s
                  been through him.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  );
}
