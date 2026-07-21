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

The source branch determines the release created after the pull request merges:

| Branch prefix | Release |
| --- | --- |
| `breaking/`, `major/` | Major |
| `feat/` | Minor |
| `fix/`, `docs/`, `refactor/`, `test/`, `chore/` | Patch |

Unrecognized prefixes also produce a patch release, and when several merges
release together the highest bump among them wins. A major release additionally
requires the `breaking` label on the pull request. An issue number may be
included in the branch name, but is not required.

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
- Expect a successful merge into `main` to publish the corresponding npm
  release; closing a pull request without merging does not release anything.
