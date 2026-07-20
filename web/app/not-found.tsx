import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found-page">
        <p className="eyebrow">404 · Message not captured</p>
        <h1>This page is not in the inbox.</h1>
        <p>The route may have moved, or the address may be incomplete.</p>
        <div>
          <Link className="button button-primary" href="/">
            Go home
          </Link>
          <Link className="button button-ghost" href="/docs">
            Read the docs
          </Link>
        </div>
      </main>
    </>
  );
}
