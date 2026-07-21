import Link from "next/link";
import { getRouteAlternates } from "@/lib/i18n";
import { docPath, homePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { GITHUB_URL } from "@/lib/site-config";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const routeAlternates = getRouteAlternates();

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary["chrome"] }) {
  const home = homePath(locale);
  const featuresHref = home === "/" ? "/#features" : `${home}/#features`;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link aria-label={t.wordmarkAria} className="wordmark" href={home}>
          Inbox<span>Tap</span>
        </Link>
        <nav aria-label={t.navAria} className="primary-nav">
          <Link href={featuresHref}>{t.navFeatures}</Link>
          <Link href={docPath(locale, "")}>{t.navDocs}</Link>
          <a href={GITHUB_URL}>GitHub</a>
        </nav>
        <LanguageSwitcher
          alternates={routeAlternates}
          ariaLabel={t.languageSwitcherAria}
          currentLocale={locale}
        />
        <ThemeToggle
          labels={{
            toDark: t.themeSwitchToDark,
            toggle: t.themeToggleAria,
            toLight: t.themeSwitchToLight,
          }}
        />
      </div>
    </header>
  );
}
