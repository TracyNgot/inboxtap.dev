import { describe, expect, test } from "bun:test";
import { docGroups, docs } from "@/lib/docs-config";
import { getAdjacentDocs, getDocBySegments, getLocalizedDocs } from "@/lib/i18n";
import { locales } from "@/lib/i18n/config";

describe("documentation registry", () => {
  test("defines unique keys and localized slugs and paths per locale", () => {
    expect(new Set(docs.map((doc) => doc.key)).size).toBe(docs.length);
    for (const locale of locales) {
      const localized = getLocalizedDocs(locale);
      expect(new Set(localized.map((doc) => doc.slug)).size).toBe(localized.length);
      expect(new Set(localized.map((doc) => doc.path)).size).toBe(localized.length);
      expect(localized[0]?.slug).toBe("");
    }
  });

  test("keeps every document in a known navigation group", () => {
    for (const doc of docs) expect(docGroups).toContain(doc.group);
    for (const group of docGroups) expect(docs.some((doc) => doc.group === group)).toBe(true);
  });

  test("resolves route segments and adjacent navigation per locale", () => {
    for (const locale of locales) {
      const localized = getLocalizedDocs(locale);
      for (const [index, doc] of localized.entries()) {
        expect(getDocBySegments(locale, doc.slug ? doc.slug.split("/") : [])).toBe(doc);
        expect(getAdjacentDocs(locale, doc.key).previous).toBe(localized[index - 1]);
        expect(getAdjacentDocs(locale, doc.key).next).toBe(localized[index + 1]);
      }
    }
  });

  test("defines unique table-of-contents anchors per page and locale", () => {
    for (const locale of locales) {
      for (const doc of getLocalizedDocs(locale)) {
        const ids = doc.toc.map((item) => item.id);
        expect(new Set(ids).size).toBe(ids.length);
        // The changelog's anchors come from CHANGELOG.md at build time, so it is
        // the only page allowed an empty static table of contents.
        if (doc.key !== "changelog") expect(ids.length).toBeGreaterThan(0);
      }
    }
  });

  test("keeps table-of-contents structure aligned across locales", () => {
    const reference = getLocalizedDocs("en");
    for (const locale of locales) {
      for (const [index, doc] of getLocalizedDocs(locale).entries()) {
        expect(doc.toc.length).toBe(reference[index]?.toc.length ?? -1);
      }
    }
  });
});
