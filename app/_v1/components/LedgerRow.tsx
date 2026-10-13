"use client";

import type { Project } from "@/lib/projects";
import { VerifiedRing } from "./RingsMark";
import { CornerBrackets } from "./CornerBrackets";
import { track } from "@vercel/analytics";

function RowContent({ p }: { p: Project }) {
  return (
    <>
      <div>
        <div className="text-ink font-medium">{p.name}</div>
        <div className="text-xs text-muted">{p.category}</div>
      </div>
      <div className="text-sm text-muted">{p.detail}</div>
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="font-mono text-xs text-brass">{p.result}</span>
        {p.verified ? (
          <span className="flex items-center gap-1.5 text-xs text-muted group-hover:text-teal transition-colors whitespace-nowrap">
            <VerifiedRing className="w-5 h-5 opacity-0 -rotate-45 scale-75 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100 transition-all duration-300" />
            LIVE ↗
          </span>
        ) : (
          <span className="text-xs text-muted/60 whitespace-nowrap italic">
            link pending
          </span>
        )}
      </div>
    </>
  );
}

const rowClass =
  "group grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2 sm:gap-6 py-5 px-4 -mx-4 rounded-lg border-l-2 border-transparent transition-all duration-300";

export default function LedgerRow({ p }: { p: Project }) {
  if (p.verified) {
    return (
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("project_link_click", { project: p.name })}
        className={`${rowClass} corner-frame hover:border-teal hover:bg-raised/50 hover:shadow-[0_0_24px_-8px_rgba(18,174,219,0.2)] cursor-pointer`}
      >
        <CornerBrackets />
        <RowContent p={p} />
      </a>
    );
  }

  return (
    <div className={`${rowClass} opacity-70`}>
      <RowContent p={p} />
    </div>
  );
}
