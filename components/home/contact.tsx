import { contact } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { ContactForm } from "@/components/home/contact-form";

/**
 * Contact: heading and the text-us line on the left, the three-field form on
 * the right. `id="contact"` is where every "Start a project" on the site
 * lands.
 *
 * The text-us number prints once it's set in lib/home.ts; until then the slot
 * shows the mockup's bracketed placeholder rather than a fake number.
 *
 * Case studies close on it too, with their own question as the heading and
 * their own page as the lead's source. Left unset, everything is the home
 * page's.
 */
export function Contact({
  title = contact.title,
  lede = contact.lede,
  source,
}: {
  title?: string;
  lede?: string;
  /** Where the lead is filed as coming from. ContactForm defaults to the home page. */
  source?: string;
}) {
  const { phone } = contact;

  return (
    <section
      id="contact"
      className="layer scroll-mt-16 border-t border-line bg-band px-6 py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-wrap gap-12 md:grid-cols-2 md:gap-16 lg:gap-[72px]">
        <Reveal>
          <p className="plate">{contact.eyebrow}</p>
          <h2 className="mt-5 max-w-[16ch] text-balance font-display text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[42px]">
            {title}
          </h2>
          <p className="mt-5 max-w-[44ch] text-pretty text-[17px] leading-[1.7] text-muted">
            {lede}
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted/80">
              {contact.textLabel}
            </p>
            {phone ? (
              <a
                href={`sms:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-2.5 inline-block font-display text-2xl font-semibold text-violet transition-colors hover:text-ink"
              >
                {phone}
              </a>
            ) : (
              <p
                role="note"
                aria-label="Text number — not yet supplied"
                className="mt-2.5 font-display text-2xl font-semibold text-violet/50"
              >
                [ 925 · 000 · 0000 ]
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ContactForm submitLabel={contact.submit} source={source} />
        </Reveal>
      </div>
    </section>
  );
}
