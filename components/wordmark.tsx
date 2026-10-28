import { brand } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * The OMORA wordmark: Cormorant Garamond 500, set in caps at 0.42em
 * tracking — the .wordmark class in app/globals.css. The name is written
 * "Omora" and set in caps by CSS, so screen readers say the word rather than
 * spelling it out. Size comes from the caller.
 */
export function Wordmark({ className, ...rest }: React.ComponentProps<"span">) {
  return (
    <span className={cn("wordmark", className)} {...rest}>
      {brand.name}
    </span>
  );
}
