import { contact, people, sectionLabel } from "@/lib/elorro";
import { ContactForm } from "@/components/elorro/contact-form";
import { ChapterMark } from "@/components/elorro/marks";

/**
 * Contact, back on the black the site opened on: the line, the promise of a
 * call with just the two of us, signed by both, and beside it the form. A
 * case study or a service's page heads it with its own question (`title`,
 * `lede`) and files its leads under its own `source`.
 */
export function Contact({
  title = contact.title,
  lede = contact.lede,
  source,
  n,
}: {
  title?: string;
  lede?: string;
  source?: string;
  n?: string;
}) {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <div className="wrap">
        <ChapterMark n={n} label={sectionLabel("#contact") ?? "Contact"} as="p" className="mark--night" />
        <div className="contact-grid">
          <div className="contact-head">
            <h2 className="contact-h" id="contact-h">
              {title}
            </h2>
            <p className="contact-lede">{lede}</p>
            <p className="contact-sign">
              {people.a.name} <span className="gold">&amp;</span> {people.j.name}
            </p>
          </div>
          <ContactForm source={source} />
        </div>
      </div>
    </section>
  );
}
