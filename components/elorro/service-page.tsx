import Link from "next/link";
import { serviceWorkCount, servicesPage, workPage, type Service } from "@/lib/elorro";
import { Page } from "@/components/elorro/page";
import { Contact } from "@/components/elorro/contact";
import { WorkGrid, projectsFor } from "@/components/elorro/work";

/**
 * A service's own page, /services/<slug> (app/services/[slug]): the
 * case-study page's frame and look (components/work/case-study.tsx, its
 * classes in elorro.css), so the two read as one site. The title (under the
 * way back to /services) and a short intro, what's included, "What we do" as
 * numbered steps, its work (the Work grid's cards), and the contact section. Copy in
 * lib/elorro.ts (`services`).
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

      <section className="svc-work sec" aria-labelledby="svc-work-h">
        <div className="wrap">
          <h2 className="sec-label label" id="svc-work-h">
            Work
          </h2>
          <WorkGrid projects={projectsFor(s.slug).slice(0, serviceWorkCount)} />
          <p className="more">
            <Link href={`/work#${s.slug}`}>{workPage.more}</Link>
          </p>
        </div>
      </section>

      <Contact source={`elorro.com/services/${s.slug}`} />
    </Page>
  );
}
