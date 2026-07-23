import type { Metadata, Viewport } from "next";
import type { DocKey } from "../docs-config";
import { docAlternatePaths, getDictionary, getLocalizedDoc } from "../i18n";
import { homePath, type Locale, locales, ogLocales } from "../i18n/config";
import { CONTRIBUTORS_URL, SITE_NAME, SITE_ORIGIN } from "../site-config";

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
  const dictionary = getDictionary(locale);
  const meta = dictionary.meta;
  const contributorName = `${SITE_NAME} — ${dictionary.docsChrome.contributors}`;
  const hasLocalizedSocialImage = locale === "en";
  const paths = Object.fromEntries(
    locales.map((candidate) => [candidate, homePath(candidate)]),
  ) as Record<Locale, string>;
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: meta.title, template: meta.titleTemplate },
    description: meta.description,
    authors: [{ name: contributorName, url: CONTRIBUTORS_URL }],
    creator: contributorName,
    publisher: SITE_NAME,
    alternates: { canonical: paths[locale], languages: languageAlternates(paths) },
    openGraph: {
      alternateLocale: alternateOgLocales(locale),
      description: meta.ogDescription,
      ...(hasLocalizedSocialImage ? { images: [`${SITE_ORIGIN}/opengraph-image.png`] } : {}),
      locale: ogLocales[locale],
      siteName: SITE_NAME,
      title: meta.title,
      type: "website",
      url: paths[locale],
    },
    twitter: {
      card: hasLocalizedSocialImage ? "summary_large_image" : "summary",
      description: meta.twitterDescription,
      ...(hasLocalizedSocialImage ? { images: [`${SITE_ORIGIN}/twitter-image.png`] } : {}),
      title: SITE_NAME,
    },
  };
}

export function docsLayoutMetadata(locale: Locale): Metadata {
  const meta = getDictionary(locale).meta;
  return { title: { default: meta.docsTitle, template: meta.docsTitleTemplate } };
}

export function docMetadata(locale: Locale, key: DocKey): Metadata {
  const dictionary = getDictionary(locale);
  const doc = getLocalizedDoc(locale, key);
  const paths = docAlternatePaths(key);
  const hasLocalizedSocialImage = locale === "en";
  const contributorName = `${SITE_NAME} — ${dictionary.docsChrome.contributors}`;
  return {
    alternates: { canonical: paths[locale], languages: languageAlternates(paths) },
    authors: [{ name: contributorName, url: CONTRIBUTORS_URL }],
    creator: contributorName,
    description: doc.description,
    openGraph: {
      alternateLocale: alternateOgLocales(locale),
      description: doc.description,
      ...(hasLocalizedSocialImage ? { images: [`${SITE_ORIGIN}/opengraph-image.png`] } : {}),
      locale: ogLocales[locale],
      siteName: SITE_NAME,
      title: doc.title,
      type: "article",
      url: paths[locale],
    },
    title: doc.title,
    publisher: SITE_NAME,
    twitter: {
      card: hasLocalizedSocialImage ? "summary_large_image" : "summary",
      description: doc.description,
      ...(hasLocalizedSocialImage ? { images: [`${SITE_ORIGIN}/twitter-image.png`] } : {}),
      title: doc.title,
    },
  };
}
