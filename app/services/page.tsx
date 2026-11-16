import type { Metadata } from "next";
import { services, servicesPage } from "@/lib/elorro";
import { Page } from "@/components/elorro/page";
import { ServiceRow } from "@/components/elorro/services";
import { HowItStarts } from "@/components/elorro/how";

export const metadata: Metadata = {
  title: "Services — Elorro",
  description:
    "Websites and getting found on Google and in AI search, photo and video, phones, booking and follow-up, and custom tools, for local businesses around the Bay. What each one includes, and how a project starts.",
};

/**
 * /services — the four services, each a chapter of its own (/services#<slug>)
 * with all that comes with it, a piece of its work playing and the way to its
 * own page; under the title, the four as a short contents list. Then how a
 * project starts. Copy in lib/elorro.ts.
 */
export default function ServicesPage() {
  return (
    <Page>
      <header className="page-head">
        <div className="wrap">
          <h1 className="page-title">{servicesPage.title}</h1>
          <ol className="contents">
            {services.map((s, i) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`}>
                  <span className="contents-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title.replace(/\.$/, "")}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </header>

      {services.map((s, i) => (
        <ServiceRow key={s.slug} service={s} n={i + 1} flip={i % 2 === 1} />
      ))}

      <HowItStarts href={servicesPage.start.cta.href} />
    </Page>
  );
}
