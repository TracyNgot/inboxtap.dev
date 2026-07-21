export const locales = ["en", "fr", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const translatedLocales = locales.filter((locale) => locale !== defaultLocale);

export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) throw new Error(`Unsupported locale: ${value}`);
  return value;
}

export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function homePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

export function docPath(locale: Locale, slug: string): string {
  return `${localePrefix(locale)}/docs${slug ? `/${slug}` : ""}`;
}

export function withTrailingSlash(path: string): string {
  return path === "/" ? path : `${path}/`;
}
