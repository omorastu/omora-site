"use client";

import { TOOL, type Tool, type ToolIndustry } from "@/components/elorro/demos/data";
import { Check, Chip, DemoPlayer, Icon, Shell, appear, ease, mix, prog } from "@/components/elorro/demos/kit";

/**
 * A tool of their own: what goes in (a week's tastings and notes, a job's site
 * notes, a call's notes), the button pressed, the tool at work, and what it
 * makes of them, row by row, then done. Times in seconds into the flow.
 */
export const TOOL_T = {
  press: 0.5,
  /** At work: the bar filling. */
  working: [0.65, 1.45] as [number, number],
  /** Each row of what it makes. */
  rows: [1.5, 1.9, 2.3, 2.7],
  done: 3.2,
  actions: 3.4,
  duration: 4.6,
};
const T = TOOL_T;

const NAV = [
  { icon: "home", label: "Home" },
  { icon: "calendar", label: "Calendar" },
  { icon: "tool", label: "Tools" },
  { icon: "doc", label: "Documents" },
  { icon: "users", label: "Contacts" },
  { icon: "settings", label: "Settings" },
];
const TABS = [
  { icon: "home", label: "Home" },
  { icon: "tool", label: "Tools" },
  { icon: "doc", label: "Documents" },
  { icon: "settings", label: "Settings" },
];

export function ToolDemo({ ind, capture }: { ind: ToolIndustry; capture: boolean }) {
  return (
    <DemoPlayer
      duration={T.duration}
      capture={capture}
      label={`Demo: ${TOOL[ind].name}, ${TOOL[ind].bar}`}
      draw={(t, phone) => (phone ? <Phone ind={ind} t={t} /> : <Desktop ind={ind} t={t} />)}
    />
  );
}

function Button({ t, K, small }: { t: number; K: Tool; small?: boolean }) {
  const press = prog(t, T.press, 0.16);
  const down = press > 0 && press < 1;
  const busy = t >= T.press + 0.12 && t < T.done;
  return (
    <span
      className="dm-btn dm-btn--main"
      style={{ transform: down ? "scale(.96)" : undefined, filter: down ? "brightness(.92)" : undefined, opacity: busy ? 0.7 : 1, height: small ? 32 : undefined, width: small ? undefined : "100%" }}
    >
      <Icon name="sparkle" size={15} />
      {t >= T.done ? "Done" : busy ? "Working…" : K.button}
    </span>
  );
}

/** The tool's progress: its bar while it works, then what it read. */
function Work({ t, K }: { t: number; K: Tool }) {
  const [a, b] = T.working;
  const p = easeInOutBar(prog(t, a, b - a));
  if (t < a) return <span className="dm-work">Ready when you are</span>;
  return (
    <>
      <span className="dm-bar">
        <i style={{ width: `${(p * 100).toFixed(1)}%` }} />
      </span>
      <span className="dm-work">
        {t < T.done ? (
          K.working
        ) : (
          <>
            <Check size={14} /> {K.done}
          </>
        )}
      </span>
    </>
  );
}
const easeInOutBar = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function DoneChip({ t, K }: { t: number; K: Tool }) {
  const p = ease(prog(t, T.done, 0.3));
  return (
    <span style={{ position: "relative", display: "inline-grid" }}>
      <span style={{ gridArea: "1 / 1", justifySelf: "end", opacity: 1 - p }}>
        <Chip tone={t >= T.working[0] ? "new" : "neutral"}>{t >= T.working[0] ? "Drafting" : "Empty"}</Chip>
      </span>
      <span style={{ gridArea: "1 / 1", justifySelf: "end", opacity: p }}>
        <Chip tone="confirmed">{K.done}</Chip>
      </span>
    </span>
  );
}

