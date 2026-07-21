import type { MetadataRoute } from "next";
import { docAlternatePaths, getLocalizedDocs } from "@/lib/i18n";
import { homePath, type Locale, locales, withTrailingSlash } from "@/lib/i18n/config";
import { CONTENT_UPDATED_AT, SITE_ORIGIN } from "@/lib/site-config";

export const dynamic = "force-static";

function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${withTrailingSlash(path)}`;
}

function languageAlternates(paths: Record<Locale, string>) {
  return {
    en: absoluteUrl(paths.en),
    es: absoluteUrl(paths.es),
    fr: absoluteUrl(paths.fr),
    "x-default": absoluteUrl(paths.en),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homePaths = Object.fromEntries(
    locales.map((locale) => [locale, homePath(locale)]),
  ) as Record<Locale, string>;

  const entries: MetadataRoute.Sitemap = locales.map((locale) => ({
    alternates: { languages: languageAlternates(homePaths) },
    changeFrequency: "monthly",
    lastModified: CONTENT_UPDATED_AT,
    priority: 1,
    url: absoluteUrl(homePaths[locale]),
  }));

  for (const locale of locales) {
    for (const doc of getLocalizedDocs(locale)) {
      entries.push({
        alternates: { languages: languageAlternates(docAlternatePaths(doc.key)) },
        changeFrequency: "monthly",
        lastModified: CONTENT_UPDATED_AT,
        priority: doc.slug ? 0.7 : 0.9,
        url: absoluteUrl(doc.path),
      });
    }
  }

  return entries;
}
