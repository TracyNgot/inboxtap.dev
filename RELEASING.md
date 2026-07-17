# Releasing InboxTap

InboxTap publishes its public, unscoped package to the npm registry. The
release commit and tag use gitmoji, while GitHub labels generate the categorized
release notes.

## First-time setup

1. Create the npm account that will own `inboxtap` and enable publishing
   2FA.
2. Run `npm login` and confirm `npm whoami` returns the expected owner.
3. Configure this repository's commit template:

   ```bash
   git config commit.template .gitmessage
   ```

4. Create the labels referenced by `.github/release.yml`: `breaking`,
   `enhancement`, `feature`, `bug`, `security`, `documentation`, `dependencies`,
   `testing`, `maintenance`, and `skip-changelog`.

## Release flow

Start from a clean, current `main` branch:

```bash
git switch main
git pull --ff-only
bun run release:check
```

Choose exactly one semantic version bump:

```bash
bun run release:patch
bun run release:minor
bun run release:major
```

The command verifies the package, updates `package.json` and `bun.lock`, then
creates a commit such as `🔖 chore: release v0.2.0` and a matching `v0.2.0` tag.
Review the diff before continuing.

Push the release commit and tag:

```bash
git push origin main --follow-tags
```

Publish the exact tagged version to npm:

```bash
bun run release:publish
```

The publish command refuses to run away from `main`, with a dirty worktree, or
without a matching version tag. It executes the complete verification suite
again before `bun publish` sends the package to npm.

Finally, create the GitHub release for the version tag. Start with GitHub's
generated notes, then use `.github/RELEASE_NOTES_TEMPLATE.md` to keep the summary
short and gitmoji-categorized.

## Local package inspection

To create a tarball without publishing:

```bash
bun run release:pack
```

Tarballs are ignored by Git and can be installed into a separate fixture project
for final manual testing.
