import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Fragment } from "react";
import { type ChangelogRelease, parseChangelog } from "@/lib/changelog";

const repoUrl = "https://github.com/TracyNgot/inboxtap.dev";

// next build runs from web/, so the workspace-root changelog is one level up.
const changelogPath = join(process.cwd(), "..", "CHANGELOG.md");

export function ChangelogContent() {
  const releases = parseChangelog(readFileSync(changelogPath, "utf8"));
  return (
    <>
      <p>
        {releases.map((release, index) => (
          <Fragment key={release.version}>
            {index > 0 ? " · " : null}
            <a href={`#${release.version}`}>{release.version}</a>
          </Fragment>
        ))}
      </p>
      {releases.map((release) => (
        <ReleaseSection key={release.version} release={release} />
      ))}
    </>
  );
}

function ReleaseSection({ release }: { release: ChangelogRelease }) {
  return (
    <>
      <h2 id={release.version}>
        {release.version}
        {release.date ? ` — ${release.date}` : null}
      </h2>
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
                    {" by "}
                    <a href={`https://github.com/${item.author}`}>@{item.author}</a>
                  </>
                ) : null}
                {item.prUrl ? (
                  <>
                    {" in "}
                    <a href={item.prUrl}>{item.prNumber ? `#${item.prNumber}` : "pull request"}</a>
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
      <p>
        <a href={`${repoUrl}/releases/tag/${release.version}`}>GitHub release</a>
        {release.fullChangelogUrl ? (
          <>
            {" · "}
            <a href={release.fullChangelogUrl}>Full changelog</a>
          </>
        ) : null}
      </p>
    </>
  );
}
