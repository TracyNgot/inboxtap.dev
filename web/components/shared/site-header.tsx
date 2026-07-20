import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link aria-label="InboxTap home" className="wordmark" href="/">
          Inbox<span>Tap</span>
        </Link>
        <nav aria-label="Primary navigation" className="primary-nav">
          <Link href="/#features">Features</Link>
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/TracyNgot/inboxtap.dev">GitHub</a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
