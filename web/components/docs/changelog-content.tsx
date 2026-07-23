import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type ComponentType, Fragment } from "react";
import { type ChangelogRelease, parseChangelog } from "@/lib/changelog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { GITHUB_URL } from "@/lib/site-config";

// next build runs from web/, so the workspace-root changelog is one level up.
const changelogPath = join(process.cwd(), "..", "CHANGELOG.md");

export type ChangelogLabels = Pick<
  Dictionary["docsChrome"],
  | "changelogBy"
  | "changelogChanges"
  | "changelogFull"
  | "changelogIn"
  | "changelogPullRequest"
  | "changelogRelease"
  | "changelogSummary"
  | "changelogUnpublished"
>;

export function localizedChangelog(locale: Locale, labels: ChangelogLabels): ComponentType {
  return function LocalizedChangelog() {
    return <ChangelogContent labels={labels} locale={locale} />;
  };
}

export function ChangelogContent({ labels, locale }: { labels: ChangelogLabels; locale: Locale }) {
  const releases = parseChangelog(readFileSync(changelogPath, "utf8"));
  return (
    <>
      {locale === "en" ? null : <p>{labels.changelogSummary}</p>}
      <p>
        {releases.map((release, index) => (
          <Fragment key={release.version}>
            {index > 0 ? " · " : null}
            <a href={`#${release.version}`}>{release.version}</a>
          </Fragment>
        ))}
      </p>
      {releases.map((release) => (
        <ReleaseSection key={release.version} labels={labels} locale={locale} release={release} />
      ))}
    </>
  );
}

function ReleaseSection({
  labels,
  locale,
  release,
}: {
  labels: ChangelogLabels;
  locale: Locale;
  release: ChangelogRelease;
}) {
  const changeCount = release.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  const showEnglishDetails = locale === "en";
  const wasNeverPublished = release.notes.some((note) =>
    note.toLowerCase().includes("never published to npm"),
  );

  return (
    <>
      <h2 id={release.version}>
        {release.version}
        {release.date ? ` — ${release.date}` : null}
      </h2>
      {showEnglishDetails ? (
        <>
          {release.notes.map((note) => (
            <p key={note}>
              <em>{note}</em>
            </p>
          ))}
          {release.categories.map((category) => (
            <Fragment key={category.title || "uncategorized"}>
              {category.title ? <h3>{category.title}</h3> : null}
              <ul>
                {category.items.map((item) => (
                  <li key={item.prUrl ?? item.text}>
                    {item.text}
                    {item.author ? (
                      <>
                        {` ${labels.changelogBy} `}
                        <a href={`https://github.com/${item.author}`}>@{item.author}</a>
                      </>
                    ) : null}
                    {item.prUrl ? (
                      <>
                        {` ${labels.changelogIn} `}
                        <a href={item.prUrl}>
                          {item.prNumber ? `#${item.prNumber}` : labels.changelogPullRequest}
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
          {release.extras.map((extra) => (
            <p key={extra}>{extra}</p>
          ))}
        </>
      ) : (
        <>
          {wasNeverPublished ? (
            <p>
              <em>{labels.changelogUnpublished}</em>
            </p>
          ) : null}
          <p>
            {labels.changelogChanges}: {changeCount}
          </p>
        </>
      )}
      <p>
        <a href={`${GITHUB_URL}/releases/tag/${release.version}`}>{labels.changelogRelease}</a>
        {release.fullChangelogUrl ? (
          <>
            {" · "}
            <a href={release.fullChangelogUrl}>{labels.changelogFull}</a>
          </>
        ) : null}
      </p>
    </>
  );
}
