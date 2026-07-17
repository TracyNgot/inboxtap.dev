# InboxTap

InboxTap is a small, dependency-free SMTP capture server for end-to-end email tests. Your application sends email to it exactly as it would to any SMTP host; the test creates an isolated inbox and waits for an email link, code, or regex match.

It is intentionally local-only. The defaults bind to `127.0.0.1`, do not implement authentication or TLS, and should never be exposed to a network.

## Run it

Requires Node.js 20 or later.

```bash
npm start
```

This starts:

```text
SMTP: 127.0.0.1:1025
API:  http://127.0.0.1:8025
```

Point the application under test at it:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
```

Choose alternate ports or a test-only recipient domain when needed:

```bash
npm start -- --smtp-port 2025 --http-port 9025 --domain mail.local.test
```

## Use from a test

```js
import { InboxTapClient } from "./src/client.js";

const inboxTap = new InboxTapClient({ baseUrl: "http://127.0.0.1:8025" });
const inbox = await inboxTap.createInbox({ alias: "signup" });

// Put inbox.address into the sign-up form or API request.
await page.getByLabel("Email").fill(inbox.address);
await page.getByRole("button", { name: "Create account" }).click();

const verificationUrl = await inbox.waitForLink({
  subject: /verify your email/i,
  contains: "/verify",
});
await page.goto(verificationUrl);
```

Other helpers:

```js
const code = await inbox.waitForCode({ subject: /security code/i });
const token = await inbox.waitForMatch({ pattern: /api_key=([A-Za-z0-9_-]+)/ });
const messages = await inbox.messages();
```

Each inbox has a unique recipient address such as `signup-f2a737d0d1e4@local.test`, so parallel tests do not read one another's emails.

## HTTP API

| Method | Path | Use |
| --- | --- | --- |
| `POST` | `/v1/inboxes` | Create `{ id, address }`; optional JSON body: `{ "alias": "signup" }` |
| `GET` | `/v1/inboxes/:id/messages` | Read all captured messages for one inbox |
| `GET` | `/v1/inboxes/:id/wait?timeoutMs=10000` | Long-poll for an email; optional `subject`, `subjectPattern`, and `afterId` filters |
| `DELETE` | `/v1/inboxes/:id` | Remove an inbox after its test |
| `GET` | `/health` | Check the service and discover the SMTP port |

Captured messages include parsed headers, plain text, original HTML/body, discovered HTTP(S) links, raw source, sender, and receive time.

## Current SMTP scope

The server supports `EHLO`, `HELO`, `MAIL FROM`, `RCPT TO`, `DATA`, `RSET`, `NOOP`, and `QUIT`, which covers normal local SMTP delivery from test configurations. It handles dot-stuffed message lines and delivers one message to all created inbox recipients included in the transaction.

It does not yet decode MIME transfer encodings/attachments, provide a browser inbox, or relay email externally. Those are sensible follow-ups after this test API is established.

## Verify

```bash
npm test
```
