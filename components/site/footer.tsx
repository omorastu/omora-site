import { Wordmark } from "@/components/wordmark";

/**
 * Footer, per docs/layout.md: the wordmark on the left; Instagram, Terms and
 * Privacy on the right.
 *
 * INSTAGRAM is unset until the Omora handle is final — the label prints
 * unlinked meanwhile rather than pointing at someone's personal account.
 */
const INSTAGRAM: string | undefined = undefined;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const linkClass = "text-muted/80 transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer className="layer border-t border-line px-6 py-11">
      <div className="mx-auto flex max-w-wrap flex-wrap items-center justify-between gap-6">
        <a
          href="/"
          className="text-[17px] text-muted transition-colors hover:text-ink"
        >
          <Wordmark />
        </a>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-7 font-mono text-[11px] uppercase tracking-[0.1em]">
            <li>
              {INSTAGRAM ? (
                <a href={INSTAGRAM} className={linkClass} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              ) : (
                <span className="text-muted/50" title="Handle to come">
                  Instagram
                </span>
              )}
            </li>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={linkClass}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
