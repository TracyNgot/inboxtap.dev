# InboxTap

InboxTap is a local email capture server and TypeScript SDK for testing verification links, magic links, OTPs, invitations, and password-reset emails. Point your application at its local SMTP address, then await the link, code, or custom match directly from your automated test—without Docker or an external mail service.

```bash
bunx inboxtap
```

The published CLI also runs with Node 20 or later:

```bash
npx inboxtap
```

It captures all local SMTP recipients in a bounded in-memory store. No message is delivered externally.

Read the complete guides and API reference at [inboxtap.dev/docs](https://inboxtap.dev/docs).

## Quick start

Start the server:

```bash
bunx inboxtap
```

During local development of this repository, use:

```bash
bun install
bun run start
```

The defaults are:

```text
SMTP: localhost:1025
API:  http://localhost:8025
```

Configure the application under test:

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
```

Options let you run multiple projects side by side:

```bash
inboxtap --smtp-port 2025 --api-port 9025 --domain mail.local.test
```

## Test-suite SDK

Install the package in a Bun or Node 20+ test project, then import the client subpath:

```ts
import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();
const inbox = await inboxTap.createInbox({ alias: "signup" });

await page.getByLabel("Email").fill(inbox.address);
await page.getByRole("button", { name: "Create account" }).click();

const verificationUrl = await inbox.waitForLink({
  subject: /verify your email/i,
  contains: "/verify",
});
await page.goto(verificationUrl);
```

The inbox address is generated in the client, so parallel tests can safely isolate their messages without pre-registering recipients on the server.

```ts
const code = await inbox.waitForCode({ subject: /security code/i });
const key = await inbox.waitForMatch({ pattern: /api_key=([A-Za-z0-9_-]+)/ });
const messages = await inbox.messages();
await inbox.clear();
```

`waitForLink`, `waitForCode`, and `waitForMatch` resolve to the extracted string. `waitForMessage` resolves to the complete captured email.

### Runner-native fixtures

InboxTap provides isolated fixture subpaths for Bun test, Vitest, and
Playwright. The shared fixture starts both listeners on dynamic ports by
default, creates and verifies a plain Nodemailer transport, cleans up partial
startup failures, and exposes an idempotent `close()`.

Install Nodemailer 9 with InboxTap, plus the runner adapter your project uses:

```bash
bun add --dev inboxtap nodemailer vitest
```

Extend a Vitest base test to share one InboxTap server per file while creating
a fresh inbox for every test:

```ts
import { expect, test as base } from "vitest";
import { extendInboxTap } from "inboxtap/fixtures/vitest";

const test = extendInboxTap(base);

test("captures an account email", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Verify your account",
    text: "Open https://app.local.test/verify?id=example",
  });

  const message = await inbox.waitForMessage({ subject: /verify your account/i });
  expect(message.envelope.to).toContain(inbox.address);
});
```

Use `startInboxTapFixture()` from `inboxtap/fixtures` for an explicit lifecycle,
`setupInboxTap()` from `inboxtap/fixtures/bun`, or `extendInboxTap()` from
`inboxtap/fixtures/playwright`. Playwright applications that need the
dynamically selected SMTP port must start as a dependent worker fixture; an
already-running `webServer` cannot consume a port selected later by a test
fixture.

## HTTP API

All endpoints return JSON. Query values are URL encoded.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status, SMTP/API ports, and recipient domain |
| `GET` | `/api/emails` | List messages; accepts `to`, `subject`, `afterId`, and `limit` |
| `GET` | `/api/emails/latest` | Newest matching message |
| `GET` | `/api/emails/wait` | Long-poll for a message; accepts filters plus `timeoutMs` up to 60,000 |
| `GET` | `/api/emails/:id` | Retrieve one captured message |
| `DELETE` | `/api/emails` | Clear all messages, or only a recipient with `?to=…` |

For example:

```bash
curl "http://localhost:8025/api/emails/latest?to=signup%40local.test"
```

Captured emails include the SMTP envelope, headers, decoded text/HTML, discovered HTTP(S) links, 4–8 digit codes, and raw RFC 822 source.

## Examples

Runnable end-to-end projects live in [`examples/`](examples/):

- [`examples/better-auth-nextjs`](examples/better-auth-nextjs) — Next.js + Better Auth email verification, magic links, and OTP, tested with Playwright.
- [`examples/express-nodemailer`](examples/express-nodemailer) — Express + Nodemailer transactional email, tested with Vitest.

Each example is standalone: install and test it from its own directory. Guided walkthroughs are on [inboxtap.dev/docs](https://inboxtap.dev/docs).

## Safety and scope

InboxTap binds only the loopback addresses (`127.0.0.1` and `::1`, so `localhost` works out of the box) by default and intentionally disables SMTP authentication and STARTTLS. Keep it local; it is not an outbound relay or production mail server.

InboxTap 1.x is in-memory only. It does not include persistence, a dashboard, attachments, webhooks, Docker, or configurable extraction files.

## Support

InboxTap is free and open source. If it saves you time, you can [support its ongoing maintenance](https://buymeacoffee.com/yolaine). Your support helps fund documentation, bug fixes, and new releases.

## Contributing

```bash
bun install
bun run verify
```

Lefthook installs pre-commit checks for formatting, linting, type checking, and Bun tests. Pre-push runs the complete verification suite, including the tsup build and Node distribution smoke test.

Read [docs/OVERVIEW.md](docs/OVERVIEW.md) for the project goals and design invariants, then [CONTRIBUTING.md](CONTRIBUTING.md) and [STYLE_GUIDE.md](STYLE_GUIDE.md) for coding and commit conventions. Maintainers can use [RELEASING.md](RELEASING.md) for the verified npm release flow.

## License

[MIT](LICENSE)
