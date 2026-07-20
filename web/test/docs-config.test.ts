import { describe, expect, test } from "bun:test";
import { docGroups, docs, getAdjacentDocs, getDocBySegments } from "@/lib/docs-config";

describe("documentation registry", () => {
  test("defines unique static slugs and paths", () => {
    expect(new Set(docs.map((doc) => doc.slug)).size).toBe(docs.length);
    expect(new Set(docs.map((doc) => doc.path)).size).toBe(docs.length);
    expect(docs[0]?.path).toBe("/docs");
    expect(docs[0]?.slug).toBe("");
  });

  test("keeps every document in a known navigation group", () => {
    const groupKeys = new Set(docGroups.map((group) => group.key));
    expect(docs.every((doc) => groupKeys.has(doc.group))).toBe(true);
    expect(docGroups.every((group) => docs.some((doc) => doc.group === group.key))).toBe(true);
  });

  test("resolves route segments and adjacent navigation", () => {
    for (const [index, doc] of docs.entries()) {
      expect(getDocBySegments(doc.slug ? doc.slug.split("/") : [])).toBe(doc);
      expect(getAdjacentDocs(doc.slug).previous).toBe(docs[index - 1]);
      expect(getAdjacentDocs(doc.slug).next).toBe(docs[index + 1]);
    }
  });

  test("defines unique table-of-contents anchors per page", () => {
    for (const doc of docs) {
      const ids = doc.toc.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThan(0);
    }
  });
});
