import Link from "next/link";
import { JsonLd } from "@/components/shared/json-ld";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getDictionary, getLocalizedDoc } from "@/lib/i18n";
import { docPath, type Locale } from "@/lib/i18n/config";
import { homeJsonLd } from "@/lib/seo/json-ld";
import { GITHUB_URL } from "@/lib/site-config";
import { Reveal } from "./reveal";

export function LandingPage({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.landing;
  const docsHref = docPath(locale, "");
  const installationHref = getLocalizedDoc(locale, "installation").path;

  return (
    <>
      <JsonLd data={homeJsonLd(locale)} />
      <SiteHeader locale={locale} t={dictionary.chrome} />
      <main className="landing-main" id="top">
        <section className="hero section-shell">
          <div className="hero-copy">
            <Reveal delay={0.05}>
              <p className="eyebrow">{t.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <h1>
                {t.headline1}
                <span>.</span>
                <br />
                {t.headline2}
                <span>.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="hero-lede">{t.lede}</p>
            </Reveal>
            <Reveal className="hero-actions" delay={0.28}>
              <Link className="button button-primary" href={docsHref}>
                {t.ctaPrimary}
              </Link>
              <a className="button button-ghost" href={GITHUB_URL}>
                {t.ctaSecondary}
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
            <h2>{t.stepsHeading}</h2>
          </Reveal>
          <div className="card-grid three-column">
            {t.steps.map((step, index) => (
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
            <h2>{t.featuresHeading}</h2>
          </Reveal>
          <div className="card-grid three-column">
            {t.features.map(([title, description], index) => (
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
            <p className="eyebrow">{t.codeEyebrow}</p>
            <h2>{t.codeHeading}</h2>
            <p className="section-lede">{t.codeLede}</p>
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
            <p className="eyebrow">{t.installEyebrow}</p>
            <h2>
              <code>
                $ npx <span>inboxtap</span>
              </code>
            </h2>
            <p>{t.installReady}</p>
            <Link className="text-link" href={installationHref}>
              {t.installLink}
            </Link>
          </Reveal>
        </section>

        <section className="section-shell closing-section">
          <Reveal className="closing-card">
            <p className="eyebrow">{t.closingEyebrow}</p>
            <h2>{t.closingHeading}</h2>
            <p>{t.closingLede}</p>
            <a className="button button-ghost" href={GITHUB_URL}>
              {t.closingCta}
            </a>
          </Reveal>
        </section>
      </main>
      <SiteFooter t={dictionary.chrome} />
    </>
  );
}
