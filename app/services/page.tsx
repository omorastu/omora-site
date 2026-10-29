import type { Metadata } from "next";
import Link from "next/link";
import { services, servicesPage } from "@/lib/kozmoz";
import { Page } from "@/components/kozmoz/page";
import { ServiceRow } from "@/components/kozmoz/services";

export const metadata: Metadata = {
  title: "Services — Elorro",
  description:
    "Websites, photo and video, getting found on Google, and the phones, booking and follow-up behind it, for local businesses around the Bay. What each one includes, and how a project starts.",
};

/**
 * /services — the home page's four services, each a section of its own
 * (/services#websites, …) with what's included, then how a project starts.
 * On the home page's grid, below a title as /work has. Copy in lib/kozmoz.ts.
 */
export default function ServicesPage() {
  const { start } = servicesPage;

  return (
    <Page>
      <div className="page-top">
        <div className="wrap">
          <h1 className="sec-label label">{servicesPage.title}</h1>
        </div>
      </div>

      {services.map((s) => (
        <ServiceRow key={s.id} service={s} />
      ))}

      <section className="start sec" id="how" aria-labelledby="how-h">
        <div className="wrap">
          <h2 className="sec-h start-h" id="how-h">
            {start.title}
          </h2>
          <ol className="steps">
            {start.steps.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-n label" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="start-note">{start.note}</p>
          <p className="start-act">
            <Link className="act" href={start.cta.href}>
              {start.cta.label}
            </Link>
          </p>
        </div>
      </section>
    </Page>
  );
}
