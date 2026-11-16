import Link from "next/link";
import { serviceWorkCount, services, servicesPage, workPage, type Service } from "@/lib/elorro";
import { Page } from "@/components/elorro/page";
import { Contact } from "@/components/elorro/contact";
import { ChapterMark } from "@/components/elorro/marks";
import { WorkGrid, projectsFor } from "@/components/elorro/work";

/**
 * A service's own page, /services/<slug> (app/services/[slug]): its number
 * and title under the way back to What we do, the short intro and all that
 * comes with it; then how we do it, one step at a time down a gold line,
 * each with its large number; its work, as the home page's pieces; and the
 * contact chapter. Copy in lib/elorro.ts (`services`).
 */
export function ServicePage({ service: s }: { service: Service }) {
  const n = String(services.indexOf(s) + 1).padStart(2, "0");
  return (
    // The bar's Contact link stays on the page: it ends in its own form.
    <Page local={["#contact"]}>
      <header className="page-head page-head--svc">
        <div className="wrap">
          <p className="crumb label">
            <Link href="/services">{servicesPage.title}</Link> <span aria-hidden="true">/</span> {n}
          </p>
          <h1 className="page-title">{s.title}</h1>
          <div className="svc-intro-grid">
            <p className="svc-intro">{s.page.intro}</p>
            <ul className="ticks">
              {s.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section className="steps chap" aria-labelledby="how-h">
        <div className="wrap">
          <ChapterMark label="How we do it" id="how-h" />
          <ol className="steps-list">
            {s.page.steps.map((step, i) => (
              <li key={step.kind} className="step">
                <p className="step-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="step-text">
                  <p className="step-kind label">{step.kind}</p>
                  <h3 className="step-h">{step.heading}</h3>
                  <p className="step-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="svc-work chap" aria-labelledby="svc-work-h">
        <div className="wrap">
          <ChapterMark label={workPage.title} id="svc-work-h" />
          <WorkGrid projects={projectsFor(s.slug).slice(0, serviceWorkCount)} />
          <p className="more more--center">
            <Link href={`/work#${s.slug}`}>{workPage.more}</Link>
          </p>
        </div>
      </section>

      <Contact source={`elorro.com/services/${s.slug}`} />
    </Page>
  );
}
