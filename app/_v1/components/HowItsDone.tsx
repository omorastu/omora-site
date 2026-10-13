import { Eyebrow } from "./Eyebrow";
import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "You tell us what you need",
    body: "A short message, a business type, and what you're after. We reply with a real plan within 24 hours.",
  },
  {
    n: "02",
    title: "We design and build it",
    body: "A real designer and engineer on the work — not a template, not handed off. You see progress as it happens, not just at the end.",
  },
  {
    n: "03",
    title: "You launch and own it",
    body: "Full code, domain, and data ownership — nothing locked behind our accounts.",
  },
];

export function HowItsDone() {
  return (
    <section className="border-t border-line">
      <div className="max-w-wrap mx-auto px-6 md:px-8 py-16 md:py-24">
        <Reveal>
          <Eyebrow>How it's done</Eyebrow>
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-14">
            From message to live site.
          </h2>
        </Reveal>

        <div className="relative">
          {/* connecting line, desktop only */}
          <div className="hidden md:block absolute top-6 left-[16.6%] right-[16.6%] h-px bg-line overflow-visible">
            <span
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{
                background: "#12AEDB",
                boxShadow: "0 0 12px 2px rgba(18,174,219,0.7)",
                animation: "pulseTravel 3.2s linear infinite",
              }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{
                background: "#12AEDB",
                boxShadow: "0 0 12px 2px rgba(18,174,219,0.7)",
                animation: "pulseTravel 3.2s linear infinite",
                animationDelay: "1.6s",
              }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6 relative">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="flex flex-col items-start">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-night font-mono text-sm mb-5"
                    style={{
                      background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
                      boxShadow: "0 6px 16px -6px rgba(18,174,219,0.5)",
                    }}
                  >
                    {s.n}
                  </div>
                  <h3 className="text-ink text-lg mb-2">{s.title}</h3>
                  <p className="text-muted text-sm">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
