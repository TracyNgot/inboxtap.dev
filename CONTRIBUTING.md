# Contributing to InboxTap

Thanks for helping make email-flow tests easier to write and debug.

## Setup

```bash
bun install
bun run test
```

Create a focused branch from `main`:

```bash
git switch -c feat/short-description
```

For pull requests that change the published library, the source branch
determines the release created after the pull request merges:

| Branch prefix | Release |
| --- | --- |
| `breaking/`, `major/` | Major |
| `feat/` | Minor |
| `fix/`, `docs/`, `refactor/`, `test/`, `chore/` | Patch |

Unrecognized prefixes also produce a patch release, and when several merges
release together the highest bump among the library-changing pull requests wins.
A major release additionally requires the `breaking` label on the pull request.
An issue number may be included in the branch name, but is not required.

A merge triggers a library release only when it changes `src/`, `LICENSE`,
`package.json`, `tsconfig.json`, or `tsup.config.ts`. Documentation, website,
example, test-only, and release-tooling changes wait for the next library
release. Its release notes still include all merged pull requests since the
previous tag, so those deferred changes are not omitted.

## Coding style

Read [docs/OVERVIEW.md](docs/OVERVIEW.md) for the product goals and design
invariants, and [STYLE_GUIDE.md](STYLE_GUIDE.md) before changing production
behavior. STYLE_GUIDE.md is the source of truth for TypeScript, architecture,
resource limits, errors, testing, and documentation conventions.

Biome owns formatting and linting. Do not hand-format around it:

```bash
bun run format
bun run verify
```

## Examples

Projects under `examples/` are standalone: each keeps its own `package.json`,
lockfile, and test command, and none of them are part of `bun run verify`,
releases, or the published npm package. Root Biome still owns their formatting
and linting, so `bun run format` covers them. When you change an example, run
its own install and test from inside its directory:

```bash
cd examples/express-nodemailer
npm install
npm test
```

## Commits

Configure the repository commit template once:

```bash
git config commit.template .gitmessage
```

Commit subjects follow:

```text
<gitmoji> <type>: <imperative subject>
```

Examples:

```text
✨ feat: add recipient pattern filters
🐛 fix: reject oversized SMTP messages
📝 docs: explain Playwright integration
```

Use `Refs #123` in the commit body when helpful. Do not add Linear identifiers.

## Pull requests

- Keep one concern per pull request.
- Link the issue with `Closes #123` when the PR completes it.
- Release-notes labels are applied automatically from the branch prefix. Add
  `breaking` yourself when a major release is intended, and `skip-changelog`
  to keep a pull request out of the release notes.
- Complete every section of the pull request template.
- Run `bun run verify` before requesting review.
- Expect a successful library-changing merge into `main` to publish the
  corresponding npm release. Documentation- or website-only merges do not
  publish, and closing a pull request without merging does not release anything.

## Security reports

Do not disclose suspected vulnerabilities in a public issue. Follow
[SECURITY.md](SECURITY.md) to report them privately.
