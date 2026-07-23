import type { DocKey } from "../docs-config";
import { isExampleDocKey } from "../example-registry";
import { getDictionary, getLocalizedDoc } from "../i18n";
import { docPath, homePath, type Locale, withTrailingSlash } from "../i18n/config";
import {
  CONTENT_PUBLISHED_AT,
  CONTENT_UPDATED_AT,
  GITHUB_URL,
  NPM_URL,
  SITE_NAME,
  SITE_ORIGIN,
} from "../site-config";

const ORG_ID = `${SITE_ORIGIN}/#org`;

function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${withTrailingSlash(path)}`;
}

export function homeJsonLd(locale: Locale): object {
  const meta = getDictionary(locale).meta;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": ORG_ID,
        "@type": "Organization",
        logo: `${SITE_ORIGIN}/icon.svg`,
        name: SITE_NAME,
        sameAs: [GITHUB_URL, NPM_URL],
        url: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "SoftwareApplication",
        applicationCategory: "DeveloperApplication",
        description: meta.description,
        inLanguage: locale,
        license: `${GITHUB_URL}/blob/main/LICENSE`,
        name: SITE_NAME,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        operatingSystem: "macOS, Windows, Linux (Node.js 20+)",
        publisher: { "@id": ORG_ID },
        url: absoluteUrl(homePath(locale)),
      },
    ],
  };
}

export function docJsonLd(locale: Locale, key: DocKey): object {
  const doc = getLocalizedDoc(locale, key);
  const meta = getDictionary(locale).meta;
  const url = absoluteUrl(doc.path);
  const breadcrumbs = [
    { item: absoluteUrl(homePath(locale)), name: meta.breadcrumbHome },
    { item: absoluteUrl(docPath(locale, "")), name: meta.breadcrumbDocs },
    ...(key === "" ? [] : [{ item: url, name: doc.title }]),
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        author: { "@id": ORG_ID },
        datePublished: CONTENT_PUBLISHED_AT.toISOString(),
        dateModified: CONTENT_UPDATED_AT.toISOString(),
        description: doc.description,
        headline: doc.title,
        inLanguage: isExampleDocKey(key) ? "en" : locale,
        isAccessibleForFree: true,
        license: `${GITHUB_URL}/blob/main/LICENSE`,
        mainEntityOfPage: url,
        publisher: { "@id": ORG_ID },
        url,
      },
      {
        "@id": ORG_ID,
        "@type": "Organization",
        logo: `${SITE_ORIGIN}/icon.svg`,
        name: SITE_NAME,
        sameAs: [GITHUB_URL, NPM_URL],
        url: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          item: crumb.item,
          name: crumb.name,
          position: index + 1,
        })),
      },
    ],
  };
}
