"use client";

import type { ReactNode } from "react";
import { ENTRY, type DemoIndustry, type Entry } from "@/components/elorro/demos/data";
import { Check, Chip, DemoPlayer, Icon, Shell, appear, ease, mix, prog, typed } from "@/components/elorro/demos/kit";

/**
 * One entry: the record typed in once and saved, and the booking system, the
 * spreadsheet and the email each filling in on their own, ticking in turn.
 * Times in seconds into the flow.
 */
export const ENTRY_T = {
  /** Typed: the name, the phone number; then the booking picked. */
  name: [0.2, 0.85] as [number, number],
  phone: [0.9, 1.4] as [number, number],
  booking: 1.5,
  /** Saved. */
  save: 1.9,
  /** Each system filled in (booking system, spreadsheet, email), and ticked 0.2 s later. */
  systems: [2.2, 2.5, 2.8],
  /** "Entered once · updated in 3 places". */
  once: 3.25,
  duration: 4.2,
};
const T = ENTRY_T;
const TICK = 0.2;

const NAV = (type: string) => [
  { icon: "home", label: "Home" },
  { icon: "users", label: `${type}s` },
  { icon: "calendar", label: "Calendar" },
  { icon: "table", label: "Records" },
  { icon: "mail", label: "Email" },
  { icon: "settings", label: "Settings" },
];
const TABS = (type: string) => [
  { icon: "home", label: "Home" },
  { icon: "users", label: `${type}s` },
  { icon: "calendar", label: "Calendar" },
  { icon: "settings", label: "Settings" },
];

export function OneEntryDemo({ ind, capture }: { ind: DemoIndustry; capture: boolean }) {
  return (
    <DemoPlayer
      duration={T.duration}
      capture={capture}
      label="Demo: one entry typed once, and the booking system, spreadsheet and email filled in on their own"
      draw={(t, phone) => (phone ? <Phone ind={ind} t={t} /> : <Desktop ind={ind} t={t} />)}
    />
  );
}

/** What's in each field at `t`, and which one has the focus. */
function fields(E: Entry, t: number) {
  const cps = (text: string, [a, b]: [number, number]) => text.length / (b - a);
  const name = typed(E.name, t, T.name[0], cps(E.name, T.name));
  const phone = typed(E.phone, t, T.phone[0], cps(E.phone, T.phone));
  const booking = t >= T.booking ? E.booking : "";
  const focus = t < T.name[0] - 0.1 ? -1 : t < T.phone[0] - 0.02 ? 0 : t < T.booking - 0.02 ? 1 : t < T.save ? 2 : -1;
  return { name, phone, booking, focus };
}

function Input({ value, focus, placeholder, caret }: { value: string; focus: boolean; placeholder: string; caret?: boolean }) {
  return (
    <span className={`dm-input${focus ? " is-focus" : ""}`}>
      {value || <span style={{ color: "var(--faint)" }}>{placeholder}</span>}
      {focus && caret && value && <i className="dm-caret" />}
    </span>
  );
}

/** The Save button, pressed at T.save. */
function Save({ t, small }: { t: number; small?: boolean }) {
  const press = prog(t, T.save, 0.16);
  const down = press > 0 && press < 1;
  return (
    <span className="dm-btn dm-btn--main" style={{ transform: down ? "scale(.96)" : undefined, filter: down ? "brightness(.92)" : undefined, height: small ? 32 : undefined }}>
      {t >= T.save + 0.12 ? (
        <>
          <Check size={15} gold /> Saved
        </>
      ) : (
        "Save"
      )}
    </span>
  );
}

