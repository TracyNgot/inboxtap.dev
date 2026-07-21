import type { Metadata, Viewport } from "next";
import type { DocKey } from "../docs-config";
import { docAlternatePaths, getDictionary, getLocalizedDoc } from "../i18n";
import { homePath, type Locale, locales, ogLocales } from "../i18n/config";
import { SITE_NAME, SITE_ORIGIN } from "../site-config";

export const siteViewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { color: "#050505", media: "(prefers-color-scheme: dark)" },
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
  ],
  width: "device-width",
};

function languageAlternates(paths: Record<Locale, string>) {
  return { en: paths.en, es: paths.es, fr: paths.fr, "x-default": paths.en };
}

function alternateOgLocales(locale: Locale): string[] {
  return locales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => ogLocales[candidate]);
}

export function rootMetadata(locale: Locale): Metadata {
  const meta = getDictionary(locale).meta;
  const paths = Object.fromEntries(
    locales.map((candidate) => [candidate, homePath(candidate)]),
  ) as Record<Locale, string>;
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: meta.title, template: meta.titleTemplate },
    description: meta.description,
    alternates: { canonical: paths[locale], languages: languageAlternates(paths) },
    openGraph: {
      alternateLocale: alternateOgLocales(locale),
      description: meta.ogDescription,
      locale: ogLocales[locale],
      siteName: SITE_NAME,
      title: meta.title,
      type: "website",
      url: paths[locale],
    },
    twitter: {
      card: "summary_large_image",
      description: meta.twitterDescription,
      title: SITE_NAME,
    },
  };
}

export function docsLayoutMetadata(locale: Locale): Metadata {
  const meta = getDictionary(locale).meta;
  return { title: { default: meta.docsTitle, template: meta.docsTitleTemplate } };
}

export function docMetadata(locale: Locale, key: DocKey): Metadata {
  const doc = getLocalizedDoc(locale, key);
  const paths = docAlternatePaths(key);
  return {
    alternates: { canonical: paths[locale], languages: languageAlternates(paths) },
    description: doc.description,
    openGraph: {
      alternateLocale: alternateOgLocales(locale),
      description: doc.description,
      locale: ogLocales[locale],
      siteName: SITE_NAME,
      title: doc.title,
      type: "article",
      url: paths[locale],
    },
    title: doc.title,
    twitter: { card: "summary_large_image", description: doc.description, title: doc.title },
  };
}
