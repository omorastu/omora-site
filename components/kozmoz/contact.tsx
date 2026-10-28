import { contact, sectionLabel } from "@/lib/kozmoz";
import { ContactForm } from "@/components/kozmoz/contact-form";

/**
 * Contact: the line and the promise of a straight answer on the left, the
 * form on the right. A case study heads it with its own question (`title`,
 * `lede`) and files its leads under its own `source`.
 */
export function Contact({
  title = contact.title,
  lede = contact.lede,
  source,
}: {
  title?: string;
  lede?: string;
  source?: string;
}) {
  return (
    <section className="contact sec" id="contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="contact-head">
          <p className="sec-label label">{sectionLabel("#contact")}</p>
          <h2 className="sec-h" id="contact-h">
            {title}
          </h2>
          <p className="contact-lede">{lede}</p>
        </div>
        <ContactForm source={source} />
      </div>
    </section>
  );
}
