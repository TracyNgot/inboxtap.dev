import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/shared/root-document";
import { assertLocale, translatedLocales } from "@/lib/i18n/config";
import { rootMetadata, siteViewport } from "@/lib/seo/metadata";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export const dynamicParams = false;
export const viewport = siteViewport;

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return rootMetadata(assertLocale((await params).lang));
}

export default async function LocalizedRootLayout({ children, params }: LayoutProps) {
  const lang = assertLocale((await params).lang);
  return <RootDocument lang={lang}>{children}</RootDocument>;
}
