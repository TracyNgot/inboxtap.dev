import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";

const test = extendInboxTap(base);

function isTransientSmtpFailure(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "responseCode" in error &&
    error.responseCode === 451
  );
}

async function sendWithOneRetry(send: () => Promise<unknown>): Promise<number> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await send();
      return attempt;
    } catch (error) {
      if (attempt === 2 || !isTransientSmtpFailure(error)) throw error;
    }
  }

  throw new Error("Retry loop ended without sending");
}

test("retries one transient SMTP failure in application code", async ({ inboxTap, inbox }) => {
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

  expect(attempts).toBe(2);
  const message = await inbox.waitForMessage({ subject: "Retry receipt" });
  expect(message.envelope.to).toEqual([inbox.address]);
  expect(await inbox.messages()).toHaveLength(1);
});

test("pauses one delivery while an unrelated delivery completes", async ({ inboxTap, inbox }) => {
  const controlInbox = await inboxTap.createInbox();
  const gate = inboxTap.server.faults.pauseNext({ to: inbox.address });
  const pausedDelivery = inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Paused receipt",
    text: "This message is not captured until the gate is released.",
  });

  try {
    await gate.waitUntilPaused();
    expect(gate.state).toBe("paused");
    expect(await inbox.messages()).toHaveLength(0);

    await inboxTap.transport.sendMail({
      from: "app@local.test",
      to: controlInbox.address,
      subject: "Control receipt",
      text: "An unrelated SMTP transaction can finish independently.",
    });
    expect(await controlInbox.messages()).toHaveLength(1);
  } finally {
    gate.release();
    await pausedDelivery;
  }

  expect(gate.state).toBe("released");
  expect(await inbox.messages()).toHaveLength(1);
});

test("recovers after a server-side disconnect", async ({ inboxTap, inbox }) => {
  inboxTap.server.faults.disconnectNext({
    afterBytes: 0,
    to: inbox.address,
  });

  await expect(
    inboxTap.transport.sendMail({
      from: "app@local.test",
      to: inbox.address,
      subject: "Interrupted receipt",
      text: "This SMTP transaction is disconnected and never captured.",
    }),
  ).rejects.toBeInstanceOf(Error);
  expect(await inbox.messages()).toHaveLength(0);

  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Recovered receipt",
    text: "A later SMTP transaction succeeds on a fresh connection.",
  });

  const message = await inbox.waitForMessage({ subject: "Recovered receipt" });
  expect(message.envelope.to).toEqual([inbox.address]);
  expect(await inbox.messages()).toHaveLength(1);
});
