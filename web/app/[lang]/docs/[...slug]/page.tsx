import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/doc-page";
import { getDocBySegments, getLocalizedDocs } from "@/lib/i18n";
import { assertLocale, isLocale } from "@/lib/i18n/config";
import { docMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ lang: string; slug: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) return [];
  return getLocalizedDocs(params.lang)
    .filter((doc) => doc.slug)
    .map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const doc = getDocBySegments(assertLocale(lang), slug);
  if (!doc) return {};
  return docMetadata(assertLocale(lang), doc.key);
}

export default async function LocalizedDocumentationDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = assertLocale(lang);
  const doc = getDocBySegments(locale, slug);
  if (!doc?.slug) notFound();
  return <DocPage docKey={doc.key} locale={locale} />;
}
