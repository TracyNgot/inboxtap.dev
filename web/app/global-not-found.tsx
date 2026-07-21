import type { Metadata } from "next";
import { RootDocument } from "@/components/shared/root-document";
import { getDictionary } from "@/lib/i18n";
import { docPath, homePath, withTrailingSlash } from "@/lib/i18n/config";
import { siteViewport } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  robots: { index: false },
  title: "404 · InboxTap",
};

export const viewport = siteViewport;

export default function GlobalNotFound() {
  const en = getDictionary("en").notFound;
  const fr = getDictionary("fr").notFound;
  const es = getDictionary("es").notFound;

  return (
    <RootDocument lang="en">
      <main className="not-found-page">
        <p className="eyebrow">{en.eyebrow}</p>
        <h1>{en.title}</h1>
        <p>{en.text}</p>
        <div>
          <a className="button button-primary" href="/">
            {en.goHome}
          </a>
          <a className="button button-ghost" href={withTrailingSlash(docPath("en", ""))}>
            {en.readDocs}
          </a>
        </div>
        <p lang="fr">
          {fr.title} <a href={withTrailingSlash(homePath("fr"))}>{fr.goHome}</a> ·{" "}
          <a href={withTrailingSlash(docPath("fr", ""))}>{fr.readDocs}</a>
        </p>
        <p lang="es">
          {es.title} <a href={withTrailingSlash(homePath("es"))}>{es.goHome}</a> ·{" "}
          <a href={withTrailingSlash(docPath("es", ""))}>{es.readDocs}</a>
        </p>
      </main>
    </RootDocument>
  );
}