/** The rows it makes, coming in one by one (grey placeholders while it works). */
function Rows({ t, K, phone }: { t: number; K: Tool; phone?: boolean }) {
  const working = t >= T.working[0];
  if (K.kind === "email") {
    return (
      <>
        <div className="dm-email-head" style={phone ? { padding: "8px 0", fontSize: 12.5 } : undefined}>
          <span>To</span>
          <span>{K.outSub.replace(" · draft", "").replace("To ", "")}</span>
          <span>Subject</span>
          <span style={appear(t, T.rows[0], { dy: 0, len: 0.25 })}>Next steps from our call</span>
        </div>
        <div className="dm-email-body">
          {K.outRows.map(([line], i) => {
            const p = prog(t, T.rows[i], 0.35);
            return (
              <div key={line} style={{ position: "relative" }}>
                {p <= 0 && working && <div className="dm-skel" style={{ position: "absolute", top: "0.45em", width: `${70 + ((i * 17) % 25)}%` }} />}
                <span style={{ opacity: ease(p), visibility: p > 0 ? undefined : "hidden" }}>{line}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }
  return (
    <>
      {K.kind === "estimate" && !phone && (
        <div className="dm-out-row" style={{ padding: "9px 0" }}>
          <span style={{ width: 24 }} />
          <div>
            <span className="dm-label">Scope</span>
            <span className="dm-label">Notes</span>
          </div>
        </div>
      )}
      {K.outRows.map(([what, why], i) => {
        const p = prog(t, T.rows[i], 0.3);
        return (
          <div key={what} className="dm-out-row" style={{ position: "relative" }}>
            {p <= 0 && working && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 12 }}>
                <span className="dm-out-num" style={{ background: "#EEF0F3", color: "transparent" }} />
                <span className="dm-skel" style={{ width: `${44 + ((i * 13) % 20)}%` }} />
              </div>
            )}
            <span className="dm-out-num" style={{ opacity: ease(p) }}>
              {i + 1}
            </span>
            <div style={appear(t, T.rows[i], { dy: 0, dx: -6, len: 0.3 })}>
              <strong>{what}</strong>
              {!phone && <span className="sub">{why}</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ── Desktop: what goes in on the left, what it makes on the right ─────── */

function Desktop({ ind, t }: { ind: ToolIndustry; t: number }) {
  const K = TOOL[ind];
  return (
    <Shell phone={false} ind={ind} nav={NAV} active={2} title={K.name} sub={K.bar}>
      <div className="dm-tl">
        <div className="dm-card dm-in">
          <h2>{K.inTitle}</h2>
          <span className="sub">{K.inSub}</span>
          {K.inLines.map((l) => (
            <div key={l} className="dm-in-line">
              <i />
              {l}
            </div>
          ))}
          <div className="dm-in-foot">
            <Button t={t} K={K} />
            <Work t={t} K={K} />
          </div>
        </div>
        <div className="dm-card dm-out">
          <div className="dm-out-head">
            <div>
              <h2>{K.outTitle}</h2>
              <span className="sub">{K.outSub}</span>
            </div>
            <DoneChip t={t} K={K} />
          </div>
          <div style={{ opacity: mix(0.6, 1, ease(prog(t, T.working[0], 0.3))) }}>
            <Rows t={t} K={K} />
          </div>
          <div className="dm-out-actions" style={appear(t, T.actions, { dy: 6 })}>
            <span className="dm-btn dm-btn--main">{K.actions[0]}</span>
            <span className="dm-btn">{K.actions[1]}</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ── Phone: what goes in, the button, and what it makes, stacked ───────── */

function Phone({ ind, t }: { ind: ToolIndustry; t: number }) {
  const K = TOOL[ind];
  const [a, b] = T.working;
  return (
    <Shell phone ind={ind} nav={NAV} tabs={TABS} active={1} title={K.name} sub={K.bar}>
      <div className="dm-card dm-pin">
        <h2>
          {K.inTitle}
          <Button t={t} K={K} small />
        </h2>
        <div className="dm-pin-lines">
          {K.inLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="dm-bar" style={{ marginTop: 9, opacity: t >= a ? 1 : 0 }}>
          <i style={{ width: `${(easeInOutBar(prog(t, a, b - a)) * 100).toFixed(1)}%` }} />
        </div>
      </div>
      <div className="dm-card dm-pout">
        <div className="dm-out-head">
          <div>
            <h2>{K.outTitle}</h2>
            <span className="sub">{K.outSub}</span>
          </div>
          <DoneChip t={t} K={K} />
        </div>
        <Rows t={t} K={K} phone />
      </div>
    </Shell>
  );
}
