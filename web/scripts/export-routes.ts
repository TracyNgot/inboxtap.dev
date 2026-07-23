import { isExampleDocKey } from "../lib/example-registry";
import { docAlternatePaths, getLocalizedDocs } from "../lib/i18n";
import { homePath, type Locale, locales, ogLocales, withTrailingSlash } from "../lib/i18n/config";
import { SITE_ORIGIN } from "../lib/site-config";

export interface ExpectedRoute {
  locale: Locale;
  path: string;
  file: string;
  canonical: string;
  hreflangs: Record<Locale | "x-default", string>;
  htmlLang: Locale;
  kind: "home" | "doc" | "example";
  ogLocale: string;
  tocIds: readonly string[];
  jsonLdTypes: readonly string[];
}

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${withTrailingSlash(path)}`;
}

function hreflangsFor(paths: Record<Locale, string>): Record<Locale | "x-default", string> {
  return {
    en: absoluteUrl(paths.en),
    es: absoluteUrl(paths.es),
    fr: absoluteUrl(paths.fr),
    "x-default": absoluteUrl(paths.en),
  };
}

export function expectedRoutes(): ExpectedRoute[] {
  const routes: ExpectedRoute[] = [];
  const homePaths = Object.fromEntries(
    locales.map((locale) => [locale, homePath(locale)]),
  ) as Record<Locale, string>;

  for (const locale of locales) {
    routes.push({
      canonical: absoluteUrl(homePaths[locale]),
      file: locale === "en" ? "index.html" : `${locale}/index.html`,
      hreflangs: hreflangsFor(homePaths),
      htmlLang: locale,
      jsonLdTypes: ["Organization", "SoftwareApplication"],
      kind: "home",
      locale,
      ogLocale: ogLocales[locale],
      path: homePaths[locale],
      tocIds: [],
    });
    for (const doc of getLocalizedDocs(locale)) {
      routes.push({
        canonical: absoluteUrl(doc.path),
        file: `${doc.path.slice(1)}/index.html`,
        hreflangs: hreflangsFor(docAlternatePaths(doc.key)),
        htmlLang: locale,
        jsonLdTypes: ["TechArticle", "Organization", "BreadcrumbList"],
        kind: isExampleDocKey(doc.key) ? "example" : "doc",
        locale,
        ogLocale: ogLocales[locale],
        path: doc.path,
        tocIds: doc.toc.map((item) => item.id),
      });
    }
  }
  return routes;
}
