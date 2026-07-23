import { defaultLocale, type Locale, locales } from "./config";

export function notFoundLocaleForPathname(pathname: string): Locale {
  const candidate = pathname.split("/")[1];
  return locales.find((locale) => locale === candidate) ?? defaultLocale;
}

const serializedLocales = JSON.stringify(locales);

export const notFoundLocaleBootstrap = `
(() => {
  const candidate = window.location.pathname.split("/")[1];
  const locale = ${serializedLocales}.includes(candidate) ? candidate : "${defaultLocale}";
  document.documentElement.lang = locale;
  document.documentElement.dataset.notFoundLocale = locale;
})();`;
