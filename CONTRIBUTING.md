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

Unrecognized prefixes also produce a patch release. An issue number may be
included in the branch name, but is not required.

## Coding style

Read [STYLE_GUIDE.md](STYLE_GUIDE.md) before changing production behavior. It is
the source of truth for TypeScript, architecture, resource limits, errors,
testing, and documentation conventions.

Biome owns formatting and linting. Do not hand-format around it:

```bash
bun run format
bun run verify
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
- Apply relevant labels such as `bug`, `enhancement`, `documentation`,
  `testing`, `dependencies`, `security`, or `breaking`.
- Complete every section of the pull request template.
- Run `bun run verify` before requesting review.
- Expect a successful merge into `main` to publish the corresponding npm
  release; closing a pull request without merging does not release anything.
