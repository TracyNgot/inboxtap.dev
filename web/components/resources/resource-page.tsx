import Link from "next/link";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { HighlightedCode } from "@/components/landing/highlighted-code";
import { JsonLd } from "@/components/shared/json-ld";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getDictionary, getLocalizedDoc } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  getLocalizedResource,
  getRelatedResources,
  type ResourcePageKey,
  type ResourceTable,
} from "@/lib/resources";
import { resourceJsonLd } from "@/lib/seo/json-ld";
import { CONTRIBUTORS_URL, RESOURCE_UPDATED_AT } from "@/lib/site-config";

function ResourceDataTable({ table }: { table: ResourceTable }) {
  return (
    <table>
      <thead>
        <tr>
          {table.headers.map((header) => (
            <th key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row) => (
          <tr key={row.join("\u0000")}>
            {table.headers.map((header, columnIndex) => (
              <td key={header}>{row[columnIndex]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ResourcePage({
  locale,
  resourceKey,
}: {
  locale: Locale;
  resourceKey: ResourcePageKey;
}) {
  const dictionary = getDictionary(locale);
  const resource = getLocalizedResource(locale, resourceKey);
  const related = getRelatedResources(locale, resourceKey);
  const groupLabel = dictionary.resourcesChrome.groups[resource.kind];
  const updatedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(RESOURCE_UPDATED_AT);

  return (
    <>
      <JsonLd data={resourceJsonLd(locale, resourceKey)} />
      <SiteHeader locale={locale} t={dictionary.chrome} />
      <main className="resource-main">
        <div className="docs-page-grid resource-page-grid">
          <article className="docs-article">
            <header className="docs-article-header">
              <p>{resource.eyebrow}</p>
              <h1>{resource.title}</h1>
              <span>{resource.intro}</span>
              <div className="docs-article-meta">
                <span>{groupLabel}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {dictionary.docsChrome.maintainedBy}{" "}
                  <a href={CONTRIBUTORS_URL}>{dictionary.docsChrome.contributors}</a>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {dictionary.docsChrome.lastUpdated}{" "}
                  <time dateTime={RESOURCE_UPDATED_AT.toISOString()}>{updatedAt}</time>
                </span>
              </div>
            </header>

            <div className="docs-prose resource-prose">
              {resource.sections.map((section) => (
                <section key={section.id}>
                  <h2 id={section.id}>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.table ? <ResourceDataTable table={section.table} /> : null}
                  {section.code ? (
                    <div className="resource-code">
                      <div>{section.code.filename}</div>
                      <HighlightedCode code={section.code.source} lang={section.code.language} />
                    </div>
                  ) : null}
                  {section.links ? (
                    <ul className="resource-source-links">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href}>{link.label} ↗</a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <section className="glass-card resource-cta">
              <h2>{resource.cta.title}</h2>
              <p>{resource.cta.description}</p>
              <Link
                className="button button-primary"
                href={getLocalizedDoc(locale, resource.relatedDocKey).path}
              >
                {resource.cta.label}
              </Link>
            </section>

            <section className="resource-related">
              <h2>{dictionary.resourcesChrome.relatedHeading}</h2>
              <div>
                {related.map((item) => (
                  <Link href={item.path} key={item.key}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          </article>
          <TableOfContents
            heading={dictionary.resourcesChrome.tocHeading}
            items={resource.sections.map(({ id, title }) => ({ id, label: title }))}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={dictionary.chrome} />
    </>
  );
}
