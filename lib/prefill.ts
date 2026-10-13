import { services, type ServiceId } from "@/lib/content";

/**
 * Clicking a capability card jumps to the ticket form and preselects what the
 * visitor needs. The card and the form are in different subtrees, so they talk
 * over a window event rather than shared React state — and the anchor still
 * works on its own if JS hasn't loaded.
 */
export const PREFILL_EVENT = "omora:prefill";

export type PrefillDetail = { need: ServiceId };

/**
 * Service id → the form checkbox it preselects.
 *
 * Derived from the service list rather than hand-maintained as a fixed record,
 * so adding a service cannot leave a hole here. `needLabel` wins; `label` is the
 * fallback.
 */
export const NEED_LABELS: Record<ServiceId, string> = Object.fromEntries(
  services.map((s) => [s.slug, s.needLabel ?? s.label])
);

/** The checkbox options the form offers, in card order, plus the catch-all. */
export const NEED_OPTIONS: string[] = [
  ...services.map((s) => s.needLabel ?? s.label),
  "Something else",
];
