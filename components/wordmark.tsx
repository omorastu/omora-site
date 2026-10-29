import { brand } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * The ELORRO wordmark: Cormorant Garamond 500, set in caps at 0.42em
 * tracking — the .wordmark class in app/globals.css — and, in the header and
 * footer, in the logo's gold, at 600 and 0.36em (kozmoz.css). The name is
 * written "Elorro" and set in caps by CSS, so screen readers say the word
 * rather than spelling it out. Size comes from the caller.
 */
export function Wordmark({ className, ...rest }: React.ComponentProps<"span">) {
  return (
    <span className={cn("wordmark", className)} {...rest}>
      {brand.name}
    </span>
  );
}