/** A system's status: waiting, then updated. */
function Status({ t, at }: { t: number; at: number }) {
  const p = ease(prog(t, at + TICK, 0.25));
  return (
    <span style={{ position: "relative", display: "inline-grid", marginLeft: "auto" }}>
      <span style={{ gridArea: "1 / 1", opacity: 1 - p, justifySelf: "end" }}>
        <Chip>Waiting</Chip>
      </span>
      <span style={{ gridArea: "1 / 1", opacity: p, justifySelf: "end", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Chip tone="done">Updated</Chip>
        <Check p={prog(t, at + TICK, 0.3)} size={18} />
      </span>
    </span>
  );
}

const first = (name: string) => name.split(" ")[0];

/* ── Desktop: the entry on the left, the three systems on the right ─────── */

function Desktop({ ind, t }: { ind: DemoIndustry; t: number }) {
  const E = ENTRY[ind];
  const f = fields(E, t);
  const [s1, s2, s3] = T.systems;
  const row = (at: number) => ({ maxHeight: mix(0, 44, ease(prog(t, at, 0.3))), opacity: ease(prog(t, at, 0.3)), overflow: "hidden" as const });
  return (
    <Shell phone={false} ind={ind} nav={NAV(E.type)} active={1} title={`New ${E.type.toLowerCase()}`} sub="Entered once, saved everywhere">
      <div className="dm-en">
        <div>
          <div className="dm-card dm-form">
            <h2>
              {E.type} details
              <Chip tone={t >= T.save + 0.12 ? "done" : "neutral"}>{t >= T.save + 0.12 ? "Saved" : "Draft"}</Chip>
            </h2>
            <label className="dm-field">
              <span>Name</span>
              <Input value={f.name} focus={f.focus === 0} placeholder="Full name" caret />
            </label>
            <label className="dm-field">
              <span>Phone</span>
              <Input value={f.phone} focus={f.focus === 1} placeholder="Phone number" caret />
            </label>
            <label className="dm-field">
              <span>{E.bookingLabel}</span>
              <span className={`dm-input${f.focus === 2 ? " is-focus" : ""}`} style={{ justifyContent: "space-between" }}>
                {f.booking ? <span style={appear(t, T.booking, { dy: 0, dx: -4, len: 0.2 })}>{f.booking}</span> : <span style={{ color: "var(--faint)" }}>Choose a time</span>}
                <Icon name="calendar" size={15} className="dm-top-bell" />
              </span>
            </label>
            <div className="dm-form-foot">
              <span>Saves to 3 places</span>
              <Save t={t} />
            </div>
          </div>
          <div className="dm-once" style={{ position: "relative", marginTop: 14, width: "fit-content", ...appear(t, T.once, { dy: 8 }) }}>
            <Check size={18} gold />
            <span>
              <strong>Entered once</strong> · updated in 3 places
            </span>
          </div>
        </div>

        <div className="dm-sys">
          <System icon="calendar" name="Booking system" t={t} at={s1}>
            <div className="dm-sys-row" style={{ marginBottom: 5 }}>
              <Icon name="clock" size={15} className="dm-top-bell" />
              <span>
                {E.rows[0][2]} · {E.rows[0][0]}
              </span>
            </div>
            <div style={row(s1)}>
              <div className="dm-sys-row is-new">
                <Icon name="clock" size={15} />
                <span>
                  <strong style={{ fontWeight: 600 }}>{E.slot}</strong> · {E.name}
                </span>
              </div>
            </div>
          </System>
          <System icon="table" name={`Spreadsheet · ${E.sheet}`} t={t} at={s2}>
            <div className="dm-sheet">
              <span className="th">Name</span>
              <span className="th">Phone</span>
              <span className="th">{E.bookingLabel}</span>
              {E.rows.flatMap((r) => r.map((c) => <span key={c}>{c}</span>))}
              {[E.name, E.phone, E.booking].map((c, i) => (
                <span key={c} className={prog(t, s2, 0.2) > 0 ? "is-new" : undefined}>
                  <span style={appear(t, s2 + i * 0.06, { dy: 0, dx: -4, len: 0.2 })}>{c}</span>
                </span>
              ))}
            </div>
          </System>
          <System icon="mail" name="Email" t={t} at={s3}>
            <div className="dm-mail" style={{ opacity: mix(0.35, 1, ease(prog(t, s3, 0.3))) }}>
              <span>
                <span style={{ color: "var(--muted)" }}>To</span> <b>{prog(t, s3, 0.2) > 0 ? E.name : "—"}</b>
                <span style={{ color: "var(--muted)" }}> · Subject</span> <b>{prog(t, s3, 0.2) > 0 ? E.re : "—"}</b>
              </span>
              <span style={appear(t, s3 + 0.08, { dy: 4, len: 0.25 })}>Hi {first(E.name)}, you’re all set. We’ve saved your details and we’ll see you then.</span>
            </div>
          </System>
        </div>
      </div>
    </Shell>
  );
}

function System({ icon, name, t, at, children }: { icon: string; name: string; t: number; at: number; children: ReactNode }) {
  return (
    <div className="dm-card dm-sys-card">
      <div className="dm-sys-head">
        <span className="dm-sys-icon">
          <Icon name={icon} size={15} />
        </span>
        <strong>{name}</strong>
        <Status t={t} at={at} />
      </div>
      {children}
    </div>
  );
}

/* ── Phone: the entry on top, the three systems under it ───────────────── */

function Phone({ ind, t }: { ind: DemoIndustry; t: number }) {
  const E = ENTRY[ind];
  const f = fields(E, t);
  const systems: [string, string, string][] = [
    ["calendar", "Booking system", E.slot],
    ["table", `Spreadsheet · ${E.sheet}`, `${E.name} · ${E.phone}`],
    ["mail", "Email", `To ${E.name} · ${E.re}`],
  ];
  return (
    <Shell phone ind={ind} nav={NAV(E.type)} tabs={TABS(E.type)} active={1} title={`New ${E.type.toLowerCase()}`} sub="Entered once, saved everywhere">
      <div className="dm-card dm-pform">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
          <strong style={{ fontSize: 14.5, fontWeight: 600 }}>{E.type} details</strong>
          <Save t={t} small />
        </div>
        <label className="dm-field">
          <span>Name</span>
          <Input value={f.name} focus={f.focus === 0} placeholder="Full name" caret />
        </label>
        <label className="dm-field">
          <span>Phone</span>
          <Input value={f.phone} focus={f.focus === 1} placeholder="Phone number" caret />
        </label>
        <label className="dm-field" style={{ marginBottom: 0 }}>
          <span>{E.bookingLabel}</span>
          <span className={`dm-input${f.focus === 2 ? " is-focus" : ""}`}>
            {f.booking ? <span style={appear(t, T.booking, { dy: 0, dx: -4, len: 0.2 })}>{f.booking}</span> : <span style={{ color: "var(--faint)" }}>Choose a time</span>}
          </span>
        </label>
      </div>
      <div className="dm-psys">
        {systems.map(([icon, name, value], i) => {
          const at = T.systems[i];
          const p = ease(prog(t, at, 0.3));
          return (
            <div key={name} className="dm-card dm-psys-row" style={{ background: p > 0 ? `color-mix(in srgb, var(--gold-soft) ${Math.round(p * 100)}%, #fff)` : undefined }}>
              <span className="dm-sys-icon">
                <Icon name={icon} size={15} />
              </span>
              <div>
                <strong>{name}</strong>
                <span className="sub">{p > 0 ? <span style={{ opacity: p, color: "var(--ink-2)" }}>{value}</span> : "Waiting for the entry"}</span>
              </div>
              <span style={{ position: "relative", width: 22, height: 22 }}>
                <Check p={prog(t, at + TICK, 0.3)} size={22} />
              </span>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
