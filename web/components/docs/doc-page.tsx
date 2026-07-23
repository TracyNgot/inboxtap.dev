import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { JsonLd } from "@/components/shared/json-ld";
import { getDocContent } from "@/lib/content";
import type { DocKey } from "@/lib/docs-config";
import { getAdjacentDocs, getDictionary, getLocalizedDoc } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { docJsonLd } from "@/lib/seo/json-ld";
import { CONTENT_UPDATED_AT, CONTRIBUTORS_URL } from "@/lib/site-config";
import { CodeBlock } from "./code-block";
import { TableOfContents } from "./table-of-contents";

export function DocPage({ docKey, locale }: { docKey: DocKey; locale: Locale }) {
  const doc = getLocalizedDoc(locale, docKey);
  const t = getDictionary(locale).docsChrome;
  const Content = getDocContent(locale, docKey);
  const adjacent = getAdjacentDocs(locale, docKey);
  const updatedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(CONTENT_UPDATED_AT);
  const labels = { copied: t.copied, copy: t.copy, copyAria: t.copyAria };
  const pre = (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} labels={labels} />;

  return (
    <div className="docs-page-grid">
      <JsonLd data={docJsonLd(locale, docKey)} />
      <article className="docs-article">
        <header className="docs-article-header">
          <p>{doc.groupLabel}</p>
          <h1>{doc.title}</h1>
          <span>{doc.description}</span>
          <div className="docs-article-meta">
            <span>
              {t.maintainedBy} <a href={CONTRIBUTORS_URL}>{t.contributors}</a>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.lastUpdated} <time dateTime={CONTENT_UPDATED_AT.toISOString()}>{updatedAt}</time>
            </span>
          </div>
        </header>
        <div className="docs-prose">
          <Content components={{ pre }} />
        </div>
        <nav aria-label={t.pagerAria} className="docs-pager">
          {adjacent.previous ? (
            <Link href={adjacent.previous.path}>
              <span>{t.previous}</span>
              {adjacent.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={adjacent.next.path}>
              <span>{t.next}</span>
              {adjacent.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
      {doc.toc.length > 0 ? <TableOfContents heading={t.tocHeading} items={doc.toc} /> : null}
    </div>
  );
}
