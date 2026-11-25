"use client";

import { BOOKING, type CalEvent, type DemoIndustry } from "@/components/elorro/demos/data";
import { Avatar, Check, Chip, DemoPlayer, Icon, Pending, Shell, appear, ease, mix, prog } from "@/components/elorro/demos/kit";

/**
 * Booking: the business's own calendar as a booking comes in online and is
 * confirmed on its own. The booking lands in the activity list and on the
 * calendar as pending, the slot and the details are checked, it turns
 * confirmed, and the confirmation goes out. Times in seconds into the flow.
 */
export const BOOKING_T = {
  /** The booking arrives: in the activity list, then on the calendar. */
  arrive: 0.5,
  onCalendar: 0.9,
  /** Checked: the slot, then the details. */
  slot: 1.6,
  details: 2.1,
  /** Confirmed, on its own. */
  confirmed: 2.8,
  /** The confirmation sent. */
  sent: 3.4,
  /** "Confirmed automatically", on the phone. */
  toast: 3.9,
  duration: 5.1,
};
const T = BOOKING_T;

const NAV = (noun: string) => [
  { icon: "calendar", label: "Calendar" },
  { icon: "list", label: "Bookings", count: 12 },
  { icon: "users", label: `${noun}s` },
  { icon: "chat", label: "Messages", count: 3 },
  { icon: "chart", label: "Reports" },
  { icon: "settings", label: "Settings" },
];
const TABS = [
  { icon: "calendar", label: "Calendar" },
  { icon: "list", label: "Bookings" },
  { icon: "chat", label: "Messages" },
  { icon: "settings", label: "Settings" },
];

export function BookingDemo({ ind, capture }: { ind: DemoIndustry; capture: boolean }) {
  return (
    <DemoPlayer
      duration={T.duration}
      capture={capture}
      label={`Demo: ${BOOKING[ind].title}, a booking coming in and confirmed on its own`}
      draw={(t, phone) => (phone ? <Phone ind={ind} t={t} /> : <Desktop ind={ind} t={t} />)}
    />
  );
}

/** The status of the new booking at `t`: its two looks cross-fading. */
const confirmedness = (t: number) => ease(prog(t, T.confirmed, 0.3));

/* ── Desktop: the week, and the activity down the right ─────────────────── */

const ROW = 67;

