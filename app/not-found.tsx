import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/kozmoz/page";

export const metadata: Metadata = {
  title: "Not found — Elorro",
};

/** Any address the site doesn't have, in the site's own frame. */
export default function NotFound() {
  return (
    <Page>
      <article className="read read--short">
        <header className="read-head">
          <p className="label">404</p>
          <h1 className="read-title">There’s no page here.</h1>
        </header>
        <p className="read-body">
          It may have moved, or the link may be wrong. <Link href="/">Back to the home page</Link>
        </p>
      </article>
    </Page>
  );
}
