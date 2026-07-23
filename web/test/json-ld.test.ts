import { describe, expect, test } from "bun:test";
import { serializeJsonLd } from "@/components/shared/json-ld";
import { docJsonLd, resourceJsonLd } from "@/lib/seo/json-ld";
import {
  CONTENT_PUBLISHED_AT,
  CONTENT_UPDATED_AT,
  RESOURCE_PUBLISHED_AT,
  RESOURCE_UPDATED_AT,
} from "@/lib/site-config";

function articleFrom(data: object): Record<string, unknown> {
  const graph = (data as { "@graph": Record<string, unknown>[] })["@graph"];
  const article = graph.find((entry) => entry["@type"] === "TechArticle");
  if (!article) throw new Error("Expected a TechArticle JSON-LD entry");
  return article;
}

describe("JSON-LD serialization", () => {
  test("escapes script-closing markup without changing the represented data", () => {
    const data = {
      description: 'A < B and "</script><script>alert(1)</script>" stays data',
      nested: { value: "<strong>InboxTap</strong>" },
    };

    const serialized = serializeJsonLd(data);

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain("</script");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized)).toEqual(data);
  });

  test("uses publication dates that match each content family", () => {
    const docArticle = articleFrom(docJsonLd("en", "installation"));
    const resourceArticle = articleFrom(resourceJsonLd("en", "integrations/playwright"));

    expect(docArticle.datePublished).toBe(CONTENT_PUBLISHED_AT.toISOString());
    expect(docArticle.dateModified).toBe(CONTENT_UPDATED_AT.toISOString());
    expect(resourceArticle.datePublished).toBe(RESOURCE_PUBLISHED_AT.toISOString());
    expect(resourceArticle.dateModified).toBe(RESOURCE_UPDATED_AT.toISOString());
  });
});