function Desktop({ ind, t }: { ind: DemoIndustry; t: number }) {
  const B = BOOKING[ind];
  const g = B.guest;
  const ok = confirmedness(t);
  const ring = prog(t, T.onCalendar, 0.9);
  return (
    <Shell
      phone={false}
      ind={ind}
      nav={NAV(B.noun)}
      active={0}
      title={B.title}
      sub={B.range}
      tools={
        <>
          <span className="dm-btn">Today</span>
          <span className="dm-btn" style={{ padding: "0 9px" }}>
            <Icon name="back" size={15} />
            <Icon name="chevron" size={15} />
          </span>
        </>
      }
    >
      <div className="dm-bk">
        <div className="dm-card dm-cal">
          <div className="dm-cal-head">
            <span />
            {B.days.map(([dow, date], i) => (
              <span key={dow} className={i === 0 ? "is-today" : undefined}>
                {dow} <b>{date}</b>
              </span>
            ))}
          </div>
          <div className="dm-cal-grid">
            <div className="dm-cal-hours">
              {B.hours.map((h, i) => (
                <span key={h} style={{ top: i * ROW + (i ? 0 : 8) }}>
                  {h}
                </span>
              ))}
            </div>
            {B.days.map(([dow], d) => (
              <div key={dow} className="dm-cal-col">
                {B.events
                  .filter((e) => e.day === d)
                  .map((e) => (
                    <div key={e.who} className="dm-ev" style={{ top: e.at * ROW + 3, height: e.len * ROW - 6 }}>
                      <strong>{e.title}</strong>
                      <span>{e.who}</span>
                    </div>
                  ))}
                {d === g.day && (
                  <>
                    {/* The new one: pending, then confirmed (two looks, cross-fading). */}
                    <div style={{ position: "absolute", inset: 0, ...appear(t, T.onCalendar, { len: 0.35, dy: 6, grow: true }) }}>
                      <div className="dm-ev dm-ev--new" style={{ top: g.at * ROW + 3, height: g.len * ROW - 6, opacity: 1 - ok }}>
                        <strong>{g.cal}</strong>
                        <span>{g.name}</span>
                        <span className="dm-ev-status dm-ev-status--pending" aria-hidden="true">
                          <Icon name="clock" size={14} />
                        </span>
                      </div>
                      <div className="dm-ev dm-ev--ok" style={{ top: g.at * ROW + 3, height: g.len * ROW - 6, opacity: ok }}>
                        <strong>{g.cal}</strong>
                        <span>{g.name}</span>
                        <span className="dm-ev-status">
                          <Check size={16} gold />
                        </span>
                      </div>
                    </div>
                    {ring > 0 && ring < 1 && (
                      <div
                        className="dm-ev-ring"
                        style={{ top: g.at * ROW + 3 - 4 * ring, height: g.len * ROW - 6 + 8 * ring, left: 6 - 4 * ring, right: 6 - 4 * ring, opacity: (1 - ring) * 0.9 }}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            {B.hours.map((h, i) => (i ? <div key={h} className="dm-cal-line" style={{ top: i * ROW }} /> : null))}
          </div>
        </div>

        <div className="dm-card dm-feed">
          <div className="dm-feed-head">
            <strong>Online bookings</strong>
            <Chip tone="live">Live</Chip>
          </div>
          <div className="dm-feed-list">
            <div style={{ maxHeight: mix(0, 176, ease(prog(t, T.arrive, 0.4))), opacity: ease(prog(t, T.arrive + 0.1, 0.3)), overflow: "hidden" }}>
              <div className="dm-feed-item dm-feed-item--new">
                <div className="dm-feed-row">
                  <Avatar name={g.name} initials={g.initials} size={32} />
                  <div>
                    <div className="dm-feed-name">
                      <strong>{g.name}</strong>
                      <span>9:41 AM</span>
                    </div>
                    <p className="dm-feed-what">{g.what}</p>
                    <p className="dm-feed-what">{g.when}</p>
                    <div style={{ position: "relative", height: 22, marginTop: 6 }}>
                      <Chip tone="pending" style={{ position: "absolute", opacity: 1 - ok }}>
                        Pending
                      </Chip>
                      <span style={{ position: "absolute", display: "flex", alignItems: "center", gap: 6, opacity: ok }}>
                        <Chip tone="confirmed">Confirmed</Chip>
                        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>automatically</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="dm-steps">
                  <Step t={t} at={T.slot} text="Slot available" />
                  <Step t={t} at={T.details} text={`${B.noun} details saved`} />
                  <Step t={t} at={T.sent} text="Confirmation sent" />
                </div>
              </div>
            </div>
            {B.earlier.map((e) => (
              <div key={e.name} className="dm-feed-item">
                <div className="dm-feed-row">
                  <Avatar name={e.name} initials={e.initials} size={32} />
                  <div>
                    <div className="dm-feed-name">
                      <strong>{e.name}</strong>
                      <span>{e.ago}</span>
                    </div>
                    <p className="dm-feed-what">{e.what}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Shell>
  );
}

function Step({ t, at, text }: { t: number; at: number; text: string }) {
  const p = prog(t, at, 0.3);
  return (
    <span style={{ color: p > 0 ? undefined : "var(--faint)" }}>
      <span style={{ position: "relative", width: 16, height: 16, display: "inline-block", flex: "none" }}>
        <span style={{ position: "absolute", inset: 0, opacity: 1 - p }}>
          <Pending size={16} />
        </span>
        <span style={{ position: "absolute", inset: 0 }}>
          <Check p={p} size={16} />
        </span>
      </span>
      {text}
    </span>
  );
}

/* ── Phone: the day's bookings ──────────────────────────────────────────── */

function Phone({ ind, t }: { ind: DemoIndustry; t: number }) {
  const B = BOOKING[ind];
  const g = B.guest;
  const ok = confirmedness(t);
  const came = ease(prog(t, T.arrive, 0.35));
  const ring = prog(t, T.arrive, 0.9);
  // Five hours around the new booking; an hour taken by a longer booking from the one before is left out.
  const from = Math.max(0, Math.min(g.at - 2, B.hours.length - 5));
  type Row = { label: string; kind: "new" } | { label: string; kind: "event"; ev: CalEvent } | { label: string; kind: "open" };
  const rows = B.hours.slice(from, from + 5).flatMap((label, k): Row[] => {
    const h = from + k;
    const ev = B.events.find((e) => e.day === g.day && e.at === h);
    const covered = B.events.some((e) => e.day === g.day && e.at < h && e.at + e.len > h);
    if (h === g.at) return [{ label, kind: "new" }];
    if (ev) return [{ label, kind: "event", ev }];
    if (covered) return [];
    return [{ label, kind: "open" }];
  });
  return (
    <Shell phone ind={ind} nav={NAV(B.noun)} tabs={TABS} active={0} title={B.title} sub={g.when.split(" · ")[0]}>
      <div className="dm-days">
        {B.days.map(([d, n], i) => (
          <span key={d} className={i === g.day ? "is-on" : undefined}>
            {d}
            <b>{n}</b>
          </span>
        ))}
      </div>
      <div className="dm-slots">
        {rows.map((r) => (
          <div key={r.label} className="dm-slot">
            <span className="dm-slot-time">{r.label}</span>
            {r.kind === "event" && (
              <div className="dm-slot-card">
                <div>
                  <strong>{r.ev.title}</strong>
                  <span className="sub">{r.ev.who}</span>
                </div>
              </div>
            )}
            {r.kind === "open" && <div className="dm-slot-card dm-slot-card--open">Open</div>}
            {r.kind === "new" && (
              <div style={{ position: "relative" }}>
                <div className="dm-slot-card dm-slot-card--open" style={{ opacity: 1 - came, position: "absolute", inset: 0 }}>
                  Open
                </div>
                <div style={{ position: "relative", ...appear(t, T.arrive, { len: 0.35, dx: 14, dy: 0 }) }}>
                  <div className="dm-slot-card dm-slot-card--new" style={{ opacity: 1 - ok }}>
                    <Avatar name={g.name} initials={g.initials} size={30} />
                    <div>
                      <strong>{g.name}</strong>
                      <span className="sub">{g.what}</span>
                    </div>
                    <Chip tone="pending">Pending</Chip>
                  </div>
                  <div className="dm-slot-card dm-slot-card--ok" style={{ opacity: ok, position: "absolute", inset: 0 }}>
                    <Avatar name={g.name} initials={g.initials} size={30} />
                    <div>
                      <strong>{g.name}</strong>
                      <span className="sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {prog(t, T.sent, 0.3) > 0 ? (
                          <>
                            <Check p={prog(t, T.sent, 0.3)} size={13} />
                            Confirmation sent
                          </>
                        ) : (
                          g.what
                        )}
                      </span>
                    </div>
                    <Chip tone="confirmed">Confirmed</Chip>
                  </div>
                </div>
                {ring > 0 && ring < 1 && <div className="dm-ev-ring" style={{ top: -3 * ring, bottom: -3 * ring, left: -3 * ring, right: -3 * ring, opacity: (1 - ring) * 0.9 }} />}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="dm-toast" style={{ top: 8, left: 12, right: 12, justifyContent: "center", whiteSpace: "normal", ...appear(t, T.toast, { dy: -10, len: 0.35 }) }}>
        <Check size={20} gold />
        <span>
          <strong>Confirmed automatically</strong>
          <br />
          {g.name} · {g.short}
        </span>
      </div>
    </Shell>
  );
}
