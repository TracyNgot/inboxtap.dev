import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import { examplesLandingContent } from "@/components/docs/examples-landing";
import type { CoreDocKey, DocKey } from "../docs-config";
import { getExampleByKey, isExampleDocKey } from "../example-registry";
import type { Locale } from "../i18n/config";
import { contentEn } from "./en";
import { contentEs } from "./es";
import { contentFr } from "./fr";

export type DocContent = ComponentType<{ components?: MDXComponents }>;

const contentByLocale: Record<Locale, Record<CoreDocKey, DocContent>> = {
  en: contentEn,
  es: contentEs,
  fr: contentFr,
};

export function getDocContent(locale: Locale, key: DocKey): DocContent {
  if (key === "examples") return examplesLandingContent(locale);
  if (isExampleDocKey(key)) return getExampleByKey(key).content[locale];
  return contentByLocale[locale][key as CoreDocKey];
}
