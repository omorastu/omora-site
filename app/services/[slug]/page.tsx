import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceFor, services } from "@/lib/kozmoz";
import { ServicePage } from "@/components/kozmoz/service-page";

/**
 * /services/<slug> — one route for every service, each prerendered at build
 * time from its entry in lib/kozmoz.ts (`services`), through the one template
 * in components/kozmoz/service-page.tsx.
 */
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

/** Anything not in the list is a 404, not an empty page. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceFor(slug);
  if (!service) return {};

  return {
    title: `${service.title.replace(/\.$/, "")} — Elorro`,
    description: service.page.description,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceFor(slug);
  if (!service) notFound();

  return <ServicePage service={service} />;
}
