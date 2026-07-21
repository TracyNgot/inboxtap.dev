import type { Dictionary } from "@/lib/i18n/types";
import { GITHUB_URL } from "@/lib/site-config";

export function SiteFooter({ t }: { t: Dictionary["chrome"] }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="wordmark wordmark-small">
          Inbox<span>Tap</span>
        </span>
        <span>{t.footerTagline}</span>
        <a aria-label={t.footerGitHubAria} href={GITHUB_URL}>
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
