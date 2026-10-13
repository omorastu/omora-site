import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";

export const metadata = {
  title: "Start a project — Omora",
};

export default function Start() {
  return (
    <>
      <Nav />
      <section className="max-w-wrap mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">
              Start a project.
            </h1>
            <p className="text-muted text-sm leading-relaxed max-w-sm">
              Not sure yet whether you want a free mockup or a full quote?
              Pick either — we'll steer you to the right one within 24
              hours. No discovery calls, no runaround.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      <Footer />
    </>
  );
}
