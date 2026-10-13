import { leak } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { HomeSection, Hairlines } from "@/components/home/section";

/**
 * The problem, in three columns: the phone, the search, the follow-up. Each
 * one is answered by a service card in the section directly below, in the
 * same order, which is why there are three of these and four of those — the
 * fourth service (sales intelligence) closes the follow-up hole from the
 * other side.
 */
export function Leak() {
  return (
    <HomeSection id="leak">
      <SectionHead tone="dark" plate="The leak" title={leak.title} intro={leak.lede} />

      <Reveal>
        <Hairlines cols="md:grid-cols-3">
          {leak.items.map((item) => (
            <div key={item.title} className="bg-bg px-6 py-8 sm:px-7">
              <p className="plate">{item.title}</p>
              <p className="mt-3 text-pretty leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </Hairlines>
      </Reveal>
    </HomeSection>
  );
}
