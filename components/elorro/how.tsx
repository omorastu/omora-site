import { servicesPage } from "@/lib/elorro";
import { ChapterMark } from "@/components/elorro/marks";

/**
 * How it starts: the call, the one-page plan, the shoot and the build, three
 * stops on one gold line (across on wide screens, down the left on phones),
 * then the note on prices and the way to book. On the home page and at the
 * foot of /services; `href` is where its button goes from the page it's on.
 */
export function HowItStarts({ n, href = "#contact" }: { n?: string; href?: string }) {
  const { start } = servicesPage;
  return (
    <section className="how chap" id="how" aria-labelledby="how-h">
      <div className="wrap">
        <ChapterMark n={n} label={start.title} id="how-h" />
        <ol className="how-line">
          {start.steps.map((step, i) => (
            <li key={step.title} className="how-stop">
              <span className="how-dot" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-text">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="how-note">{start.note}</p>
        <p className="how-act">
          <a className="act" href={href}>
            {start.cta.label}
          </a>
        </p>
      </div>
    </section>
  );
}
