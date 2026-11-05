import type { Metadata } from "next";
import { questionsPage } from "@/lib/faq";
import { Page } from "@/components/elorro/page";
import { Faq } from "@/components/elorro/faq";
import { Contact } from "@/components/elorro/contact";

export const metadata: Metadata = {
  title: questionsPage.title,
  description: questionsPage.description,
};

/**
 * /questions — the home page's Questions with all ten, then Contact. Copy in
 * lib/faq.ts.
 */
export default function QuestionsPage() {
  return (
    // The header's Contact link stays on the page: it ends in its own form.
    <Page local={["#contact"]}>
      <Faq all />
      <Contact source="elorro.com/questions" />
    </Page>
  );
}
