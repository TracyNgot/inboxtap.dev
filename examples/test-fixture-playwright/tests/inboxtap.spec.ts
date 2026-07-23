import { expect, test } from "./fixtures.js";

test("passes dynamic SMTP settings to the application fixture", async ({
  app,
  inbox,
  inboxTap,
}) => {
  expect(app.smtpPort).toBe(inboxTap.smtp.port);

  await app.sendWelcome(inbox.address);

  const message = await inbox.waitForMessage({
    subject: "Welcome from the worker fixture",
  });
  expect(message.envelope.to).toEqual([inbox.address]);
});

test("creates a fresh inbox for the next test", async ({ app, inbox }) => {
  expect(await inbox.messages()).toEqual([]);

  await app.sendWelcome(inbox.address);

  const message = await inbox.waitForMessage({
    subject: "Welcome from the worker fixture",
  });
  expect(message.envelope.to).toEqual([inbox.address]);
});
