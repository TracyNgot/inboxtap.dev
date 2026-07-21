# Better Auth + Next.js + InboxTap

A minimal Next.js app using [Better Auth](https://better-auth.com) for email verification,
magic-link sign-in, and email OTP — with a Playwright suite that drives every flow through real
emails captured by [InboxTap](https://inboxtap.dev).

## Prerequisites

- Node.js 20+
- `npx playwright install chromium` (one-time browser download)
- `better-sqlite3` compiles a native module on install; if that fails you need a working C++
  toolchain (Xcode Command Line Tools on macOS, `build-essential` on Debian/Ubuntu)

## Setup

```bash
npm install
npx playwright install chromium
```

## Run the tests

```bash
npm test
```

The tests start InboxTap and the app themselves — no other terminal needed. Playwright's
`webServer` config launches `npx inboxtap` (SMTP on `:1025`, HTTP API on `:8025`) and
`next dev` (`:3000`), waits for both health URLs, and tears everything down afterwards.

## Run it interactively

```bash
npx inboxtap
```

Then in a second terminal:

```bash
npm run db:migrate
npm run dev
```

Open http://localhost:3000, sign up with any address, and read the captured email:

```bash
curl http://localhost:8025/api/emails/latest
```

## How it works

- `lib/mailer.ts` is the single SMTP wiring point: Nodemailer pointed at `localhost:1025`
  (`secure: false`, `ignoreTLS: true` — InboxTap speaks plain SMTP, no auth).
- Every Better Auth email callback (`sendVerificationEmail`, `sendMagicLink`,
  `sendVerificationOTP`) funnels through that one `sendMail` helper. Each email is plain text
  with exactly one link or one 6-digit code, so extraction is deterministic.
- Tests call `inboxTap.createInbox()` inside each test. Every inbox gets a unique address, so
  parallel Playwright workers share one InboxTap server without reading each other's mail —
  and `auth.db` never needs cleanup between runs.
- `inbox.waitForLink()` / `inbox.waitForCode()` poll the InboxTap API until the email lands,
  filtered by subject so the assertion targets exactly one message.

To develop against a local InboxTap checkout instead of the npm release, build a tarball from
the repo root (`bun run build && bun pm pack`) and `npm install` the generated `.tgz` here.

## Troubleshooting

- **`waitForLink`/`waitForCode` times out** — check the app logs for SMTP errors and confirm
  InboxTap is listening: `curl http://localhost:8025/health`.
- **Port already in use** — something else owns `:1025`, `:8025`, or `:3000`. Locally the
  config reuses existing servers, so a stale `next dev` from another project also counts.
- **Schema errors after upgrading Better Auth** — delete `auth.db` and rerun
  `npm run db:migrate`; the database is disposable test state.
