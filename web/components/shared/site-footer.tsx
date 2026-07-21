import type { Dictionary } from "@/lib/i18n/types";
import { BUY_ME_A_COFFEE_URL, GITHUB_URL } from "@/lib/site-config";

export function SiteFooter({ t }: { t: Dictionary["chrome"] }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="wordmark wordmark-small">
          Inbox<span>Tap</span>
        </span>
        <span>{t.footerTagline}</span>
        <span className="site-footer-links">
          <a href={BUY_ME_A_COFFEE_URL}>{t.supportLabel} ☕</a>
          <a aria-label={t.footerGitHubAria} href={GITHUB_URL}>
            GitHub ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
