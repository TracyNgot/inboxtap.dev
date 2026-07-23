import { type CoreDocKey, type DocGroup, type DocKey, docs } from "../docs-config";
import {
  getExampleDocStrings,
  getExamplesLandingStrings,
  isExampleDocKey,
} from "../example-registry";
import { getResourceRouteAlternates } from "../resources";
import { docPath, homePath, type Locale, locales } from "./config";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { fr } from "./dictionaries/fr";
import { docsEn } from "./docs/en";
import { docsEs } from "./docs/es";
import { docsFr } from "./docs/fr";
import type { Dictionary, DocsDictionary, TocItem } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, es, fr };
const docsDictionaries: Record<Locale, DocsDictionary> = { en: docsEn, es: docsEs, fr: docsFr };

export interface LocalizedDoc {
  key: DocKey;
  group: DocGroup;
  groupLabel: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  toc: readonly TocItem[];
}

function buildLocalizedDocs(locale: Locale): readonly LocalizedDoc[] {
  const dictionary = docsDictionaries[locale];
  return docs.map(({ group, key }) => {
    const strings =
      key === "examples"
        ? getExamplesLandingStrings(locale)
        : isExampleDocKey(key)
          ? getExampleDocStrings(locale, key)
          : dictionary.entries[key as CoreDocKey];
    return {
      description: strings.description,
      group,
      groupLabel: dictionary.groups[group],
      key,
      path: docPath(locale, strings.slug),
      slug: strings.slug,
      title: strings.title,
      toc: strings.toc,
    };
  });
}

const localizedDocs = Object.fromEntries(
  locales.map((locale) => [locale, buildLocalizedDocs(locale)]),
) as Record<Locale, readonly LocalizedDoc[]>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getDocsDictionary(locale: Locale): DocsDictionary {
  return docsDictionaries[locale];
}

export function getLocalizedDocs(locale: Locale): readonly LocalizedDoc[] {
  return localizedDocs[locale];
}

export function getLocalizedDoc(locale: Locale, key: DocKey): LocalizedDoc {
  const doc = localizedDocs[locale].find((candidate) => candidate.key === key);
  if (!doc) throw new Error(`Unknown documentation key: ${key}`);
  return doc;
}

export function getDocBySegments(locale: Locale, segments: readonly string[] = []) {
  const slug = segments.join("/");
  return localizedDocs[locale].find((doc) => doc.slug === slug);
}

export function getAdjacentDocs(locale: Locale, key: DocKey) {
  const docsForLocale = localizedDocs[locale];
  const index = docsForLocale.findIndex((doc) => doc.key === key);
  return { next: docsForLocale[index + 1], previous: docsForLocale[index - 1] };
}

export function docAlternatePaths(key: DocKey): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalizedDoc(locale, key).path]),
  ) as Record<Locale, string>;
}

export function getRouteAlternates(): Record<string, Record<Locale, string>> {
  const map: Record<string, Record<Locale, string>> = {};
  const home = Object.fromEntries(locales.map((locale) => [locale, homePath(locale)])) as Record<
    Locale,
    string
  >;
  for (const locale of locales) map[home[locale]] = home;
  for (const { key } of docs) {
    const alternates = docAlternatePaths(key);
    for (const locale of locales) map[alternates[locale]] = alternates;
  }
  Object.assign(map, getResourceRouteAlternates());
  return map;
}
