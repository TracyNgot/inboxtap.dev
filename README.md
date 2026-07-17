# InboxTap

InboxTap is an open-source SMTP capture server for deterministic email-flow tests. Point your application at a local SMTP address, then await the verification link, OTP, or key directly from your test.

```bash
bunx inboxtap
```

The published CLI also runs with Node 20 or later:

```bash
npx inboxtap
```

It captures all local SMTP recipients in a bounded in-memory store. No message is delivered externally.

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
SMTP: 127.0.0.1:1025
API:  http://127.0.0.1:8025
```

Configure the application under test:

```env
SMTP_HOST=127.0.0.1
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
curl "http://127.0.0.1:8025/api/emails/latest?to=signup%40local.test"
```

Captured emails include the SMTP envelope, headers, decoded text/HTML, discovered HTTP(S) links, 4–8 digit codes, and raw RFC 822 source.

## Safety and scope

InboxTap binds to `127.0.0.1` by default and intentionally disables SMTP authentication and STARTTLS. Keep it local; it is not an outbound relay or production mail server.

Version 0.1 is in-memory only. It does not include persistence, a dashboard, attachments, webhooks, Docker, or configurable extraction files.

## Contributing

```bash
bun install
bun run verify
```

Lefthook installs pre-commit checks for formatting, linting, type checking, and Bun tests. Pre-push runs the complete verification suite, including the tsup build and Node distribution smoke test.

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [STYLE_GUIDE.md](STYLE_GUIDE.md) for coding and commit conventions. Maintainers can use [RELEASING.md](RELEASING.md) for the verified npm release flow.

## License

[MIT](LICENSE)
