import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-wrap mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <div className="font-logo text-lg text-ink uppercase tracking-[0.3em]">Omora</div>
          <p className="text-sm text-muted mt-2 max-w-xs">
            Websites and the systems behind them. Built by a small team, not
            an app — every project on this site is live.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 md:gap-16 text-sm">
          <div>
            <div className="text-ink mb-3">Contact</div>
            <ul className="space-y-2 text-muted">
              <li>
                <a href="mailto:studio.omora@gmail.com" className="hover:text-teal transition-colors">
                  studio.omora@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/jdlo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-ink mb-3">Legal</div>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/terms" className="hover:text-teal transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-wrap mx-auto px-6 md:px-8 pb-8 text-xs text-muted">
        © {new Date().getFullYear()} Omora. All rights reserved.
      </div>
    </footer>
  );
}
