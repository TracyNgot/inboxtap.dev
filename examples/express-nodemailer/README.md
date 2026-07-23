# Express + Nodemailer + InboxTap

A small Express API that sends transactional email through Nodemailer — a welcome email with a
verification link, a single-use invite token, and a one-time sign-in code — with a Vitest suite
that captures and asserts every email through [InboxTap](https://inboxtap.dev). It uses InboxTap's
runner-native Vitest matcher adapter for concise delivery, recipient, link, and header assertions.

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
```

This example pins InboxTap to `1.3.0`, the first release containing assertion matchers.

## Run the tests

```bash
npm test
```

The tests start InboxTap and the app themselves — no other terminal needed. Each spec file boots
its own InboxTap server and app on ephemeral ports, so files run in parallel without port
conflicts.

## Run interactively

Start InboxTap in one terminal and the app in another:

```bash
npx inboxtap
```

```bash
npm run dev
```

Then trigger an email and inspect what was captured:

```bash
curl -X POST http://localhost:3001/signup \
  -H "content-type: application/json" \
  -d '{"email":"someone@local.test"}'

curl http://localhost:8025/api/emails/latest
```

## How it works

```
app (Express) → nodemailer → SMTP :1025 → InboxTap → HTTP API :8025 ← InboxTapClient (tests)
```

- `src/mailer.ts` owns the single Nodemailer transport: `secure: false`, `ignoreTLS: true`, and
  no `auth` — InboxTap disables AUTH and STARTTLS.
- `src/app.ts` exposes `createApp({ mailer, baseUrl })`. Injecting the mailer and base URL is
  what lets tests point the same app at ephemeral ports.
- `test/helpers.ts` starts the whole stack per spec file: `new InboxTapServer({ apiPort: 0,
  smtpPort: 0 })`, an `InboxTapClient` wired to `server.apiUrl`, and the app bound to port 0.
- `test/setup.ts` registers InboxTap's Vitest matchers with the runner's own `expect` instance.
- Every test calls `inboxTap.createInbox()` for a unique address, so tests never see each
  other's mail and nothing needs cleanup between runs.

## Register the matchers

Import the Vitest adapter in a setup file and pass it Vitest's native `expect`:

```ts
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";
import { expect } from "vitest";

extendInboxTapExpect(expect);
```

The setup file is loaded through `setupFiles` in `vitest.config.ts`. The async delivery matcher must
be awaited; message matchers remain synchronous:

```ts
await expect(inbox).toHaveDeliveredOnce({ subject: /welcome/i });

const email = await inbox.waitForMessage({ subject: /welcome/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify?token=");
expect(email).not.toHaveUnsubscribeHeader();
```

`toHaveDeliveredOnce()` checks the current inbox snapshot. Pass an explicit `quietMs` when a test
needs a short observation window for a duplicate, but do not treat that window as proof that a
later retry cannot happen.

To try this example against a local build of InboxTap instead of the published package, run
`bun run build && bun pm pack` at the repository root, then install the tarball here:
`npm install ../../inboxtap-<version>.tgz`.

## Troubleshooting

- **`waitFor…` timed out** — the app most likely never sent the email. Check the app logs, and
  confirm the transport targets the SMTP host and port that InboxTap printed on startup.
- **Port already in use** — the test suite uses ephemeral ports and is immune, but interactive
  mode defaults to 1025/8025 (InboxTap) and 3001 (app). Stop the conflicting process or set
  `PORT`/`SMTP_PORT`.
- **Emails visible in the UI but not in tests** — assert against the same inbox address the app
  sent to; `createInbox()` generates a fresh address per call.
- **A matcher type is missing** — register `inboxtap/matchers/vitest` in the configured setup file;
  the matcher adapter is intentionally not exported from the InboxTap package root.
