# Releasing InboxTap

InboxTap publishes its public, unscoped package to the npm registry. Merging a
pull request that changes `src/` into `main` performs the complete release
automatically. Documentation, website, example, test-only, and
package/build/release-tooling changes wait for the next source release. The
release commit and tag use gitmoji, GitHub labels generate categorized release
notes, and every release is recorded in `CHANGELOG.md` and rendered on the
website at <https://inboxtap.dev/docs/changelog>.

## npm authentication

`.github/workflows/release.yml` authenticates `npm publish` with the
`NPM_TOKEN` repository secret. Keep that secret set to a granular npm access
token allowed to publish `inboxtap`, and rotate it before it expires. The
manual fallback below publishes with your own logged-in npm account instead.

## Release notes, labels, and the changelog

Release notes are generated from all pull requests merged since the previous
tag, including documentation and website changes that did not trigger their own
release. They are categorized by the labels in `.github/release.yml`:
`breaking`, `enhancement`/`feature`, `bug`, `security`, `documentation`,
`dependencies`, `testing`, and `maintenance`, with `skip-changelog` excluding a
pull request entirely.

`.github/workflows/label-pr.yml` applies the matching label automatically from
the source branch prefix when a pull request opens, for example `feat/` →
`feature`, `fix/` → `bug`, and `chore/` → `maintenance`. The `breaking` label
is never applied automatically; add it by hand to confirm a major release.

During release preparation, `scripts/prepare-release.ts` prepends the same
generated notes to `CHANGELOG.md` so the release commit, the GitHub release,
and the website changelog always agree.

## Automated release flow

The workflow runs for a merged pull request only when it changes `src/`. Source
branch prefixes on those `src/`-changing pull requests map to version bumps:

| Branch prefix | Version bump |
| --- | --- |
| `breaking/`, `major/` | Major |
| `feat/` | Minor |
| Any other prefix | Patch |

The workflow applies the highest bump among all `src/`-changing pull requests
merged into `main` since the last release tag, so rapid merges that collapse
into a single run cannot drop a queued minor or major release. Documentation,
website, and other deferred pull requests do not affect the version bump but
remain in the generated release notes. A major bump additionally requires the
`breaking` label on a contributing source pull request; the run fails until the
label is added and the run is retried.

After an eligible pull request merges into `main`,
`.github/workflows/release.yml`:

1. Serializes the release with any other pending release.
2. Checks out trusted `main` and installs the frozen Bun dependency graph.
3. Runs the complete release gate, bumps `package.json`, updates `bun.lock`,
   prepends the new section to `CHANGELOG.md`, and creates the release commit
   and tag.
4. Atomically pushes the commit and tag, publishes to npm, and creates a
   GitHub release with generated notes.

Pull requests that do not change `src/`, are closed without merging, or target a
branch other than `main` do not trigger a release.
Use the on-demand workflow below when a package metadata or build configuration
change must be published without a corresponding `src/` change.

## On-demand releases, including v1.0.0

To cut a release that is not tied to a merge — for example the jump to
v1.0.0 — dispatch the workflow with a bump level:

```bash
gh workflow run "Release to npm" -f bump=major
```

or open **Actions → Release to npm → Run workflow** and choose `patch`,
`minor`, or `major` while leaving the tag field empty. The run executes the
same pipeline as a merge-driven release from the current `main`. A dispatched
`major` does not require the `breaking` label: choosing the level is the
confirmation.

## Recovering a partial release

If a run fails before the release commit and tag are pushed, rerun the failed
workflow. If the tag was pushed, use **Actions → Release to npm → Run
workflow**, enter that existing tag such as `v0.1.1`, and leave the bump level
on `none`.

The recovery path checks out the exact tag, runs `bun run release:check`, and
compares the local package integrity with npm. It publishes a missing version,
skips an identical existing version, refuses to continue if the contents
differ, and creates the GitHub release when needed.

## Manual fallback

When automation cannot be used, start from a clean, current `main` branch and
choose exactly one semantic version bump:

```bash
git switch main
git pull --ff-only
bun run release:check
bun run release:patch # or release:minor / release:major
git push origin main --follow-tags
bun run release:publish
gh release create vX.Y.Z --generate-notes --title vX.Y.Z --verify-tag
```

The prepare command verifies the package, updates `package.json`, `bun.lock`,
and `CHANGELOG.md`, and creates the matching release commit and tag. It
generates the changelog section through the GitHub CLI, so `gh auth status`
must succeed first. The publish command refuses to run away from `main`, with
a dirty worktree, or without the expected version tag, and publishes with the
npm CLI so later automated resumes recognize the version. Finish by creating
the GitHub release for the pushed tag.

## Local package inspection

To create a tarball without publishing:

```bash
bun run release:pack
```

Tarballs are ignored by Git and can be installed into a separate fixture project
for final manual testing.
