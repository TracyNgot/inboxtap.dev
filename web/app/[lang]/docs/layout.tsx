import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsShell } from "@/components/docs/docs-shell";
import { assertLocale } from "@/lib/i18n/config";
import { docsLayoutMetadata } from "@/lib/seo/metadata";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return docsLayoutMetadata(assertLocale((await params).lang));
}

export default async function LocalizedDocsLayout({ children, params }: LayoutProps) {
  return <DocsShell locale={assertLocale((await params).lang)}>{children}</DocsShell>;
}
