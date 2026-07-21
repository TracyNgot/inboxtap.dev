import { describe, expect, test } from "bun:test";
import { docPath, homePath, isLocale, localePrefix, locales, ogLocales } from "@/lib/i18n/config";

describe("i18n path helpers", () => {
  test("prefixes secondary locales only", () => {
    expect(localePrefix("en")).toBe("");
    expect(localePrefix("fr")).toBe("/fr");
    expect(localePrefix("es")).toBe("/es");
  });

  test("builds home paths", () => {
    expect(homePath("en")).toBe("/");
    expect(homePath("fr")).toBe("/fr");
    expect(homePath("es")).toBe("/es");
  });

  test("builds doc paths from localized slugs", () => {
    expect(docPath("en", "")).toBe("/docs");
    expect(docPath("en", "quick-start")).toBe("/docs/quick-start");
    expect(docPath("fr", "demarrage-rapide")).toBe("/fr/docs/demarrage-rapide");
    expect(docPath("es", "referencia/api-http")).toBe("/es/docs/referencia/api-http");
  });

  test("recognizes locales and og locale mappings", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("docs")).toBe(false);
    for (const locale of locales) expect(ogLocales[locale]).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
  });
});
