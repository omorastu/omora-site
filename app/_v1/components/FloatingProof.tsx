import { VerifiedRing } from "./RingsMark";
import { projects } from "@/lib/projects";

const floaters = projects.filter((p) => p.verified).slice(0, 3);

const positions = [
  { top: "8%", right: "14%", duration: "7s", delay: "0s", rot: "-3deg" },
  { top: "38%", right: "0%", duration: "8.5s", delay: "1.2s", rot: "2deg" },
  { top: "64%", right: "20%", duration: "6.5s", delay: "0.6s", rot: "-2deg" },
];

export function FloatingProof() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none">
      {floaters.map((p, i) => {
        const pos = positions[i];
        return (
          <div
            key={p.name}
            className="absolute"
            style={{
              top: pos.top,
              right: pos.right,
              animation: `floatBob ${pos.duration} ease-in-out infinite`,
              animationDelay: pos.delay,
              ["--rot" as string]: pos.rot,
            }}
          >
            <div className="pointer-events-auto flex items-center gap-2.5 bg-bg/90 backdrop-blur-sm border border-line rounded-lg px-4 py-3 shadow-[0_8px_30px_-12px_rgba(42,33,24,0.25)]">
              <VerifiedRing className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-ink text-sm font-medium leading-tight">{p.name}</div>
                <div className="font-mono text-[11px] text-brass leading-tight">{p.result}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
