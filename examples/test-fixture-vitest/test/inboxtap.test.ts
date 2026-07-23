import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";

const test = extendInboxTap(base);

test.concurrent("isolates the welcome recipient", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Welcome to the product",
    text: "Your account is ready.",
  });

  const message = await inbox.waitForMessage({ subject: "Welcome to the product" });
  expect(message.envelope.to).toEqual([inbox.address]);
  expect(await inbox.messages()).toHaveLength(1);
});

test.concurrent("isolates the password-reset recipient", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Reset your password",
    text: "Open https://app.local.test/reset?id=example",
  });

  const message = await inbox.waitForMessage({ subject: "Reset your password" });
  expect(message.envelope.to).toEqual([inbox.address]);
  expect(await inbox.messages()).toHaveLength(1);
});
