import Image from "next/image";
import { brand, people } from "@/lib/kozmoz";
import { Wordmark } from "@/components/wordmark";

/** The plate again, small: the studio, the two names, where and how to reach us. */
export function Footer() {
  return (
    <footer className="foot">
      <p className="foot-l">
        <Image src={brand.mark} alt="" width={192} height={192} /> <Wordmark />
      </p>
      <p className="foot-c">
        <span className="c-a">{people.a.name}</span> &amp;{" "}
        <span className="c-j">{people.j.name}</span>
      </p>
      <p className="foot-r">
        {brand.where} <span aria-hidden="true">·</span>{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a> <span aria-hidden="true">·</span> ©{" "}
        {new Date().getFullYear()} {brand.name}
      </p>
    </footer>
  );
}
