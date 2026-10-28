import { contact } from "@/lib/kozmoz";
import { ContactForm } from "@/components/kozmoz/contact-form";

/** Contact: the line, the promise of a straight answer, and the form. */
export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <h2 className="say across" id="contact-h">
        {contact.title}
      </h2>
      <p className="contact-lede across">{contact.lede}</p>
      <ContactForm />
    </section>
  );
}
