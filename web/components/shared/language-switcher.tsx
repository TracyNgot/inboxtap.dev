"use client";

import { usePathname } from "next/navigation";
import { homePath, type Locale, locales, withTrailingSlash } from "@/lib/i18n/config";

const labels: Record<Locale, string> = { en: "EN", es: "ES", fr: "FR" };

interface LanguageSwitcherProps {
  ariaLabel: string;
  currentLocale: Locale;
  alternates: Record<string, Record<Locale, string>>;
}

export function LanguageSwitcher({ alternates, ariaLabel, currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const targets = alternates[normalized];

  return (
    <nav aria-label={ariaLabel} className="language-switcher">
      {locales.map((locale) => (
        <a
          aria-current={locale === currentLocale ? "true" : undefined}
          href={withTrailingSlash(targets?.[locale] ?? homePath(locale))}
          hrefLang={locale}
          key={locale}
        >
          {labels[locale]}
        </a>
      ))}
    </nav>
  );
}
