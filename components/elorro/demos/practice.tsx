import { hanken } from "@/components/elorro/fonts";
import "@/components/elorro/demos/practice.css";

/**
 * Brightline Orthodontics: a concept site for a made-up practice (app/demos/
 * practice), the one the film's dental walkthrough shows as "Concept site".
 * A real practice's site in every part a visitor would expect (the header
 * and its Book a consult, the treatments, a first visit, the team, where and
 * when, questions, and the form), but with no one's face anywhere: its
 * pictures are drawn (rooms, an arch of teeth, a map), lit like photographs.
 * The practice, the people, the address and the numbers are all made up, and
 * the footer says so. No prices, and no promises about treatment.
 *
 * Static on purpose: nothing moves by itself, so the capture
 * (video/scripts/film-capture.mjs) shoots exactly what the page shows.
 */

const NAV = ["Treatments", "Your first visit", "Our team", "Visit us", "FAQ"];
const PHONE = "(555) 014-2271";

export function PracticeSite() {
  return (
    <div className={`bl-site ${hanken.variable}`}>
      <p className="bl-notice">
        Now welcoming new patients<span className="bl-notice-more"> · Evening appointments on Tuesdays and Thursdays</span>
      </p>
      <header className="bl-header">
        <div className="bl-wrap bl-header-in">
          <a className="bl-brand" href="#top" aria-label="Brightline Orthodontics, home">
            <Mark />
            <span className="bl-brand-name">
              Brightline <span>Orthodontics</span>
            </span>
          </a>
          <nav className="bl-nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, "-")}`}>
                {n}
              </a>
            ))}
          </nav>
          <div className="bl-header-end">
            <a className="bl-tel" href="#visit-us">
              {PHONE}
            </a>
            <a className="bl-btn bl-btn--small" href="#book">
              Book a consult
            </a>
            <span className="bl-menu" aria-hidden="true">
              <i />
              <i />
            </span>
          </div>
        </div>
      </header>

      <main id="top">
        {/* The hero. */}
        <section className="bl-hero">
          <div className="bl-wrap bl-hero-in">
            <div className="bl-hero-copy">
              <p className="bl-eyebrow">Orthodontics for kids, teens and adults</p>
              <h1>Straight answers, and a smile you’ll love to show.</h1>
              <p className="bl-lead">Braces and clear aligners in a calm, bright studio, with a plan you understand before anything starts.</p>
              <div className="bl-actions">
                <a className="bl-btn" href="#book">
                  Book a consult
                </a>
                <a className="bl-link" href="#treatments">
                  See treatments <Arrow />
                </a>
              </div>
              <ul className="bl-facts">
                <li>Evening &amp; Saturday visits</li>
                <li>Kids, teens &amp; adults</li>
                <li>Benefits checked before you come</li>
              </ul>
            </div>
            <figure className="bl-photo bl-hero-photo">
              <TreatmentRoom />
              <figcaption>Our treatment studio, Harbor Lane</figcaption>
            </figure>
          </div>
        </section>

        {/* Treatments. */}
        <section className="bl-section" id="treatments">
          <div className="bl-wrap">
            <div className="bl-head">
              <p className="bl-eyebrow">Treatments</p>
              <h2>Every option, explained simply.</h2>
              <p className="bl-sub">We’ll show you what each one involves and how long it usually takes, then you choose.</p>
            </div>
            <div className="bl-cards">
              <Treatment art="aligners" title="Clear aligners" text="Clear, removable trays, changed every few weeks. Most people won’t notice you’re wearing them." />
              <Treatment art="braces" title="Braces" text="Metal or tooth-coloured brackets, adjusted at short visits. A dependable choice at any age." />
              <Treatment art="early" title="Early checks" text="A first look for children, usually around age seven. Often it’s just a check-in, and a plan for later." />
              <Treatment art="retainers" title="Retainers & aftercare" text="Fixed or removable retainers, and follow-up visits, to keep your new smile where it belongs." />
            </div>
          </div>
        </section>

        {/* The first visit. */}
        <section className="bl-section bl-section--tint" id="your-first-visit">
          <div className="bl-wrap bl-visit">
            <figure className="bl-photo bl-visit-photo">
              <Reception />
              <figcaption>The front desk and waiting room</figcaption>
            </figure>
            <div>
              <p className="bl-eyebrow">Your first visit</p>
              <h2>About an hour, and nothing you have to decide that day.</h2>
              <ol className="bl-steps">
                <li>
                  <span className="bl-step-n">1</span>
                  <div>
                    <h3>Say hello</h3>
                    <p>We check you in, show you around and answer the first questions over a cup of something.</p>
                  </div>
                </li>
                <li>
                  <span className="bl-step-n">2</span>
                  <div>
                    <h3>A quick 3D scan</h3>
                    <p>No trays of putty: a small wand takes a picture of your teeth in a few minutes.</p>
                  </div>
                </li>
                <li>
                  <span className="bl-step-n">3</span>
                  <div>
                    <h3>Your plan, in plain words</h3>
                    <p>The orthodontist walks you through your options, side by side, and what each one asks of you.</p>
                  </div>
                </li>
                <li>
                  <span className="bl-step-n">4</span>
                  <div>
                    <h3>Start when you’re ready</h3>
                    <p>Take the plan home. We check your benefits and hold a start date while you think it over.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* The team. */}
        <section className="bl-section" id="our-team">
          <div className="bl-wrap">
            <div className="bl-head bl-head--row">
              <div>
                <p className="bl-eyebrow">Our team</p>
                <h2>The people you’ll see.</h2>
              </div>
              <p className="bl-sub">The same small team at every visit, so you never have to explain yourself twice.</p>
            </div>
            <div className="bl-team">
              <Person initials="ME" name="Dr. Maya Ellison" role="Orthodontist" tone="a" />
              <Person initials="OH" name="Dr. Owen Hart" role="Orthodontist" tone="b" />
              <Person initials="PN" name="Priya Nand" role="Treatment coordinator" tone="c" />
              <Person initials="LO" name="Luis Ortega" role="Front desk" tone="d" />
            </div>
          </div>
        </section>

        {/* Where and when. */}
        <section className="bl-section bl-section--tint" id="visit-us">
          <div className="bl-wrap bl-where">
            <figure className="bl-map">
              <MapArt />
            </figure>
            <div className="bl-where-copy">
              <p className="bl-eyebrow">Visit us</p>
              <h2>On Harbor Lane, by the park.</h2>
              <address>
                1180 Harbor Lane, Suite 200
                <br />
                Lakeview
              </address>
              <dl className="bl-hours">
                <div>
                  <dt>Monday – Wednesday</dt>
                  <dd>8:00 – 5:00</dd>
                </div>
                <div>
                  <dt>Tuesday &amp; Thursday</dt>
                  <dd>8:00 – 7:00</dd>
                </div>
                <div>
                  <dt>Friday</dt>
                  <dd>8:00 – 2:00</dd>
                </div>
                <div>
                  <dt>Saturday</dt>
                  <dd>Twice a month, 9:00 – 1:00</dd>
                </div>
              </dl>
              <p className="bl-small">Free parking behind the building. Step-free entrance and lift to the second floor.</p>
            </div>
          </div>
        </section>

        {/* Questions. */}
        <section className="bl-section" id="faq">
          <div className="bl-wrap bl-faq">
            <div>
              <p className="bl-eyebrow">FAQ</p>
              <h2>Good questions.</h2>
            </div>
            <div className="bl-qs">
              <details open>
                <summary>Do I need a referral from my dentist?</summary>
                <p>No. Anyone can book a consult with us directly, and we’ll keep your dentist in the loop if you’d like.</p>
              </details>
              <details>
                <summary>Do you see adults?</summary>
              </details>
              <details>
                <summary>Will you check my insurance benefits?</summary>
              </details>
              <details>
                <summary>What should I bring to the first visit?</summary>
              </details>
            </div>
          </div>
        </section>

        {/* Book a consult: the form. */}
        <section className="bl-section bl-book" id="book">
          <div className="bl-wrap bl-book-in">
            <div className="bl-book-copy">
              <h2>Book a consult</h2>
              <p className="bl-sub">Tell us who it’s for and when suits you. We’ll call to find a time, usually the same day.</p>
              <ul className="bl-book-list">
                <li>About an hour, start to finish</li>
                <li>A 3D scan, no putty</li>
                <li>Your options, side by side</li>
              </ul>
            </div>
            <form className="bl-form" aria-label="Book a consult">
              <div className="bl-row">
                <label className="bl-field">
                  <span>Your name</span>
                  <input type="text" name="name" autoComplete="off" placeholder="First and last name" />
                </label>
                <label className="bl-field">
                  <span>Phone</span>
                  <input type="tel" name="phone" autoComplete="off" placeholder="(555) 000-0000" />
                </label>
              </div>
              <label className="bl-field">
                <span>Email</span>
                <input type="email" name="email" autoComplete="off" placeholder="you@example.com" />
              </label>
              <fieldset className="bl-field bl-choice">
                <legend>Who is the consult for?</legend>
                <div className="bl-seg">
                  <span className="is-on">Me</span>
                  <span>My child</span>
                  <span>Not sure yet</span>
                </div>
              </fieldset>
              <fieldset className="bl-field bl-choice">
                <legend>Best time to call</legend>
                <div className="bl-chips">
                  <span>Mornings</span>
                  <span className="is-on">Afternoons</span>
                  <span>Evenings</span>
                </div>
              </fieldset>
              <label className="bl-field">
                <span>Anything we should know? (optional)</span>
                <textarea name="note" rows={3} placeholder="Questions, or what you’d like to change." />
              </label>
              <div className="bl-submit">
                <button type="button" className="bl-btn">
                  Request a consult
                </button>
                <p className="bl-small">We’ll reply within one business day.</p>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bl-footer">
        <div className="bl-wrap bl-footer-in">
          <div className="bl-footer-brand">
            <span className="bl-brand">
              <Mark light />
              <span className="bl-brand-name">
                Brightline <span>Orthodontics</span>
              </span>
            </span>
            <p>1180 Harbor Lane, Suite 200, Lakeview</p>
            <p>{PHONE}</p>
          </div>
          <div className="bl-footer-links">
            {NAV.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
        <div className="bl-wrap">
          <p className="bl-concept">A concept site by Elorro. Brightline Orthodontics, its people, address and numbers are made up.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Small parts ───────────────────────────────────────────────────────── */

/** The practice's mark: a line of light rising over an arch. */
function Mark({ light }: { light?: boolean }) {
  return (
    <svg className="bl-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="12" fill={light ? "#F4EFE6" : "#1D5C63"} />
      <path d="M10 26c3-6.5 6.4-9.5 10-9.5s7 3 10 9.5" fill="none" stroke={light ? "#1D5C63" : "#F4EFE6"} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="11.5" r="2.6" fill="#E9A07F" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Treatment({ art, title, text }: { art: "aligners" | "braces" | "early" | "retainers"; title: string; text: string }) {
  return (
    <article className="bl-card">
      <div className={`bl-card-art bl-card-art--${art}`}>
        <ArchArt kind={art} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="bl-link bl-link--small">
        Learn more <Arrow />
      </span>
    </article>
  );
}

function Person({ initials, name, role, tone }: { initials: string; name: string; role: string; tone: "a" | "b" | "c" | "d" }) {
  return (
    <article className="bl-person">
      <div className={`bl-person-art bl-person-art--${tone}`} aria-hidden="true">
        <svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMid slice">
          <circle cx="250" cy="40" r="120" fill="#fff" opacity=".16" />
          <path d="M-20 300c80-90 170-120 340-80v140H-20z" fill="#fff" opacity=".12" />
          <path d="M84 296c20-32 42-47 66-47s46 15 66 47" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <span>{initials}</span>
      </div>
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  );
}

/* ── Pictures: drawn, and lit like photographs ─────────────────────────── */

/** A tooth arch seen from below (front teeth at the top): `n` teeth along a half ellipse, bigger towards the back. */
function teeth(cx: number, cy: number, rx: number, ry: number, n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.PI + (Math.PI * (i + 0.5)) / n;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    const back = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
    const w = 15 + back * 11;
    const h = 17 + back * 6;
    const deg = (a * 180) / Math.PI + 90;
    return { x, y, w, h, deg };
  });
}

function ArchArt({ kind }: { kind: "aligners" | "braces" | "early" | "retainers" }) {
  const T = teeth(160, 168, 92, 104);
  const id = `bl-arch-${kind}`;
  return (
    <svg viewBox="0 0 320 220" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-bg`} cx="35%" cy="25%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-tooth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#ECE6DC" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="320" height="220" fill={`url(#${id}-bg)`} />
      {/* The shadow under it, soft, as on a table. */}
      <ellipse cx="160" cy="196" rx="110" ry="12" fill="#1D3B40" opacity=".12" filter={`url(#${id}-soft)`} />
      {kind === "early" && (
        <g opacity=".9">
          <circle cx="60" cy="58" r="16" fill="#F4C9A8" />
          <circle cx="268" cy="70" r="10" fill="#BFDCD6" />
          <rect x="246" y="150" width="28" height="28" rx="8" fill="#F1DFA8" transform="rotate(14 260 164)" />
          <path d="M44 160l10-18 10 18z" fill="#E9A07F" opacity=".8" />
        </g>
      )}
      <g transform={kind === "early" ? "translate(160 120) scale(.78) translate(-160 -120)" : undefined}>
        {/* The gum's arch. */}
        <path d="M66 172c0-62 42-110 94-110s94 48 94 110" fill="none" stroke="#E7B8AE" strokeWidth="38" strokeLinecap="round" opacity=".55" />
        {T.map((t, i) => (
          <rect
            key={i}
            x={t.x - t.w / 2}
            y={t.y - t.h / 2}
            width={t.w}
            height={t.h}
            rx={Math.min(t.w, t.h) * 0.42}
            fill={`url(#${id}-tooth)`}
            stroke="#D9D1C4"
            strokeWidth=".8"
            transform={`rotate(${t.deg.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)})`}
          />
        ))}
        {kind === "braces" && (
          <>
            <path d="M74 166c2-56 40-98 86-98s84 42 86 98" fill="none" stroke="#8C9AA0" strokeWidth="1.6" />
            {T.map((t, i) => (
              <rect key={i} x={t.x - 4} y={t.y - 4} width="8" height="8" rx="1.6" fill="#A9B4B8" stroke="#7B878C" strokeWidth=".7" transform={`rotate(${t.deg.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)})`} />
            ))}
          </>
        )}
        {kind === "aligners" && (
          <path d="M60 176c0-68 44-120 100-120s100 52 100 120" fill="none" stroke="#CFE6EE" strokeWidth="34" strokeLinecap="round" opacity=".55" />
        )}
        {kind === "retainers" && (
          <>
            <path d="M80 160c4-50 38-86 80-86s76 36 80 86" fill="none" stroke="#9AA6AA" strokeWidth="2" />
            <path d="M80 160c-10 14-8 30 8 36M240 160c10 14 8 30-8 36" fill="none" stroke="#9AA6AA" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The treatment studio: daylight from a tall window, a sage chair, oak slats, a plant; soft depth like a photograph. */
function TreatmentRoom() {
  return (
    <svg viewBox="0 0 640 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bl-room-wall" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#F7F3EC" />
          <stop offset="1" stopColor="#E7DFD2" />
        </linearGradient>
        <linearGradient id="bl-room-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCC8AA" />
          <stop offset="1" stopColor="#C9B08C" />
        </linearGradient>
        <linearGradient id="bl-room-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE3E8" />
          <stop offset="1" stopColor="#EEF3EC" />
        </linearGradient>
        <linearGradient id="bl-room-oak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C9A57C" />
          <stop offset=".5" stopColor="#D8B993" />
          <stop offset="1" stopColor="#B89169" />
        </linearGradient>
        <linearGradient id="bl-room-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9DB7A6" />
          <stop offset="1" stopColor="#6F8E7B" />
        </linearGradient>
        <radialGradient id="bl-room-light" cx="22%" cy="40%" r="70%">
          <stop offset="0" stopColor="#FFF8E8" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFF8E8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bl-room-vignette" cx="50%" cy="48%" r="75%">
          <stop offset=".6" stopColor="#2B2118" stopOpacity="0" />
          <stop offset="1" stopColor="#2B2118" stopOpacity=".22" />
        </radialGradient>
        <filter id="bl-far" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="bl-near" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="bl-grain">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .08 0" />
        </filter>
      </defs>
      {/* The room. */}
      <rect width="640" height="520" fill="url(#bl-room-wall)" />
      <path d="M0 392h640v128H0z" fill="url(#bl-room-floor)" />
      <path d="M0 392h640" stroke="#BFA98A" strokeWidth="2" opacity=".6" />
      {/* The window, and the trees beyond it, out of focus. */}
      <g>
        <rect x="46" y="54" width="214" height="320" rx="4" fill="url(#bl-room-sky)" />
        <g filter="url(#bl-far)">
          <ellipse cx="96" cy="300" rx="70" ry="60" fill="#9DBB93" />
          <ellipse cx="196" cy="282" rx="80" ry="72" fill="#86A97F" />
          <ellipse cx="150" cy="330" rx="110" ry="40" fill="#A9C39C" />
          <ellipse cx="226" cy="160" rx="30" ry="40" fill="#B9CFAF" opacity=".7" />
        </g>
        <rect x="46" y="54" width="214" height="320" rx="4" fill="none" stroke="#FBF9F5" strokeWidth="10" />
        <path d="M153 54v320M46 214h214" stroke="#FBF9F5" strokeWidth="6" />
      </g>
      {/* Daylight on the wall and floor. */}
      <rect width="640" height="520" fill="url(#bl-room-light)" />
      <path d="M60 392l200 0 150 128H-40z" fill="#FFF6E2" opacity=".35" />
      {/* Oak slats. */}
      <g>
        <rect x="438" y="0" width="202" height="392" fill="#D2B48E" />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={442 + i * 15.5} y="0" width="10" height="392" fill="url(#bl-room-oak)" opacity=".9" />
        ))}
        <rect x="438" y="0" width="202" height="392" fill="#3A2A1A" opacity=".08" />
      </g>
      {/* A cabinet, and a plant on it. */}
      <g filter="url(#bl-near)">
        <rect x="470" y="300" width="160" height="96" rx="4" fill="#F7F4EE" />
        <rect x="466" y="292" width="168" height="12" rx="3" fill="#C59F74" />
        <path d="M550 304v92" stroke="#E4DDD2" strokeWidth="2" />
        <rect x="520" y="340" width="20" height="3" rx="1.5" fill="#C7BDAF" />
        <rect x="560" y="340" width="20" height="3" rx="1.5" fill="#C7BDAF" />
        <path d="M584 292l6-40h28l6 40z" fill="#E9E2D6" />
        {[
          [604, 250, -30],
          [596, 236, -55],
          [612, 228, 10],
          [622, 240, 35],
          [590, 216, -70],
          [616, 208, -10],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="9" ry="26" fill={i % 2 ? "#5E8A63" : "#6F9B70"} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
      {/* The overhead light on its arm. */}
      <g>
        <path d="M330 0v62l60 26" fill="none" stroke="#D9D4CC" strokeWidth="7" strokeLinecap="round" />
        <rect x="372" y="78" width="64" height="26" rx="13" fill="#F3F1EC" stroke="#D8D2C8" strokeWidth="2" />
        <ellipse cx="404" cy="100" rx="22" ry="4" fill="#FFF9E6" />
      </g>
      {/* The chair. */}
      <g>
        <ellipse cx="350" cy="446" rx="150" ry="16" fill="#5B4632" opacity=".18" />
        <rect x="320" y="372" width="56" height="70" rx="10" fill="#D9D6D0" />
        <rect x="300" y="432" width="96" height="16" rx="8" fill="#CFCBC4" />
        <path d="M206 300c10-14 40-20 80-20h150c22 0 34 10 40 24l18 46c4 10-2 20-14 20H270c-34 0-64-12-70-34z" fill="url(#bl-room-seat)" />
        <path d="M214 308c-16-30-30-74-30-100 0-14 8-22 22-22h10c12 0 20 8 24 20l28 92z" fill="url(#bl-room-seat)" />
        <rect x="176" y="150" width="50" height="34" rx="14" fill="#8EAA98" />
        <path d="M222 312h236" stroke="#5D7A68" strokeWidth="2" opacity=".5" />
        <rect x="460" y="330" width="56" height="12" rx="6" fill="#7C9B88" />
        {/* The tray arm. */}
        <path d="M286 270l-6-84 66-10" fill="none" stroke="#D3CEC6" strokeWidth="6" strokeLinecap="round" />
        <rect x="320" y="160" width="74" height="14" rx="7" fill="#EFECE6" stroke="#D3CEC6" strokeWidth="2" />
      </g>
      {/* A photograph's last touches: the fall-off at the edges, and grain. */}
      <rect width="640" height="520" fill="url(#bl-room-vignette)" />
      <rect width="640" height="520" filter="url(#bl-grain)" />
    </svg>
  );
}

/** The front desk and waiting room: an arched mirror, pendant lights, a long bench, a plant. */
function Reception() {
  return (
    <svg viewBox="0 0 640 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bl-rec-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6EEEA" />
          <stop offset="1" stopColor="#D3E0DA" />
        </linearGradient>
        <linearGradient id="bl-rec-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2D3BC" />
          <stop offset="1" stopColor="#CDB894" />
        </linearGradient>
        <linearGradient id="bl-rec-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6F2EA" />
          <stop offset="1" stopColor="#E6DED1" />
        </linearGradient>
        <linearGradient id="bl-rec-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F6F4" />
          <stop offset=".55" stopColor="#C9D8D2" />
          <stop offset="1" stopColor="#E7EFEB" />
        </linearGradient>
        <radialGradient id="bl-rec-glow" cx="50%" cy="0%" r="60%">
          <stop offset="0" stopColor="#FFF4D9" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFF4D9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bl-rec-vignette" cx="50%" cy="45%" r="75%">
          <stop offset=".6" stopColor="#1F2B28" stopOpacity="0" />
          <stop offset="1" stopColor="#1F2B28" stopOpacity=".2" />
        </radialGradient>
        <filter id="bl-rec-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="bl-rec-grain">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .5  0 0 0 0 .48  0 0 0 .07 0" />
        </filter>
      </defs>
      <rect width="640" height="520" fill="url(#bl-rec-wall)" />
      <path d="M0 404h640v116H0z" fill="url(#bl-rec-floor)" />
      {/* The arched mirror, the room soft in it. */}
      <g>
        <path d="M74 360V170c0-56 40-96 92-96s92 40 92 96v190z" fill="#C7A982" />
        <path d="M84 352V172c0-50 36-88 82-88s82 38 82 88v180z" fill="url(#bl-rec-mirror)" />
        <g filter="url(#bl-rec-soft)" opacity=".6">
          <rect x="120" y="250" width="110" height="70" rx="10" fill="#E9E2D6" />
          <circle cx="190" cy="150" r="22" fill="#FFF5DD" />
        </g>
      </g>
      {/* Pendant lights. */}
      {[300, 410, 520].map((x) => (
        <g key={x}>
          <path d={`M${x} 0v92`} stroke="#3B3A36" strokeWidth="1.5" />
          <path d={`M${x - 26} 118c0-16 12-28 26-28s26 12 26 28z`} fill="#D7B37A" />
          <ellipse cx={x} cy="118" rx="26" ry="4" fill="#FFF0C8" />
        </g>
      ))}
      <rect width="640" height="300" fill="url(#bl-rec-glow)" />
      {/* The front desk, curved, with the name on its face. */}
      <g>
        <path d="M290 280h330v130H290c-20 0-30-20-30-65s10-65 30-65z" fill="url(#bl-rec-desk)" />
        <path d="M282 268h346v16H282z" fill="#B8936A" />
        <path d="M398 330c10-12 22-18 34-18s24 6 34 18" fill="none" stroke="#1D5C63" strokeWidth="4" strokeLinecap="round" />
        <circle cx="432" cy="304" r="4" fill="#E9A07F" />
        <rect x="372" y="346" width="120" height="6" rx="3" fill="#1D5C63" opacity=".75" />
        {/* A screen and a vase on the counter. */}
        <rect x="540" y="226" width="56" height="40" rx="4" fill="#3A3F3E" />
        <rect x="562" y="266" width="12" height="4" fill="#3A3F3E" />
        <path d="M318 268c-4-14 0-26 8-30h10c8 4 12 16 8 30z" fill="#F2EDE4" />
        <path d="M330 240c-10-22-4-44 6-52M334 240c4-20 18-34 30-36M332 240c-14-14-30-16-40-12" fill="none" stroke="#6F9B70" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* The bench, its cushion, and a plant beside it. */}
      <g>
        <ellipse cx="150" cy="452" rx="130" ry="12" fill="#4A3A2A" opacity=".16" />
        <rect x="40" y="398" width="230" height="16" rx="6" fill="#B8936A" />
        <rect x="48" y="380" width="214" height="22" rx="10" fill="#E9B79A" />
        <rect x="56" y="414" width="10" height="36" fill="#9E7A55" />
        <rect x="244" y="414" width="10" height="36" fill="#9E7A55" />
        <path d="M20 448l8-46h40l8 46z" fill="#EDE6DA" />
        {[
          [48, 380, -24],
          [36, 360, -40],
          [56, 350, -6],
          [66, 366, 22],
          [44, 334, -14],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="10" ry="30" fill={i % 2 ? "#5E8A63" : "#719E72"} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
      <rect width="640" height="520" fill="url(#bl-rec-vignette)" />
      <rect width="640" height="520" filter="url(#bl-rec-grain)" />
    </svg>
  );
}

/** Where the practice is: the streets around Harbor Lane, the park, the river, and the pin. */
function MapArt() {
  return (
    <svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="600" height="440" fill="#ECEAE3" />
      {/* Blocks. */}
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => <rect key={`${r}-${c}`} x={c * 78 - 10} y={r * 80 - 14} width="64" height="66" rx="6" fill="#E3E0D7" />)
      )}
      {/* The park, and the river. */}
      <path d="M300 40h150v130H300z" fill="#D5E4CF" />
      <path d="M-20 360c80-40 160-30 240-60s170-40 400-30v40c-220-10-290 20-390 50s-160 30-250 60z" fill="#CFE0E6" />
      {/* Streets. */}
      <g stroke="#FFFFFF" strokeLinecap="round">
        <path d="M-10 186h620" strokeWidth="16" />
        <path d="M-10 106h620M-10 266h620" strokeWidth="9" />
        <path d="M290 -10v460" strokeWidth="14" />
        <path d="M134 -10v460M446 -10v460" strokeWidth="9" />
      </g>
      <g fill="#8A8F8A" fontSize="12" fontFamily="var(--font-hanken), system-ui, sans-serif" letterSpacing=".04em">
        <text x="24" y="180">HARBOR LANE</text>
        <text x="298" y="420" transform="rotate(-90 298 420)">
          ALDER ST
        </text>
        <text x="350" y="112">
          Lakeview Park
        </text>
      </g>
      {/* The pin. */}
      <g transform="translate(232 186)">
        <ellipse cx="0" cy="4" rx="16" ry="5" fill="#123C41" opacity=".2" />
        <path d="M0 0c-14-20-24-32-24-46a24 24 0 0 1 48 0c0 14-10 26-24 46z" fill="#1D5C63" />
        <circle cx="0" cy="-46" r="9" fill="#F4EFE6" />
      </g>
      <g transform="translate(262 120)">
        <rect width="158" height="40" rx="10" fill="#FFFFFF" />
        <text x="14" y="25" fontSize="14" fontWeight="600" fill="#17343A" fontFamily="var(--font-hanken), system-ui, sans-serif">
          Brightline Orthodontics
        </text>
      </g>
    </svg>
  );
}
