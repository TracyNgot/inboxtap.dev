# Scheduled email delivery with Vitest

This example keeps scheduling in application code while InboxTap observes the real SMTP delivery.
A bounded `MailProvider` fake exposes `send`, `schedule`, and `cancel`; an injected virtual clock
makes due work deterministic; and Nodemailer sends every immediate or due message into an isolated
InboxTap inbox.

## Prerequisites

- Bun 1.3 or later
- InboxTap 1.4.1

## Setup

```bash
cd examples/scheduled-email-vitest
bun install --frozen-lockfile
```

## Run the tests

```bash
bun run test
```

The fixture starts InboxTap on dynamic ports, creates a fresh inbox for each test, and closes the
SMTP transport and both listeners after the file finishes.

## What the example proves

The five Vitest cases cover the complete local contract:

- `send` delivers immediately through Nodemailer.
- A scheduled message stays absent before its due time.
- Advancing to the due time delivers the message exactly once.
- Cancelling removes pending work before delivery.
- Equal due times preserve insertion order, while earlier due times always run first.
- The pending queue rejects entries beyond its configured bound and reuses capacity after
  cancellation.

## Provider contract

`src/mail-provider.ts` defines the application-owned boundary:

```ts
export interface MailProvider {
  cancel(id: string): boolean;
  schedule(message: MailMessage, scheduledAt: Date): string;
  send(message: MailMessage): Promise<void>;
}
```

`FakeMailProvider` copies each message before retaining it and caps the pending queue at 100
entries. Tests may choose a smaller bound. IDs increase deterministically within one provider
instance, and cancelling an unknown or already-cancelled ID returns `false`. `schedule()` requires
a time later than the virtual clock; use `send()` for immediate mail.

## Virtual clock

`VirtualClock` owns a current `Date` and notifies registered listeners when a test calls
`advanceTo()` or `advanceBy()`. It rejects invalid dates, backward travel, negative durations, and
concurrent advances. No global timer or wall-clock delay is involved.

The provider subscribes to clock advances, removes due entries before sending them, sorts first by
due time and then by insertion order, and awaits each Nodemailer delivery in sequence. When a clock
advance resolves, every successful due delivery is already visible through InboxTap.

## Exactly-once delivery and cancellation

The provider deletes an entry before calling Nodemailer, so advancing the clock again cannot
deliver the same scheduled item twice. This fake deliberately demonstrates one delivery attempt;
application retry and persistence policies remain the responsibility of the application.

Cancellation applies only to pending work. Once delivery has started, the entry is no longer
pending and `cancel()` returns `false`.

## Ownership boundaries

SMTP has no standard `scheduledAt` or cancellation operation. InboxTap therefore does not invent
one. The example owns scheduling, ordering, capacity, and cancellation, then crosses the same
Nodemailer-to-SMTP boundary used by immediate email.

The fake is intentionally in `examples/`, not the public InboxTap package. It is a contract to copy
or adapt for an application, not a promise that every email provider exposes identical scheduling
semantics.

## Troubleshooting

- **A message appears before its due time**: make sure application code uses the injected clock
  rather than `Date.now()`.
- **The queue is full**: cancel pending work, advance the clock to deliver due work, or raise the
  test-specific bound up to 100.
- **A test hangs**: await the clock advance; it awaits the underlying Nodemailer delivery.
- **A scheduled send fails**: the error is propagated from Nodemailer. Define retry behavior in the
  application contract rather than hiding it in the fake.
