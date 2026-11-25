"use client";

import { DESK, WORKSPACE, type DemoIndustry } from "@/components/elorro/demos/data";
import { Avatar, Check, Chip, DemoPlayer, Pending, Shell, appear, ease, mix, prog, spoken } from "@/components/elorro/demos/kit";

/**
 * Front desk: a call answered on the first ring, its transcript streaming in
 * as it's said, the request picked out, the slot booked, the record filled in
 * and the confirmation texted, each step ticking in turn. Times in seconds
 * into the flow.
 */
export const DESK_T = {
  /** Ringing, then answered. */
  answered: 1.0,
  /** Each line of the call: from, to (streamed a word at a time). */
  lines: [
    [1.3, 2.1],
    [2.35, 3.1],
    [3.35, 4.15],
    [4.45, 5.25],
    [5.5, 5.95],
  ] as [number, number][],
  /** Each step ticked: answered, request picked out, booked, record filled in, text sent. */
  steps: [1.05, 2.3, 6.1, 6.7, 7.3],
  /** The request, picked out in full (after the caller's second line). */
  askFull: 4.25,
  ended: 7.6,
  handled: 7.8,
  duration: 8.6,
};
const T = DESK_T;

const NAV = [
  { icon: "phone", label: "Front desk" },
  { icon: "calendar", label: "Calendar" },
  { icon: "users", label: "Contacts" },
  { icon: "chat", label: "Messages", count: 2 },
  { icon: "chart", label: "Reports" },
  { icon: "settings", label: "Settings" },
];
const TABS = [
  { icon: "phone", label: "Calls" },
  { icon: "calendar", label: "Calendar" },
  { icon: "chat", label: "Messages" },
  { icon: "settings", label: "Settings" },
];

export function FrontDeskDemo({ ind, capture }: { ind: DemoIndustry; capture: boolean }) {
  return (
    <DemoPlayer
      duration={T.duration}
      capture={capture}
      label="Demo: the front desk answering a call, booking it and texting the confirmation"
      draw={(t, phone) => (phone ? <Phone ind={ind} t={t} /> : <Desktop ind={ind} t={t} />)}
    />
  );
}

/** The call's state at `t`. */
function callState(t: number) {
  const status = t < T.answered ? "Incoming call" : t < T.ended ? "On call" : "Call ended";
  const secs = Math.floor((Math.min(t, T.ended) - T.answered) * 5.5);
  const timer = t < T.answered ? "0:00" : `0:${String(Math.max(0, secs)).padStart(2, "0")}`;
  const talking = T.lines.find(([a, b]) => t >= a && t <= b + 0.1);
  return { status, timer, talking: !!talking };
}

/** The call's sound, as bars: moving while someone talks, low between. */
function Wave({ t, on, n = 14, h = 26 }: { t: number; on: boolean; n?: number; h?: number }) {
  return (
    <span className="dm-wave" style={{ height: h }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const level = on ? Math.abs(Math.sin(t * 9.1 + i * 1.7)) * (0.45 + 0.55 * Math.abs(Math.sin(t * 3.7 + i * 0.63))) : 0;
        return <i key={i} style={{ height: Math.max(3, level * h), opacity: on ? 1 : 0.4 }} />;
      })}
    </span>
  );
}

/** The caller's circle: ringing (rings going out) until answered. */
function Caller({ name, initials, t, size }: { name: string; initials: string; t: number; size: number }) {
  const rings = t < T.answered ? [0, 0.45].map((k) => ((t + k) % 0.9) / 0.9) : [];
  return (
    <span className="dm-call-av" style={{ width: size, height: size }}>
      {rings.map((r, i) => (
        <i key={i} className="dm-call-ring" style={{ inset: -r * 9, opacity: (1 - r) * 0.8 }} />
      ))}
      <Avatar name={name} initials={initials} size={size} />
    </span>
  );
}

/** One line of the call, coming in as it's said. */
function Message({ t, at, end, who, label, text, grow }: { t: number; at: number; end: number; who: "caller" | "desk"; label: string; text: string; grow: number }) {
  const p = ease(prog(t, at - 0.05, 0.3));
  if (p <= 0) return null;
  return (
    <div className={`dm-msg${who === "desk" ? " dm-msg--desk" : ""}`} style={{ maxHeight: mix(0, grow, p), opacity: p }}>
      <span className="dm-msg-who">{label}</span>
      <span className="dm-msg-text">{spoken(text, t, at, end) || "…"}</span>
    </div>
  );
}

function Step({ t, at, title, detail }: { t: number; at: number; title: string; detail: string }) {
  const p = prog(t, at, 0.3);
  return (
    <div className={`dm-step${p > 0 ? "" : " is-wait"}`}>
      <span style={{ position: "relative", width: 18, height: 18, flex: "none", marginTop: 1 }}>
        <span style={{ position: "absolute", inset: 0, opacity: 1 - p }}>
          <Pending size={18} />
        </span>
        <span style={{ position: "absolute", inset: 0 }}>
          <Check p={p} size={18} />
        </span>
      </span>
      <div>
        <strong>{title}</strong>
        <span className="sub" style={{ opacity: ease(prog(t, at + 0.1, 0.3)) }}>
          {detail}
        </span>
      </div>
    </div>
  );
}

