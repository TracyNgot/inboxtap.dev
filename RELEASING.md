# Releasing InboxTap

InboxTap publishes its public, unscoped package to the npm registry. Merging a
pull request into `main` normally performs the complete release automatically.
The release commit and tag use gitmoji, while GitHub labels generate categorized
release notes.

## One-time bootstrap

The `inboxtap` package must exist before npm can attach a trusted publisher. To
publish the current `0.1.0` version once with an authenticated npm account, start
from a clean, current `main` branch:

```bash
git switch main
git pull --ff-only
bun run release:check
git tag v0.1.0
git push origin v0.1.0
bun run release:publish
gh release create v0.1.0 --generate-notes --title v0.1.0 --verify-tag
```

Complete this bootstrap before merging the release-automation pull request;
merging first leaves `main` on a bumped version with nothing published. The
publish command requires an npm account with publishing 2FA or an appropriately
restricted granular access token, and publishes with the npm CLI so the
registry integrity matches the automated workflow's resume checks.

In the `inboxtap` package settings on npmjs.com, add a GitHub Actions trusted
publisher with these exact values:

| Setting | Value |
| --- | --- |
| Organization or user | `TracyNgot` |
| Repository | `inboxtap.dev` |
| Workflow filename | `release.yml` |
| Environment | Leave blank |
| Allowed action | `npm publish` |

The workflow uses short-lived OpenID Connect credentials and does not need an
`NPM_TOKEN` GitHub secret. It runs on Node 24 with a compatible npm CLI and has
`id-token: write` permission. npm provenance is unavailable while the GitHub
repository remains private.

Create the labels referenced by `.github/release.yml`: `breaking`,
`enhancement`, `feature`, `bug`, `security`, `documentation`, `dependencies`,
`testing`, `maintenance`, and `skip-changelog`.

## Automated release flow

Source branch prefixes map to version bumps:

| Branch prefix | Version bump |
| --- | --- |
| `breaking/`, `major/` | Major |
| `feat/` | Minor |
| Any other prefix | Patch |

The workflow applies the highest bump among all pull requests merged into
`main` since the last release tag, so rapid merges that collapse into a single
run cannot drop a queued minor or major release. A major bump additionally
requires the `breaking` label on a contributing pull request; the run fails
until the label is added and the run is retried.

After a pull request merges into `main`, `.github/workflows/release.yml`:

1. Serializes the release with any other pending release.
2. Checks out trusted `main` and installs the frozen Bun dependency graph.
3. Runs the complete release gate, bumps `package.json`, updates `bun.lock`, and
   creates the release commit and tag.
4. Atomically pushes the commit and tag, publishes through npm trusted
   publishing, and creates a GitHub release with generated notes.

Pull requests that are closed without merging, or target a branch other than
`main`, do not trigger a release.

## Recovering a partial release

If a run fails before the release commit and tag are pushed, rerun the failed
workflow. If the tag was pushed, use **Actions → Release to npm → Run workflow**
and enter that existing tag, such as `v0.1.1`.

The recovery path checks out the exact tag, runs `bun run release:check`, and
compares the local package integrity with npm. It publishes a missing version,
skips an identical existing version, refuses to continue if the contents differ,
and creates the GitHub release when needed.

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

The prepare command verifies the package, updates `package.json` and `bun.lock`,
and creates the matching release commit and tag. The publish command refuses to
run away from `main`, with a dirty worktree, or without the expected version tag,
and publishes with the npm CLI so later automated resumes recognize the version.
Finish by creating the GitHub release for the pushed tag.

## Local package inspection

To create a tarball without publishing:

```bash
bun run release:pack
```

Tarballs are ignored by Git and can be installed into a separate fixture project
for final manual testing.
