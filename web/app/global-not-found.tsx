import type { Metadata } from "next";
import { RootDocument } from "@/components/shared/root-document";
import { getDictionary } from "@/lib/i18n";
import { docPath, homePath, locales, withTrailingSlash } from "@/lib/i18n/config";
import { notFoundLocaleBootstrap } from "@/lib/i18n/not-found";
import { siteViewport } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  robots: { index: false },
  title: "404 · InboxTap",
};

export const viewport = siteViewport;

export default function GlobalNotFound() {
  return (
    <RootDocument
      bootstrapScript={notFoundLocaleBootstrap}
      htmlAttributes={{ "data-not-found-locale": "en" }}
      lang="en"
    >
      <main className="not-found-page">
        {locales.map((locale) => {
          const t = getDictionary(locale).notFound;
          return (
            <section
              aria-labelledby={`not-found-title-${locale}`}
              className="not-found-localized"
              data-locale={locale}
              key={locale}
              lang={locale}
            >
              <p className="eyebrow">{t.eyebrow}</p>
              <h1 id={`not-found-title-${locale}`}>{t.title}</h1>
              <p>{t.text}</p>
              <div>
                <a className="button button-primary" href={withTrailingSlash(homePath(locale))}>
                  {t.goHome}
                </a>
                <a className="button button-ghost" href={withTrailingSlash(docPath(locale, ""))}>
                  {t.readDocs}
                </a>
              </div>
            </section>
          );
        })}
      </main>
    </RootDocument>
  );
}
