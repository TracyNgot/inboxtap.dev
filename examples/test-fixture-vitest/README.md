# Vitest fixtures + InboxTap

Extend Vitest with a file-scoped InboxTap server and a fresh inbox for every test. The two
example tests run concurrently through one dynamically configured SMTP transport while their
captured messages remain isolated.

## Prerequisites

- Node.js 20 or later

## Setup

```bash
npm install
```

## Run the tests

```bash
npm test
```

The fixture starts InboxTap and verifies its Nodemailer transport before either test runs.

## How it works

```ts
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";

const test = extendInboxTap(base);

test.concurrent("captures an isolated email", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Welcome",
    text: "Your account is ready.",
  });

  const message = await inbox.waitForMessage({ subject: "Welcome" });
  expect(message.envelope.to).toEqual([inbox.address]);
});
```

`extendInboxTap()` supplies a file-scoped `inboxTap` fixture and a test-scoped `inbox` fixture.
The shared fixture exposes the server, client, SMTP settings, and a ready Nodemailer transport.

## Isolation and cleanup

Vitest creates a new inbox address for every concurrent test. Recipient filtering keeps each
test's messages separate even though the file shares one SMTP server. The file-scoped fixture
closes its transport and listeners after the last test, including failure paths.

## Troubleshooting

- **A runner type is missing** — import the adapter from `inboxtap/fixtures/vitest`, not the
  InboxTap root export.
- **A wait timed out** — send to the injected `inbox.address`, not a hard-coded recipient.
- **Tests share mail unexpectedly** — use the injected `inbox` fixture in every test and avoid
  a module-level inbox.
