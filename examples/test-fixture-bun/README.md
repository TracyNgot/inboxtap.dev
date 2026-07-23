# Bun test fixtures + InboxTap

Use InboxTap's Bun adapter to start one local SMTP capture server for the test file while every
test creates its own inbox. Both listeners use dynamic ports, and the fixture closes them after
the file finishes.

## Prerequisites

- [Bun](https://bun.sh) 1.3 or later

## Setup

```bash
npm install
```

## Run the tests

```bash
bun test
```

The tests start InboxTap automatically. No separate CLI process or fixed ports are required.

## How it works

```ts
import { expect, test } from "bun:test";
import { setupInboxTap } from "inboxtap/fixtures/bun";

const inboxTap = setupInboxTap();

test("captures an email", async () => {
  const inbox = await inboxTap.createInbox();
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

`setupInboxTap()` registers Bun's asynchronous `beforeAll` and `afterAll` hooks. Its
preconfigured Nodemailer transport targets the dynamically selected SMTP port and is verified
before the tests begin.

## Isolation and cleanup

Call `createInbox()` inside every test. Each call generates a unique recipient, so tests can
share the server without sharing messages. The registered teardown closes the transport and
both InboxTap listeners even when a test fails.

## Troubleshooting

- **InboxTap is available only after `beforeAll`** — declare `setupInboxTap()` at module scope,
  but call its methods from a test or a later lifecycle hook.
- **A wait timed out** — confirm the message was sent to that test's `inbox.address`.
- **The process stays open** — avoid creating a second transport or server outside the managed
  fixture unless you also close it.