function StatusChip({ t }: { t: number }) {
  const s = callState(t).status;
  return <Chip tone={s === "Incoming call" ? "new" : s === "On call" ? "live" : "neutral"}>{s}</Chip>;
}

/* ── Desktop: the call and its transcript; down the right, what's done ─── */

function Desktop({ ind, t }: { ind: DemoIndustry; t: number }) {
  const D = DESK[ind];
  const c = callState(t);
  const full = ease(prog(t, T.askFull, 0.3));
  return (
    <Shell phone={false} ind={ind} nav={NAV} active={0} title="Front desk" sub={`${D.line} · answered automatically`} tools={<Chip tone="live">Live</Chip>}>
      <div className="dm-fd">
        <div>
          <div className="dm-card dm-call">
            <Caller name={D.caller.name} initials={D.caller.initials} t={t} size={44} />
            <div>
              <strong>{D.caller.name}</strong>
              <span className="sub">{D.caller.number}</span>
            </div>
            <Wave t={t} on={c.talking} />
            <span className="dm-timer">{c.timer}</span>
            <StatusChip t={t} />
          </div>
          <div className="dm-card dm-tx">
            <div className="dm-tx-head">
              <strong>Live transcript</strong>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Today, 9:41 AM</span>
            </div>
            <div className="dm-tx-list">
              {D.transcript.map(([who, text], i) => (
                <Message
                  key={i}
                  t={t}
                  at={T.lines[i][0]}
                  end={T.lines[i][1]}
                  who={who}
                  label={who === "caller" ? D.caller.name.split(" ")[0] : "Front desk"}
                  text={text}
                  grow={70}
                />
              ))}
              {t < T.answered && (
                <p style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--faint)", fontSize: 13 }}>Answering on the first ring…</p>
              )}
            </div>
          </div>
        </div>

        <div className="dm-fd-side">
          <div className="dm-card dm-ask" style={{ opacity: mix(0.55, 1, ease(prog(t, T.steps[1], 0.3))) }}>
            <span className="dm-label">Request</span>
            <div style={{ display: "grid" }}>
              {prog(t, T.steps[1], 0.3) > 0 ? (
                <>
                  <p style={{ gridArea: "1 / 1", ...appear(t, T.steps[1], { dy: 4 }), opacity: ease(prog(t, T.steps[1], 0.32)) * (1 - full) }}>{D.ask[0]}</p>
                  <p style={{ gridArea: "1 / 1", opacity: full }}>{D.ask[1]}</p>
                </>
              ) : (
                <p style={{ color: "var(--faint)", fontWeight: 500 }}>Listening…</p>
              )}
            </div>
          </div>
          <div className="dm-card dm-fd-steps">
            <h2>Handled for you</h2>
            {D.steps.map(([title, detail], i) => (
              <Step key={title} t={t} at={T.steps[i]} title={title} detail={detail} />
            ))}
          </div>
          <div className="dm-card dm-handled" style={appear(t, T.handled, { dy: 6 })}>
            <Check size={18} gold />
            Booked and confirmed. Nobody had to stop.
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ── Phone: the call on top, the last lines, and the steps ────────────── */

function Phone({ ind, t }: { ind: DemoIndustry; t: number }) {
  const D = DESK[ind];
  const c = callState(t);
  const handled = ease(prog(t, T.handled, 0.3));
  return (
    <Shell phone ind={ind} nav={NAV} tabs={TABS} active={0} title="Front desk" sub={`${WORKSPACE[ind].name} · ${D.line}`}>
      <div className="dm-card dm-pcall">
        <Caller name={D.caller.name} initials={D.caller.initials} t={t} size={38} />
        <div>
          <strong>{D.caller.name}</strong>
          <span className="sub">
            {D.caller.number} · {c.timer}
          </span>
        </div>
        <div style={{ position: "relative", display: "grid", justifyItems: "end" }}>
          <span style={{ opacity: 1 - handled }}>
            <StatusChip t={t} />
          </span>
          <span style={{ position: "absolute", right: 0, opacity: handled }}>
            <Chip tone="confirmed">Booked</Chip>
          </span>
        </div>
      </div>
      <div className="dm-ptx" style={{ maskImage: "linear-gradient(transparent, #000 22%)", WebkitMaskImage: "linear-gradient(transparent, #000 22%)" }}>
        {D.transcript.map(([who, text], i) => (
          <Message key={i} t={t} at={T.lines[i][0]} end={T.lines[i][1]} who={who} label={who === "caller" ? D.caller.name.split(" ")[0] : "Front desk"} text={text} grow={64} />
        ))}
        {t < T.answered && <p style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--faint)", fontSize: 14 }}>Answering on the first ring…</p>}
      </div>
      <div className="dm-card dm-psteps">
        {D.steps.map(([title, detail], i) => (
          <Step key={title} t={t} at={T.steps[i]} title={title} detail={detail} />
        ))}
      </div>
    </Shell>
  );
}
