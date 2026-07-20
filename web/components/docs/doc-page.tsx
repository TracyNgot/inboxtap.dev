import Link from "next/link";
import { getDocContent } from "@/lib/docs-content";
import { getAdjacentDocs, type DocSlug, getDocBySlug, getDocGroup } from "@/lib/docs-config";
import { TableOfContents } from "./table-of-contents";

export function DocPage({ slug }: { slug: DocSlug }) {
  const doc = getDocBySlug(slug);
  if (!doc) return null;
  const Content = getDocContent(slug);
  const adjacent = getAdjacentDocs(slug);
  const group = getDocGroup(doc.group);

  return (
    <div className="docs-page-grid">
      <article className="docs-article">
        <header className="docs-article-header">
          <p>{group.label}</p>
          <h1>{doc.title}</h1>
          <span>{doc.description}</span>
        </header>
        <div className="docs-prose">
          <Content />
        </div>
        <nav aria-label="Adjacent documentation" className="docs-pager">
          {adjacent.previous ? (
            <Link href={adjacent.previous.path}>
              <span>Previous</span>
              {adjacent.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={adjacent.next.path}>
              <span>Next</span>
              {adjacent.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
      <TableOfContents items={doc.toc} />
    </div>
  );
}
