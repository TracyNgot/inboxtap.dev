# SMTP fault injection with Vitest

Exercise retry, concurrency, and connection-recovery paths at the real SMTP boundary. This
standalone Vitest project uses InboxTap's runner fixture, a dynamic local Nodemailer transport,
and a fresh inbox for every test.

## Prerequisites

- Bun 1.3 or later

## Setup

```bash
bun install --frozen-lockfile
```

InboxTap is pinned to `1.2.0`, the first release containing `server.faults`.

## Run the tests

```bash
bun run test
```

The suite starts InboxTap on dynamic loopback ports and closes its transport and listeners after
the file finishes.

## What the example proves

The three tests exercise delivery-level SMTP behavior:

- a `451` response that application code retries once;
- a recipient-targeted pause while an unrelated transaction completes; and
- a connection drop followed by a successful delivery on a fresh connection.

Failed and disconnected deliveries never enter the inbox. A paused message appears only after its
gate is released.

## Transient retry

Register the failure before triggering the application. The next matching transaction consumes the
rule when it reaches `DATA`:

```ts
inboxTap.server.faults.failNext({
  code: 451,
  message: "Temporary local failure",
  to: inbox.address,
});

const attempts = await sendWithOneRetry(() =>
  inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Retry receipt",
    text: "The application retries this delivery once.",
  }),
);
```

`sendWithOneRetry()` belongs to this example application. InboxTap returns the configured SMTP
response; it does not retry, persist, or deduplicate application work.

## Pause and release

`pauseNext()` returns an isolated gate. Waiting until the transaction is paused makes the
concurrency point deterministic:

```ts
const gate = inboxTap.server.faults.pauseNext({ to: inbox.address });
const pausedDelivery = inboxTap.transport.sendMail({
  from: "app@local.test",
  to: inbox.address,
  subject: "Paused receipt",
  text: "This message is not captured until release.",
});

await gate.waitUntilPaused();
expect(await inbox.messages()).toHaveLength(0);

await sendUnrelatedMessage();
gate.release();
await pausedDelivery;
```

The test releases the gate in `finally`, so an assertion failure cannot leave the SMTP transaction
waiting.

## Disconnect recovery

Disconnect thresholds are chunk-granular. A threshold of zero attempts to close the connection as
soon as `DATA` handling begins:

```ts
inboxTap.server.faults.disconnectNext({
  afterBytes: 0,
  to: inbox.address,
});

await expect(sendInterruptedMessage()).rejects.toBeInstanceOf(Error);
expect(await inbox.messages()).toHaveLength(0);

await sendRecoveredMessage();
expect(await inbox.messages()).toHaveLength(1);
```

The second send demonstrates transport recovery; it is a new SMTP transaction and does not inherit
the consumed fault.

## Ownership boundaries

InboxTap owns local SMTP capture and deterministic delivery faults. The application remains
responsible for retry policy, durable jobs, idempotency, and business-level deduplication. The retry
helper in this example is intentionally small so those responsibilities stay visible.

## Troubleshooting

- **The failure rule affects another test** — always target the injected `inbox.address`; each test
  receives a fresh inbox.
- **A paused test times out** — call `waitUntilPaused()` before inspecting state and release the gate
  in `finally`.
- **A disconnect assertion expects an SMTP status** — connection drops do not carry an SMTP reply
  code; assert rejection and then verify recovery.
- **A dependency resolves to an unreleased API** — install with the committed lockfile and keep
  `inboxtap` pinned exactly to `1.2.0`.
