"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

export function TrackedLink({
  href,
  event,
  data,
  className,
  style,
  children,
  external,
}: {
  href: string;
  event: string;
  data?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        onClick={() => track(event, data)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} onClick={() => track(event, data)}>
      {children}
    </Link>
  );
}
