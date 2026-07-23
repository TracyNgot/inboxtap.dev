import type { Locale } from "../i18n/config";
import { localePrefix, locales } from "../i18n/config";
import { resourcesEn } from "./content/en";
import { resourcesEs } from "./content/es";
import { resourcesFr } from "./content/fr";
import {
  type ResourceContentDictionary,
  type ResourcePageContent,
  type ResourcePageKey,
  resourcePageKeys,
} from "./types";

const resourceDictionaries = {
  en: resourcesEn,
  es: resourcesEs,
  fr: resourcesFr,
} as const satisfies Record<Locale, ResourceContentDictionary>;

export interface LocalizedResource extends ResourcePageContent {
  key: ResourcePageKey;
  path: string;
}

function resourcePath(locale: Locale, content: ResourcePageContent): string {
  return `${localePrefix(locale)}/${content.section}/${content.slug}`;
}

function buildLocalizedResources(locale: Locale): readonly LocalizedResource[] {
  return resourcePageKeys.map((key) => {
    const content = resourceDictionaries[locale][key];
    return { ...content, key, path: resourcePath(locale, content) };
  });
}

const localizedResources: Record<Locale, readonly LocalizedResource[]> = {
  en: buildLocalizedResources("en"),
  es: buildLocalizedResources("es"),
  fr: buildLocalizedResources("fr"),
};

export function getLocalizedResources(locale: Locale): readonly LocalizedResource[] {
  return localizedResources[locale];
}

export function getLocalizedResource(locale: Locale, key: ResourcePageKey): LocalizedResource {
  const resource = localizedResources[locale].find((candidate) => candidate.key === key);
  if (!resource) throw new Error(`Unknown resource page: ${key}`);
  return resource;
}

export function getResourceBySegments(locale: Locale, section: string, slug: string) {
  return localizedResources[locale].find(
    (resource) => resource.section === section && resource.slug === slug,
  );
}

export function resourceAlternatePaths(key: ResourcePageKey): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalizedResource(locale, key).path]),
  ) as Record<Locale, string>;
}

export function getResourceRouteAlternates(): Record<string, Record<Locale, string>> {
  const map: Record<string, Record<Locale, string>> = {};
  for (const key of resourcePageKeys) {
    const alternates = resourceAlternatePaths(key);
    for (const locale of locales) map[alternates[locale]] = alternates;
  }
  return map;
}

export function getRelatedResources(
  locale: Locale,
  key: ResourcePageKey,
): readonly LocalizedResource[] {
  const current = getLocalizedResource(locale, key);
  return localizedResources[locale]
    .filter((resource) => resource.kind === current.kind && resource.key !== key)
    .slice(0, 3);
}

export type {
  ResourceCode,
  ResourceContentDictionary,
  ResourceKind,
  ResourceLink,
  ResourcePageContent,
  ResourcePageKey,
  ResourceSection,
  ResourceTable,
} from "./types";
export { resourcePageKeys } from "./types";
