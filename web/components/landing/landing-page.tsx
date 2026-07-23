import Link from "next/link";
import { JsonLd } from "@/components/shared/json-ld";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getDictionary, getLocalizedDoc } from "@/lib/i18n";
import { docPath, type Locale } from "@/lib/i18n/config";
import { homeJsonLd } from "@/lib/seo/json-ld";
import { BUY_ME_A_COFFEE_URL, GITHUB_URL, NPM_URL } from "@/lib/site-config";
import { HighlightedCode } from "./highlighted-code";
import { Reveal } from "./reveal";
import { StoryScene } from "./story-scene";
import { StoryStacked } from "./story-stacked";

function terminalJson(subject: string): string {
  return `{
  "email": {
    "subject": "${subject}",
    "codes": ["482910"],
    "links": ["https://app.test/verification?…"]
  }
}`;
}

function signupSpec({
  alias,
  button,
  emailLabel,
  matcher,
}: {
  alias: string;
  button: string;
  emailLabel: string;
  matcher: string;
}): string {
  return `import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();
const inbox = await inboxTap.createInbox({ alias: "${alias}" });

await page.getByLabel("${emailLabel}").fill(inbox.address);
await page.getByRole("button", { name: "${button}" }).click();

const verificationUrl = await inbox.waitForLink({
  subject: /${matcher}/i,
  contains: "/verification",
});

await page.goto(verificationUrl);`;
}

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
              <a className="button button-ghost" href={NPM_URL}>
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
              <p className="terminal-comment">
                GET /api/emails/latest?to={encodeURIComponent(`${t.demo.alias}@local.test`)}
              </p>
              <HighlightedCode code={terminalJson(t.demo.subject)} lang="json" />
            </div>
          </Reveal>
        </section>

        <section aria-label={t.story.ariaLabel} className="story-section">
          <StoryScene t={t.story} />
          <StoryStacked t={t.story} />
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
            <div className="code-label">{t.demo.fileName}</div>
            <HighlightedCode code={signupSpec(t.demo)} lang="typescript" />
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
            <div className="closing-actions">
              <a className="button button-ghost" href={GITHUB_URL}>
                {t.closingCta}
              </a>
              <a className="button button-coffee" href={BUY_ME_A_COFFEE_URL}>
                {dictionary.chrome.supportLabel} ☕
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter locale={locale} t={dictionary.chrome} />
    </>
  );
}
