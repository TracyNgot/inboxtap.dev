# Playwright fixtures + InboxTap

Start InboxTap as a worker fixture, then start an application-like worker fixture that consumes
its dynamic SMTP settings. Each Playwright test receives a fresh inbox without reserving fixed
ports or starting a browser.

## Prerequisites

- Node.js 20 or later

## Setup

```bash
npm install
```

No browser download is needed because this example exercises fixture composition without the
`page` fixture.

## Run the tests

```bash
npm test
```

Playwright starts and tears down the complete fixture dependency chain for each worker.

## How it works

```ts
import { test as base } from "@playwright/test";
import { extendInboxTap } from "inboxtap/fixtures/playwright";
import nodemailer from "nodemailer";

interface App {
  sendWelcome(to: string): Promise<void>;
}

const withInboxTap = extendInboxTap(base);

export const test = withInboxTap.extend<object, { app: App }>({
  app: [
    async ({ inboxTap }, use) => {
      const transport = nodemailer.createTransport(inboxTap.smtp);
      await transport.verify();
      try {
        await use({
          async sendWelcome(to) {
            await transport.sendMail({
              from: "app@local.test",
              to,
              subject: "Welcome",
              text: "Your account is ready.",
            });
          },
        });
      } finally {
        transport.close();
      }
    },
    { scope: "worker" },
  ],
});
```

The `app` worker fixture depends on the `inboxTap` worker fixture, so Playwright starts InboxTap
first and closes it last. The runnable example uses a small mail-sending object in place of a
web application to keep the lifecycle easy to see.

## Isolation and cleanup

InboxTap is shared only at worker scope; the adapter injects a new `inbox` for every test. The
application fixture owns its transport, and dependency-ordered teardown closes that transport
before InboxTap stops.

Do not use Playwright's `webServer` option when the application needs InboxTap's dynamic SMTP
port: `webServer` starts before test fixtures exist. Start the application as a dependent worker
fixture, as this example does.

## Troubleshooting

- **The application cannot connect** — create its transport from `inboxTap.smtp`; do not copy a
  fixed port into the configuration.
- **The app starts before InboxTap** — list `inboxTap` in the app fixture's dependency arguments.
- **A browser executable is missing** — this example does not use `page`; remove browser
  fixtures from copied tests or install the browser your application tests require.
