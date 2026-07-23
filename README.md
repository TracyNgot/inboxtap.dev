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

### Assertion matchers

Matcher implementations and runner adapters use isolated subpaths. Inject the
runner's `expect` into its adapter; Bun and Vitest extend that object in place,
while Playwright returns a new typed `expect`:

```ts
import { expect, test as base } from "vitest";
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";

extendInboxTapExpect(expect);
const test = extendInboxTap(base);

test("delivers one verification email", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Verify your account",
    text: "Open https://app.local.test/verify?id=example",
  });

  await expect(inbox).toHaveDeliveredOnce({
    subject: /verify your account/i,
    quietMs: 100,
  });

  const email = await inbox.waitForMessage({ subject: /verify your account/i });
  expect(email).toHaveRecipient(inbox.address);
  expect(email).toContainLink("/verify");
});
```

`toHaveDeliveredOnce()` checks the messages that already exist; it does not
wait for the first delivery. An optional `quietMs` observes only the interval
after a valid one-message snapshot and cannot prove that no later retry will
arrive. Recipient matching uses the SMTP envelope, link strings are
substrings, and regular expressions are tested without changing their
`lastIndex`.

`toHaveUnsubscribeHeader({ oneClick: true })` reads the raw, unfolded RFC
headers and requires an HTTPS `List-Unsubscribe` target plus
`List-Unsubscribe-Post: List-Unsubscribe=One-Click`. It checks header shape,
not DKIM validity or the remote endpoint.

Use `inboxTapMatchers` or
`createInboxTapMatchers({ recorder })` from the peer-free
`inboxtap/matchers` subpath when integrating another compatible `expect`
implementation. Matcher diagnostics report only safe counts and states; they
do not echo message bodies, recipient values, links, tokens, or raw headers.
The recorder receives the same content-safe, structured observations for
later report collection. Importing `inboxtap`, `inboxtap/client`, or
`inboxtap/matchers` does not load Nodemailer, Vitest, or Playwright.

### Redacted test reports

Build shareable CI evidence with the client-side `inboxtap/reports` subpath.
`InboxTapReport` accepts matcher observations, captured messages, and explicit
application assertions, then produces deterministic, versioned JSON or a
self-contained static HTML report:

```ts
import { test as base } from "vitest";
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";
import { InboxTapReport } from "inboxtap/reports";

const test = extendInboxTap(base);

test("writes redacted evidence", async ({ expect, inboxTap, inbox }) => {
  const report = new InboxTapReport({ title: "Signup email" });
  extendInboxTapExpect(expect, { recorder: report });

  try {
    await inboxTap.transport.sendMail({
      from: "app@local.test",
      to: inbox.address,
      subject: "Verify your account",
      text: "Open https://app.local.test/verify/id-example?next=private",
    });
    await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
    const email = await inbox.waitForMessage({ subject: /verify/i });

    report.addAssertion({
      name: "verification email exposes one link",
      passed: email.links.length === 1,
      messageId: email.id,
    });
  } finally {
    for (const email of await inbox.messages()) report.addMessage(email);
    await report.write("artifacts/signup-email.json");
    await report.write("artifacts/signup-email.html");
  }
});
```

Writing from `finally` preserves the latest evidence when a matcher or
application assertion fails.

`write()` infers JSON or HTML from the file extension unless `format` is
provided, and creates missing parent directories. By default, reports exclude
raw RFC source, consistently pseudonymize email addresses, and redact URL
credentials, every query value, fragments, secret-like path values, common
authentication and cookie headers, and token-like values in text and HTML. Add
project-specific `redaction.patterns` or `redaction.additionalSensitiveHeaders`
when needed. If a custom pattern overlaps a URL, InboxTap replaces the whole
URL so regex-driven mutation cannot expose adjacent query or fragment values.

Recorder scope follows the extended `expect`. The example uses Vitest's
test-bound instance for per-test observations. Do not attach different
collectors to one shared Bun or Vitest `expect` while tests run concurrently;
record messages and application assertions explicitly instead, or intentionally
build one suite-level report.

Reports accept at most 100 messages and 1,000 assertions, and each rendered
artifact is capped at 10 MiB; bounded output includes explicit truncation
markers. JSON exposes `utf8BytesOmittedExact`; when bounded accounting cannot
inspect an entire omitted value, the byte count is a measured lower bound and
HTML labels it as `at least`. HTML output escapes captured markup and does not
execute captured scripts or load captured or remote images, styles, or tracking
pixels.

Redaction is best-effort, not a guarantee that arbitrary personal or secret
data will be detected. Review artifacts before sharing them. Setting
`includeRaw: true` retains a best-effort-redacted copy of the raw RFC source
and carries materially higher disclosure risk.

### SMTP fault injection

Every programmatic server exposes `server.faults` for deterministic
delivery-level failure tests; no enable flag is required. Register a rule
before triggering the application: the next matching SMTP transaction to
reach `DATA` consumes it.

```ts
inboxTap.server.faults.failNext({
  code: 451,
  message: "Temporary local failure",
  to: inbox.address,
});

await expect(triggerEmail(inbox.address)).rejects.toThrow();
expect(await inbox.messages()).toHaveLength(0);
```

Use `delayNext({ durationMs, to?, times? })`,
`disconnectNext({ afterBytes, to?, times? })`, or
`pauseNext({ to?, timeoutMs? })` to exercise timeouts, interrupted sends, and
concurrency. A pause gate exposes `state`, `waitUntilPaused()`, and an
idempotent `release()`:

```ts
const gate = inboxTap.server.faults.pauseNext({ to: inbox.address });
const delivery = triggerEmail(inbox.address);

await gate.waitUntilPaused();
gate.release();
await delivery;
```

Recipient filters match the SMTP envelope case-insensitively; any matching
recipient faults the whole transaction. Only one rule applies to a
transaction. Failed and disconnected deliveries are not captured, and
paused or delayed deliveries appear only after successful completion. Fault
controls are programmatic only—there are no HTTP routes or CLI flags.

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
- [`examples/fault-injection-vitest`](examples/fault-injection-vitest) — SMTP retries, pauses, latency, recipient targeting, and disconnect recovery with Vitest.
- [`examples/test-reporting-vitest`](examples/test-reporting-vitest) — Redacted HTML and JSON CI artifacts from matcher observations, captured mail, and application assertions.
- [`examples/test-fixture-bun`](examples/test-fixture-bun) — Bun lifecycle hooks with an explicit fresh inbox per test.
- [`examples/test-fixture-vitest`](examples/test-fixture-vitest) — File-scoped Vitest setup with concurrent, isolated inboxes.
- [`examples/test-fixture-playwright`](examples/test-fixture-playwright) — Playwright worker-fixture composition using a dynamic SMTP port.

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
