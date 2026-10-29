import Image from "next/image";
import Link from "next/link";
import { brand, people } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";

/**
 * The plate again, small: the studio, the two names, where and how to reach
 * us, and the two legal pages.
 */
export function Footer() {
  return (
    <footer className="foot">
      <p className="foot-l">
        <Image src={brand.mark} alt="" width={192} height={192} /> <Wordmark className="gold" />
      </p>
      <p className="foot-c">
        <b>{people.a.name}</b> <span className="gold">&amp;</span> <b>{people.j.name}</b>
      </p>
      <p className="foot-r">
        {brand.where} <span aria-hidden="true">·</span>{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a> <span aria-hidden="true">·</span> ©{" "}
        {new Date().getFullYear()} {brand.name} <span aria-hidden="true">·</span>{" "}
        <Link href="/privacy">Privacy</Link> <span aria-hidden="true">·</span>{" "}
        <Link href="/terms">Terms</Link>
      </p>
    </footer>
  );
}
