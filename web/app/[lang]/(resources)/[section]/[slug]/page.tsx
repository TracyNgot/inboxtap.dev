import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourcePage } from "@/components/resources/resource-page";
import { assertLocale, isLocale } from "@/lib/i18n/config";
import { getLocalizedResources, getResourceBySegments } from "@/lib/resources";
import { resourceMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ lang: string; section: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) return [];
  return getLocalizedResources(params.lang).map(({ section, slug }) => ({ section, slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, section, slug } = await params;
  const locale = assertLocale(lang);
  const resource = getResourceBySegments(locale, section, slug);
  return resource ? resourceMetadata(locale, resource.key) : {};
}

export default async function LocalizedResourcePage({ params }: PageProps) {
  const { lang, section, slug } = await params;
  const locale = assertLocale(lang);
  const resource = getResourceBySegments(locale, section, slug);
  if (!resource) notFound();
  return <ResourcePage locale={locale} resourceKey={resource.key} />;
}
