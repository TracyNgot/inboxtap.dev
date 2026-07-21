import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import type { DocKey } from "../docs-config";
import type { Locale } from "../i18n/config";
import { contentEn } from "./en";
import { contentEs } from "./es";
import { contentFr } from "./fr";

export type DocContent = ComponentType<{ components?: MDXComponents }>;

const contentByLocale: Record<Locale, Record<DocKey, DocContent>> = {
  en: contentEn,
  es: contentEs,
  fr: contentFr,
};

export function getDocContent(locale: Locale, key: DocKey): DocContent {
  return contentByLocale[locale][key];
}
