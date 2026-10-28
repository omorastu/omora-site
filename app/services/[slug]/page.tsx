import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/lib/content";
import { ServicePage } from "@/components/site/service-page";

/**
 * One dynamic route rather than four near-identical files.
 *
 * `generateStaticParams` prerenders every service at build time, so these are
 * static pages with none of the duplication — adding a fifth service is an edit
 * to lib/content.ts and nothing else.
 */
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

/** Anything not in the service list is a 404, not an empty page. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: `${service.name} — Kozmoz`,
    description: service.tagline,
    openGraph: {
      title: `${service.name} — Kozmoz`,
      description: service.tagline,
      url: `/services/${service.slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return <ServicePage service={service} />;
}
