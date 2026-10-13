import Nav from "../components/Nav";
import Footer from "../components/Footer";
import LedgerRow from "../components/LedgerRow";
import { Eyebrow } from "../components/Eyebrow";
import { projects } from "@/lib/projects";

export const metadata = {
  title: "Work — Omora",
};

export default function Work() {
  const verifiedCount = projects.filter((p) => p.verified).length;

  return (
    <>
      <Nav />
      <section className="max-w-wrap mx-auto px-6 md:px-8 py-16 md:py-24">
        <Eyebrow>Verified work</Eyebrow>
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">
          The work, verified.
        </h1>
        <p className="text-muted max-w-lg mb-2">
          Every entry below is real, delivered work — no invented brands, no
          fictional concepts. Rows marked "link pending" are real projects
          waiting on a confirmed public URL.
        </p>
        <p className="font-mono text-xs text-muted mb-10">
          {verifiedCount} of {projects.length} projects have a confirmed live link
        </p>

        <div>
          {projects.map((p) => (
            <LedgerRow key={p.name} p={p} />
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
