import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { docPath, homePath, isLocale, localePrefix, locales, ogLocales } from "@/lib/i18n/config";
import { notFoundLocaleBootstrap, notFoundLocaleForPathname } from "@/lib/i18n/not-found";

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

describe("global not-found locale selection", () => {
  test("uses an exact supported leading segment and otherwise defaults to English", () => {
    expect(notFoundLocaleForPathname("/fr/route-inconnue")).toBe("fr");
    expect(notFoundLocaleForPathname("/es/ruta-desconocida")).toBe("es");
    expect(notFoundLocaleForPathname("/docs/missing")).toBe("en");
    expect(notFoundLocaleForPathname("/FR/route-inconnue")).toBe("en");
    expect(notFoundLocaleForPathname("/french/route-inconnue")).toBe("en");
  });

  test("bootstraps the document language before rendering localized 404 copy", () => {
    expect(notFoundLocaleBootstrap).toContain("window.location.pathname");
    expect(notFoundLocaleBootstrap).toContain("document.documentElement.lang = locale");
    expect(notFoundLocaleBootstrap).toContain(
      "document.documentElement.dataset.notFoundLocale = locale",
    );
    expect(notFoundLocaleBootstrap).not.toContain("</script");
  });

  test("executes the shipped bootstrap for French, Spanish, and fallback paths", () => {
    for (const [pathname, expected] of [
      ["/fr/route-inconnue", "fr"],
      ["/es/ruta-desconocida", "es"],
      ["/docs/missing", "en"],
    ] as const) {
      const documentElement = { dataset: {} as Record<string, string>, lang: "en" };
      runInNewContext(notFoundLocaleBootstrap, {
        document: { documentElement },
        window: { location: { pathname } },
      });

      expect(documentElement.lang).toBe(expected);
      expect(documentElement.dataset.notFoundLocale).toBe(expected);
    }
  });
});
