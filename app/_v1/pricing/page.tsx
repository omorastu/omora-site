import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import { Eyebrow } from "../components/Eyebrow";

export const metadata = {
  title: "Pricing — Omora",
};

// Confirmed directly against jdlo.site: landing pages $497, websites from
// $3K, e-commerce/AI systems $5K–$15K, custom platforms from $15K+. Payment
// terms and retainer pricing below are also his real published terms.
const tiers = [
  {
    tier: "Landing page",
    price: "from $497",
    tagline: "Look real. Get found.",
    features: ["Single custom page", "Mobile-optimized", "Contact form", "Live in about a week"],
  },
  {
    tier: "Website",
    price: "from $3,000",
    tagline: "The full custom build.",
    popular: true,
    features: [
      "Everything in Landing page",
      "Multi-page custom site",
      "SEO setup",
      "Editable content, no page builder",
      "Live in under two weeks",
    ],
  },
  {
    tier: "E-commerce / AI system",
    price: "$5,000–$15,000",
    tagline: "The store or system runs itself.",
    features: [
      "Everything in Website",
      "Store, booking, or CRM build",
      "AI follow-up / automation",
      "3–6 week build",
    ],
  },
  {
    tier: "Custom platform",
    price: "$15,000+",
    tagline: "Marketplaces, dashboards, full systems.",
    features: [
      "Everything in E-commerce / AI",
      "Multi-user / role-based access",
      "Custom admin dashboard",
      "Ongoing support available",
    ],
  },
];

export default function Pricing() {
  return (
    <>
      <Nav />

      <section className="max-w-wrap mx-auto px-6 md:px-8 pt-16 pb-8 md:pt-24">
        <Reveal>
          <Eyebrow>What we do</Eyebrow>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">
            Built for your business.
          </h1>
          <p className="text-muted max-w-lg">
            Real ranges, not "contact us for pricing." Your first message gets
            an exact number within 24 hours.
          </p>
        </Reveal>
      </section>

      {/* SERVICES — full breakdown now lives on its own pages */}
      <section className="max-w-wrap mx-auto px-6 md:px-8 pb-16 md:pb-20">
        <Reveal>
          <Link
            href="/services"
            className="flex items-center justify-between p-6 rounded-lg border border-line transition-all duration-300 hover:border-teal hover:-translate-y-0.5 hover:shadow-[0_0_24px_-10px_rgba(18,174,219,0.3)]"
          >
            <div>
              <div className="text-ink font-medium mb-1">See the full service breakdown</div>
              <p className="text-sm text-muted">
                The Operator Stack, Apps &amp; Systems, Creative &amp; Custom, Websites &amp; E-commerce.
              </p>
            </div>
            <span className="font-mono text-xs text-teal whitespace-nowrap">Services →</span>
          </Link>
        </Reveal>
      </section>

      {/* PRICING TIERS */}
      <section className="max-w-wrap mx-auto px-6 md:px-8 pb-16 md:pb-20">
        <Eyebrow>Packages</Eyebrow>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {tiers.map((t, i) => (
            <Reveal key={t.tier} delay={i * 80}>
              <div
                className={`relative corner-frame p-6 rounded-lg border h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  t.popular
                    ? "border-teal bg-raised/40 shadow-[0_0_28px_-12px_rgba(18,174,219,0.35)]"
                    : "border-line bg-raised/10 hover:border-teal hover:shadow-[0_0_24px_-10px_rgba(18,174,219,0.3)]"
                }`}
              >
                {t.popular && (
                  <>
                    <span className="corner-bracket tl always" />
                    <span className="corner-bracket tr always" />
                    <span className="corner-bracket bl always" />
                    <span className="corner-bracket br always" />
                  </>
                )}
                {t.popular && (
                  <span
                    className="absolute -top-3 left-6 text-night text-[10px] uppercase tracking-wide font-medium px-3 py-1 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, #4FD8F0 0%, #12AEDB 55%, #0D84A6 100%)",
                      boxShadow: "0 4px 14px -4px rgba(18,174,219,0.5)",
                    }}
                  >
                    Most popular
                  </span>
                )}
                <div className="text-xs text-muted uppercase tracking-wide mb-3">
                  {t.tier}
                </div>
                <div className="font-display text-2xl text-ink mb-1">{t.price}</div>
                <p className="text-xs text-muted mb-4">{t.tagline}</p>
                <ul className="space-y-2 text-sm text-muted mt-auto pt-4 border-t border-line">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-teal mt-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mt-10 text-sm text-muted">
          <p>
            <span className="text-ink">Payment: </span>
            50% to start, 50% on launch. Larger builds split across
            milestones.
          </p>
          <p>
            <span className="text-ink">Ownership: </span>
            Everything we build — code, domain, data — is yours from day
            one.
          </p>
          <p>
            <span className="text-ink">After launch: </span>
            30 days of free tweaks, then optional retainers from
            $500/month for hosting and support.
          </p>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-t border-line">
        <div className="max-w-wrap mx-auto px-6 md:px-8 py-16 md:py-24">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display text-2xl md:text-3xl text-ink mb-10">
              How a project actually goes.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "Step one",
                title: "Tell us what you need",
                body: "A short message is enough. We reply with a real plan and price within 24 hours — for most requests, no call required.",
              },
              {
                step: "Step two",
                title: "We build it, you watch",
                body: "Most websites go live in under two weeks. Larger systems — booking, CRM, AI follow-up — run three to six weeks. You see progress as it happens, not at the end.",
              },
              {
                step: "Step three",
                title: "You launch and own it",
                body: "Full code, domain, and data ownership — nothing locked behind our accounts. Thirty days of free tweaks after launch.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="p-6 rounded-lg transition-all duration-300 hover:bg-raised/30 hover:-translate-y-0.5">
                  <p className="text-muted text-sm mb-2 font-mono">{s.step}</p>
                  <h3 className="text-ink text-lg mb-2">{s.title}</h3>
                  <p className="text-muted text-sm">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI TRANSPARENCY */}
      <section className="border-t border-line">
        <div className="max-w-wrap mx-auto px-6 md:px-8 py-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl text-ink mb-3">
              Where AI actually fits in.
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              We use AI to move faster on research, drafts, and first passes
              — the same way any modern studio does. But every project on
              this site was reviewed, built, and shipped into production by
              a person on our team, not generated and handed over. If we
              ever show a concept demo instead of live client work, we'll
              label it as one, clearly, every time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
