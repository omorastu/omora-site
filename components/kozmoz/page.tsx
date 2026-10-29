import { Header } from "@/components/kozmoz/header";
import { Footer } from "@/components/kozmoz/footer";
import { fraunces, hanken } from "@/components/kozmoz/fonts";
import { cn } from "@/lib/utils";
import "@/components/kozmoz/kozmoz.css";

/**
 * Every page but the home page, in the home page's frame: the same root,
 * type, header and footer. The home page builds its own (app/page.tsx),
 * because its root is also the "pick a name" toggle. The seam is the home
 * page's hero's alone. `local` lists the header links whose sections are on
 * this page itself (see Header).
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
    <div className={cn("kz", "kz-inner", fraunces.variable, hanken.variable, className)}>
      <a className="skip label" href="#main">
        Skip to content
      </a>
      <Header local={local} />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
