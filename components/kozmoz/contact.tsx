import { contact } from "@/lib/kozmoz";
import { ContactForm } from "@/components/kozmoz/contact-form";

/**
 * Contact: the line, the promise of a straight answer, and the form. A case
 * study heads it with its own question (`title`, `lede`) and files its leads
 * under its own `source`.
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
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <h2 className="say across" id="contact-h">
        {title}
      </h2>
      <p className="contact-lede across">{lede}</p>
      <ContactForm source={source} />
    </section>
  );
}
