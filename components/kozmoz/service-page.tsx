import Link from "next/link";
import { servicesPage, type Service } from "@/lib/kozmoz";
import { Page } from "@/components/kozmoz/page";
import { Contact } from "@/components/kozmoz/contact";

/**
 * A service's own page, /services/<slug> (app/services/[slug]): the
 * case-study page's frame and look (components/work/case-study.tsx, its
 * classes in kozmoz.css), so the two read as one site. The title (under the
 * way back to /services) and a short intro, what's included, "What we do" as
 * numbered steps, a slot for the work, and the contact section. Copy in
 * lib/kozmoz.ts (`services`).
 */
export function ServicePage({ service: s }: { service: Service }) {
  return (
    // The header's Contact link stays on the page: it ends in its own form.
    <Page local={["#contact"]}>
      <header className="cs-head">
        <div className="wrap">
          <div className="cs-intro">
            <p className="cs-eyebrow label">
              <Link href="/services">Services</Link>
            </p>
            <h1 className="cs-title">{s.title}</h1>
            <p className="cs-sub">{s.page.intro}</p>
          </div>
          <ul className="cs-caps svc-caps">
            {s.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </header>

      <section className="cs-steps" aria-labelledby="how-h">
        <div className="wrap">
          <h2 className="sec-label label svc-steps-label" id="how-h">
            {servicesPage.title}
          </h2>
          <ol>
            {s.page.steps.map((step, i) => (
              <li key={step.kind} className="cs-step">
                <p className="cs-step-n label">
                  <span>{String(i + 1).padStart(2, "0")}</span> {step.kind}
                </p>
                <h3 className="cs-step-h">{step.heading}</h3>
                <p className="cs-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TODO: this service's work. Structure only for now: two neutral boxes
          where its projects' cards will go (the Work grid's, components/kozmoz/work.tsx). */}
      <section className="svc-work sec" aria-labelledby="svc-work-h">
        <div className="wrap">
          <h2 className="sec-label label" id="svc-work-h">
            Work
          </h2>
          <div className="svc-work-grid">
            <div className="placeholder" aria-hidden="true" />
            <div className="placeholder" aria-hidden="true" />
          </div>
        </div>
      </section>

      <Contact source={`omora.studio/services/${s.slug}`} />
    </Page>
  );
}
