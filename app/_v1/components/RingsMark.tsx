export function RingsMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" className="text-brass" />
      <circle cx="30" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" className="text-teal" />
    </svg>
  );
}

/** Small rotating verified-badge version used on hover states — circles
    "draw themselves in" via stroke-dashoffset (see .verified-ring in
    globals.css) instead of just fading, so it reads as a seal being
    stamped rather than an icon appearing. */
export function VerifiedRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`verified-ring ${className}`} aria-hidden="true">
      <circle cx="9" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.6" className="text-brass" />
      <circle cx="15" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.6" className="text-teal" />
    </svg>
  );
}
