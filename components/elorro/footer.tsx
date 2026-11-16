import Image from "next/image";
import Link from "next/link";
import { brand, hero, menu, people } from "@/lib/elorro";

/**
 * The foot of every page, on the black that Contact sets: the logo with its
 * runners, large; the pages, how to reach us and who we are, in three short
 * columns; and the small print on a line of its own.
 */
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="foot-logo">
          <Image src="/m/brand/elorro-logo.png" alt={brand.name} width={1695} height={287} sizes="(max-width: 1023px) 86vw, 44vw" />
        </p>
        <div className="foot-cols">
          <nav className="foot-col" aria-label="Pages">
            <p className="label">Pages</p>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              {menu.pages.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="foot-col">
            <p className="label">Talk to us</p>
            <ul>
              <li>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li>
                <Link href="/#contact">{hero.cta.label}</Link>
              </li>
              <li className="foot-where">{brand.where}</li>
            </ul>
          </div>
          <div className="foot-col">
            <p className="label">The two of us</p>
            <ul>
              <li>
                {people.a.name} {people.a.last}
              </li>
              <li>
                {people.j.name} {people.j.last}
              </li>
            </ul>
          </div>
        </div>
        <p className="foot-base">
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
