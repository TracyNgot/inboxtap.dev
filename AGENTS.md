# AGENTS.md

Canonical guidance for agents and contributors working on InboxTap. Read
[README.md](./README.md), [docs/OVERVIEW.md](./docs/OVERVIEW.md),
[CONTRIBUTING.md](./CONTRIBUTING.md), [STYLE_GUIDE.md](./STYLE_GUIDE.md), and
[.gitmessage](./.gitmessage) before changing public behavior or release
tooling.

## Product contract

InboxTap is a local-only SMTP capture server and test SDK.
[docs/OVERVIEW.md](./docs/OVERVIEW.md) is the canonical statement of the design
invariants and where the code enforces them. Preserve these invariants:

- Bind SMTP and HTTP to `127.0.0.1` by default.
- Capture mail without relaying it externally.
- Accept arbitrary recipients and isolate tests with unique client addresses.
- Keep the HTTP API, exported TypeScript types, and client SDK behavior aligned.
- Bound memory and wait times; never introduce an unbounded store or request.
- Keep compiled ESM, CJS, declarations, and the Node 20 CLI working.

## Working conventions

- Use Bun for installs, scripts, and tests. Keep `bun.lock` authoritative.
- Follow `STYLE_GUIDE.md` for TypeScript, module, testing, and error conventions.
- Verify before removing or renaming public exports, API fields, routes, or CLI flags.
- Update tests and README examples with every public behavior change.
- Use current official documentation for libraries, runtimes, and registries.
- Preserve unrelated user changes in a dirty worktree.

## Required checks

Run the narrowest useful test while developing, then run the complete gate:

```bash
bun run verify
```

This checks formatting, linting, types, unit/integration tests, the tsup build,
ESM/CJS imports, and the compiled Node CLI. Never bypass Lefthook with
`--no-verify`.

## GitHub workflow

- Work from `main` on semantic branches. Use `breaking/...` or `major/...` for
  major releases, `feat/...` for minor releases, and `fix/...`, `docs/...`,
  `refactor/...`, `test/...`, or `chore/...` for patch releases. Unrecognized
  prefixes also produce a patch release.
- Use the gitmoji conventional-commit format in `.gitmessage`.
- GitHub issue references are optional in commits. Use `Refs #123` in the body
  when useful and `Closes #123` in the pull request.
- Apply issue and pull-request labels that describe the change. Labels, rather
  than ticket prefixes, drive generated release notes.
- Pull requests must explain what changed, why, risk, and verification.
- Keep pull requests reviewable and ready; do not leave completed work in draft.

## Releases

- npm is the canonical package registry. Do not publish this unscoped package to
  GitHub Packages.
- Merging a pull request into `main` runs the serialized npm release workflow.
  It derives the semantic version bump from the source branches of every pull
  request merged since the last release tag (a major bump also requires the
  `breaking` label), verifies the package, pushes the release commit and tag,
  publishes to npm, and creates the GitHub release.
- Release only from a clean `main` branch after `bun run verify` passes, whether
  the release is automated or manual.
- Follow [RELEASING.md](./RELEASING.md). Do not publish, push tags, or create a
  GitHub release unless the user explicitly requests that external action.
