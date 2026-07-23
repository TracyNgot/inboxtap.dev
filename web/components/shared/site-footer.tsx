import type { Dictionary } from "@/lib/i18n/types";
import { getLocalizedDoc } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { BUY_ME_A_COFFEE_URL, GITHUB_URL, NPM_URL } from "@/lib/site-config";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary["chrome"] }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="footer-brand">
          <span aria-hidden="true" className="footer-mark" />
          <span className="wordmark wordmark-small">
            Inbox<span>Tap</span>
          </span>
        </span>
        <span>{t.footerTagline}</span>
        <span className="site-footer-links">
          <a href={getLocalizedDoc(locale, "trust").path}>{t.trustLabel}</a>
          <a href={NPM_URL}>{t.npmLabel} ↗</a>
          <a href={BUY_ME_A_COFFEE_URL}>{t.supportLabel} ☕</a>
          <a aria-label={t.footerGitHubAria} href={GITHUB_URL}>
            GitHub ↗
          </a>
        </span>
        <a
          className="product-hunt-badge"
          href="https://www.producthunt.com/products/inboxtap?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inboxtap"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.productHuntLabel} ↗
        </a>
      </div>
    </footer>
  );
}
