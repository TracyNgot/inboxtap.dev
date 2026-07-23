import { describe, expect, test } from "bun:test";
import { locales } from "@/lib/i18n/config";
import {
  getLocalizedResource,
  getLocalizedResources,
  getResourceBySegments,
  getResourceRouteAlternates,
  type ResourcePageContent,
  type ResourcePageKey,
  resourceAlternatePaths,
  resourcePageKeys,
} from "@/lib/resources";

const expectedKeys = [
  "integrations/playwright",
  "integrations/cypress",
  "integrations/vitest",
  "integrations/better-auth",
  "integrations/supabase",
  "integrations/nodemailer",
  "guides/test-magic-links",
  "guides/test-email-otp",
  "guides/test-password-reset-emails",
  "compare/mailhog",
  "compare/mailpit",
  "compare/mailtrap",
] as const satisfies readonly ResourcePageKey[];

const expectedEnglishPaths = {
  "compare/mailhog": "/compare/mailhog",
  "compare/mailpit": "/compare/mailpit",
  "compare/mailtrap": "/compare/mailtrap",
  "guides/test-email-otp": "/guides/test-email-otp",
  "guides/test-magic-links": "/guides/test-magic-links",
  "guides/test-password-reset-emails": "/guides/test-password-reset-emails",
  "integrations/better-auth": "/integrations/better-auth",
  "integrations/cypress": "/integrations/cypress",
  "integrations/nodemailer": "/integrations/nodemailer",
  "integrations/playwright": "/integrations/playwright",
  "integrations/supabase": "/integrations/supabase",
  "integrations/vitest": "/integrations/vitest",
} as const satisfies Record<ResourcePageKey, string>;

const localizedPathPrefixes = {
  en: {
    compare: "/compare/",
    guides: "/guides/",
    integrations: "/integrations/",
  },
  es: {
    compare: "/es/comparar/",
    guides: "/es/guias/",
    integrations: "/es/integraciones/",
  },
  fr: {
    compare: "/fr/comparer/",
    guides: "/fr/guides/",
    integrations: "/fr/integrations/",
  },
} as const;

function tableShapes(resource: ResourcePageContent) {
  return resource.sections.map((section) =>
    section.table
      ? {
          columns: section.table.headers.length,
          rows: section.table.rows.length,
        }
      : null,
  );
}

function codeBlocks(resource: ResourcePageContent) {
  return resource.sections.map((section) => section.code ?? null);
}

describe("resource page registry", () => {
  test("defines exactly the 12 stable public keys and 36 localized pages", () => {
    expect(resourcePageKeys).toEqual([...expectedKeys]);
    expect(new Set(resourcePageKeys).size).toBe(12);

    const pages = locales.flatMap((locale) => getLocalizedResources(locale));
    expect(pages).toHaveLength(36);

    for (const locale of locales) {
      const localized = getLocalizedResources(locale);
      expect(localized).toHaveLength(12);
      expect(localized.map(({ key }) => key)).toEqual([...expectedKeys]);
      expect(new Set(localized.map(({ key }) => key)).size).toBe(12);
    }
  });

  test("publishes every requested English path exactly", () => {
    expect(
      Object.fromEntries(getLocalizedResources("en").map(({ key, path }) => [key, path])),
    ).toEqual(expectedEnglishPaths);
  });

  test("keeps paths globally unique and in their localized path families", () => {
    const allPaths = locales.flatMap((locale) =>
      getLocalizedResources(locale).map(({ path }) => path),
    );
    expect(new Set(allPaths).size).toBe(36);

    for (const locale of locales) {
      for (const resource of getLocalizedResources(locale)) {
        expect(resource.path).toStartWith(localizedPathPrefixes[locale][resource.kind]);
        expect(resource.path).not.toContain("/en/");
        expect(getResourceBySegments(locale, resource.section, resource.slug)).toBe(resource);
      }
    }
  });

  test("keeps section counts, table shapes, and executable code aligned across locales", () => {
    for (const key of resourcePageKeys) {
      const english = getLocalizedResource("en", key);

      for (const locale of ["fr", "es"] as const) {
        const translated = getLocalizedResource(locale, key);
        expect(translated.sections.length, `${locale}/${key} section count`).toBe(
          english.sections.length,
        );
        const translatedIds = translated.sections.map(({ id }) => id);
        expect(new Set(translatedIds).size, `${locale}/${key} unique section anchors`).toBe(
          translatedIds.length,
        );
        for (const [index, id] of translatedIds.entries()) {
          expect(id, `${locale}/${key} localized section ${index + 1}`).not.toBe(
            english.sections[index]?.id,
          );
        }
        expect(tableShapes(translated), `${locale}/${key} table shapes`).toEqual(
          tableShapes(english),
        );
        expect(codeBlocks(translated), `${locale}/${key} code blocks`).toEqual(codeBlocks(english));
      }
    }
  });

  test("uses translated page metadata instead of English fallback copy", () => {
    for (const key of resourcePageKeys) {
      const english = getLocalizedResource("en", key);

      for (const locale of ["fr", "es"] as const) {
        const translated = getLocalizedResource(locale, key);
        expect(translated.title, `${locale}/${key} title`).not.toBe(english.title);
        expect(translated.description, `${locale}/${key} description`).not.toBe(
          english.description,
        );
        expect(translated.eyebrow, `${locale}/${key} eyebrow`).not.toBe(english.eyebrow);
        expect(translated.intro, `${locale}/${key} introduction`).not.toBe(english.intro);
        expect(translated.cta, `${locale}/${key} call to action`).not.toEqual(english.cta);
      }
    }
  });

  test("provides reciprocal locale alternates for every localized path", () => {
    const routeAlternates = getResourceRouteAlternates();
    expect(Object.keys(routeAlternates)).toHaveLength(36);

    for (const key of resourcePageKeys) {
      const alternates = resourceAlternatePaths(key);
      expect(Object.keys(alternates).sort()).toEqual([...locales].sort());

      for (const locale of locales) {
        expect(alternates[locale]).toBe(getLocalizedResource(locale, key).path);
        expect(routeAlternates[alternates[locale]]).toEqual(alternates);
      }
    }
  });

  test("keeps every table row aligned with its declared columns", () => {
    for (const locale of locales) {
      for (const resource of getLocalizedResources(locale)) {
        for (const section of resource.sections) {
          if (!section.table) continue;

          expect(
            section.table.headers.length,
            `${locale}/${resource.key}#${section.id} column count`,
          ).toBeGreaterThan(0);
          for (const [index, row] of section.table.rows.entries()) {
            expect(row.length, `${locale}/${resource.key}#${section.id} row ${index + 1}`).toBe(
              section.table.headers.length,
            );
          }
        }
      }
    }
  });
});
