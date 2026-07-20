import Link from "next/link";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { Reveal } from "./reveal";

const steps = [
  {
    code: "SMTP_HOST=127.0.0.1\nSMTP_PORT=1025",
    description: "Use the same SMTP path as production, pointed at a safe local address.",
    number: "01",
    title: "Point your app at InboxTap",
  },
  {
    code: "verify@app.dev → signup-…@local.test\n✓ captured locally",
    description: "Every recipient is accepted and every message stays on your machine.",
    number: "02",
    title: "Trigger the real email flow",
  },
  {
    code: "await inbox.waitForCode()\n→ 482910",
    description: "Await the exact link, code, message, or match your test needs.",
    number: "03",
    title: "Assert from the test SDK",
  },
] as const;

const features = [
  ["Local by default", "SMTP and HTTP bind to 127.0.0.1. InboxTap never relays mail."],
  ["Parallel-safe inboxes", "Unique client-generated addresses isolate concurrent test workers."],
  ["REST API", "List, retrieve, wait for, and clear captured messages over local HTTP."],
  ["Automatic extraction", "Discover HTTP(S) links and unique 4–8 digit codes from parsed mail."],
  ["Test SDK", "Await messages, links, codes, and regex matches from Bun or Node tests."],
  ["Bounded resources", "Storage, message size, and long-poll waits all have predictable limits."],
] as const;

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="landing-main" id="top">
        <section className="hero section-shell">
          <div className="hero-copy">
            <Reveal delay={0.05}>
              <p className="eyebrow">Local SMTP capture for automated tests</p>
            </Reveal>
            <Reveal delay={0.12}>
              <h1>
                Catch every email<span>.</span>
                <br />
                Extract every code<span>.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="hero-lede">
                Run a local SMTP server, trigger your application’s real email flow, and await
                verification links or OTPs directly from the test that needs them.
              </p>
            </Reveal>
            <Reveal className="hero-actions" delay={0.28}>
              <Link className="button button-primary" href="/docs">
                Get started
              </Link>
              <a className="button button-ghost" href="https://github.com/TracyNgot/inboxtap.dev">
                View on GitHub
              </a>
            </Reveal>
          </div>
          <Reveal className="terminal-card" delay={0.18}>
            <div className="terminal-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="terminal-body">
              <p>
                <b>$</b> npx inboxtap
                <span className="cursor" />
              </p>
              <p className="terminal-comment">GET /api/emails/latest?to=signup%40local.test</p>
              <pre>{`{
  "email": {
    "subject": "Verify your account",
    "codes": ["482910"],
    "links": ["https://app.test/verify?…"]
  }
}`}</pre>
            </div>
          </Reveal>
        </section>

        <section className="section-shell landing-section">
          <Reveal>
            <h2>Three steps. No cloud account.</h2>
          </Reveal>
          <div className="card-grid three-column">
            {steps.map((step, index) => (
              <Reveal className="glass-card step-card" delay={index * 0.07} key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <pre>{step.code}</pre>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell landing-section" id="features">
          <Reveal>
            <h2>Built for deterministic test suites</h2>
          </Reveal>
          <div className="card-grid three-column">
            {features.map(([title, description], index) => (
              <Reveal className="glass-card feature-card" delay={(index % 3) * 0.06} key={title}>
                <span className="feature-mark" aria-hidden="true">
                  <i />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell landing-section code-section">
          <Reveal>
            <p className="eyebrow">From browser action to inbox assertion</p>
            <h2>Test the email flow your users actually receive</h2>
            <p className="section-lede">
              Create an isolated address, submit it through your app, then wait for the expected
              value. InboxTap works with Playwright, Vitest, Jest, and other Bun or Node runners.
            </p>
          </Reveal>
          <Reveal className="code-window">
            <div className="code-label">signup.spec.ts</div>
            <pre>
              <code>{`import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();
const inbox = await inboxTap.createInbox({ alias: "signup" });

await page.getByLabel("Email").fill(inbox.address);
await page.getByRole("button", { name: "Create account" }).click();

const verificationUrl = await inbox.waitForLink({
  subject: /verify your email/i,
  contains: "/verify",
});

await page.goto(verificationUrl);`}</code>
            </pre>
          </Reveal>
        </section>

        <section className="section-shell install-section">
          <Reveal className="glass-card install-card">
            <p className="eyebrow">Node 20+ · Bun or npm</p>
            <h2>
              <code>
                $ npx <span>inboxtap</span>
              </code>
            </h2>
            <p>SMTP on 127.0.0.1:1025. API on 127.0.0.1:8025. Ready.</p>
            <Link className="text-link" href="/docs/installation">
              Read installation guide →
            </Link>
          </Reveal>
        </section>

        <section className="section-shell closing-section">
          <Reveal className="closing-card">
            <p className="eyebrow">Free · Open source · MIT licensed</p>
            <h2>Keep test email local and observable.</h2>
            <p>Use it, inspect the source, or help shape the next release.</p>
            <a className="button button-ghost" href="https://github.com/TracyNgot/inboxtap.dev">
              Explore the repository
            </a>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
