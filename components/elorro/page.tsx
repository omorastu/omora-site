import { Header } from "@/components/elorro/header";
import { Footer } from "@/components/elorro/footer";
import { hanken } from "@/components/elorro/fonts";
import { cn } from "@/lib/utils";
import "@/components/elorro/elorro.css";

/**
 * Every page but the home page, in the home page's frame: the same root,
 * type, bar and foot, on the same paper. `local` lists the menu's chapter
 * links whose chapters are on this page itself (see Header). The root's
 * class, .elo, is also what the film makes inert while it plays
 * (components/elorro/film/film.tsx).
 */
export function Page({
  local,
  className,
  children,
}: {
  local?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("elo", "elo-inner", hanken.variable, className)}>
      <a className="skip label" href="#main">
        Skip to content
      </a>
      <Header local={local} />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
