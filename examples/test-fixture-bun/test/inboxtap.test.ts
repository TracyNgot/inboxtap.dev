import { expect, test } from "bun:test";
import { setupInboxTap } from "inboxtap/fixtures/bun";

const inboxTap = setupInboxTap();

test("captures mail for a fresh inbox", async () => {
  const inbox = await inboxTap.createInbox({ alias: "bun-welcome" });

  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Welcome from Bun",
    text: "Your account is ready.",
  });

  const message = await inbox.waitForMessage({ subject: "Welcome from Bun" });
  expect(message.envelope.to).toEqual([inbox.address]);
});

test("creates a different address for every test", async () => {
  const inbox = await inboxTap.createInbox({ alias: "bun-reset" });

  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Reset your password",
    text: "Open https://app.local.test/reset?id=example",
  });

  const link = await inbox.waitForLink({ subject: /reset your password/i });
  expect(link).toBe("https://app.local.test/reset?id=example");
});
