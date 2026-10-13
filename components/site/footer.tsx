/**
 * Footer. The wordmark and the service area on the left; the site's routes and
 * the legal pages on the right, plus the address a lead can fall back to when
 * the form is down (the API tells them to use it).
 */
const ROUTES = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/team", label: "Team" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="layer border-t border-line/60 px-6 py-14">
      <div className="mx-auto flex max-w-wrap flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-logo text-lg font-normal uppercase tracking-[0.35em] text-ink">
            Omora
          </p>
          <p className="mt-3 max-w-[44ch] text-pretty text-sm leading-relaxed text-muted">
            Serving Dublin, Pleasanton, Livermore, Danville, San Ramon, Hayward,
            Fremont and the surrounding East Bay.
          </p>
          <a
            href="mailto:studio.omora@gmail.com"
            className="mt-4 inline-block font-mono text-sm text-violet transition-colors hover:text-ink"
          >
            studio.omora@gmail.com
          </a>
        </div>

        <nav aria-label="Footer" className="flex gap-12 sm:gap-16">
          <ul className="flex flex-col gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {ROUTES.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2 text-muted/50">© {new Date().getFullYear()} Omora</li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
