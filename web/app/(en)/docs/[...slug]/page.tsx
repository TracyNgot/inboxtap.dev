import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/doc-page";
import { getDocBySegments, getLocalizedDocs } from "@/lib/i18n";
import { docMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalizedDocs("en")
    .filter((doc) => doc.slug)
    .map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = getDocBySegments("en", (await params).slug);
  if (!doc) return {};
  return docMetadata("en", doc.key);
}

export default async function DocumentationDetailPage({ params }: PageProps) {
  const doc = getDocBySegments("en", (await params).slug);
  if (!doc?.slug) notFound();
  return <DocPage docKey={doc.key} locale="en" />;
}
