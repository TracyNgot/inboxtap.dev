import type { Metadata } from "next";
import { DocPage } from "@/components/docs/doc-page";
import { assertLocale } from "@/lib/i18n/config";
import { docMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return docMetadata(assertLocale((await params).lang), "");
}

export default async function LocalizedDocumentationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <DocPage docKey="" locale={assertLocale((await params).lang)} />;
}
