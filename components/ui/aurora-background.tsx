"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aurora background — from the shadcn backgrounds library, recoloured to the
 * Omora palette and reworked so it doesn't depend on Tailwind's `dark:` variant
 * or an `invert` filter (the original inverts a light-mode gradient; this site
 * is dark-native, so it composites directly over the bg-brown ground).
 *
 * Also unwrapped from the original's <main> element — the page owns its own
 * landmarks and two <main>s is invalid.
 *
 * Motion: pure CSS `animation`, so the global prefers-reduced-motion rule in
 * globals.css freezes it. Frozen it still reads as a static violet haze.
 */
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: ReactNode;
  /** Fades the aurora out toward the bottom so text stays legible. */
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={
          {
            "--violet": "#C18CFF",
            "--plum": "#5B4478",
            "--blue": "#7FA0C4",
            "--blue-dim": "#3E5570",
            "--bg": "#0D0908",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "animate-aurora pointer-events-none absolute -inset-[20%]",
            // Dusty violet through deep plum into a muted blue, all bleeding
            // back into the bg brown. Same motion and opacity as before —
            // hues only.
            "[--aurora:repeating-linear-gradient(100deg,var(--plum)_8%,var(--violet)_15%,var(--plum)_22%,var(--blue)_29%,var(--plum)_38%)]",
            "[background-image:var(--aurora)] [background-size:200%_200%]",
            // Curtain slits are cut with a mask rather than an opaque overlay.
            // The original stacks a dark band layer and composites it with
            // mix-blend-difference, which inverts hues — over a dark ground that
            // produced magenta and cyan, well outside the palette.
            "[mask-image:repeating-linear-gradient(100deg,#000_0%,#000_6%,transparent_9%,transparent_13%,#000_17%)]",
            "[-webkit-mask-image:repeating-linear-gradient(100deg,#000_0%,#000_6%,transparent_9%,transparent_13%,#000_17%)]",
            "opacity-30 blur-[28px] will-change-[background-position]"
          )}
        />
        {/* Settles the field back to the bg brown toward the bottom. Its own layer,
            so it never has to composite with the curtain mask above. */}
        {showRadialGradient && (
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_-10%,transparent_25%,var(--bg)_80%)]" />
        )}
      </div>
      {children}
    </div>
  );
};
