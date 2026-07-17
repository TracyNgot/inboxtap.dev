import { afterEach, beforeEach, expect, test } from "bun:test";
import { InboxTapClient } from "../src/client/index.js";
import { InboxTapServer } from "../src/server.js";
import { sendSmtp } from "./helpers/smtp.js";

let server: InboxTapServer;
let client: InboxTapClient;

beforeEach(async () => {
  server = await new InboxTapServer({ apiPort: 0, smtpPort: 0 }).start();
  client = new InboxTapClient({ baseUrl: server.apiUrl });
});

afterEach(async () => {
  await server.stop();
});

test("captures arbitrary recipients and exposes an email through the HTTP API", async () => {
  const recipient = "anyone@another-domain.test";
  await sendSmtp({
    host: server.smtpHost,
    port: server.smtpPort,
    to: recipient,
    raw: "Subject: Hello\r\n\r\nHello from SMTP",
  });

  const emails = await client.listEmails({ to: recipient });
  expect(emails).toHaveLength(1);
  const [email] = emails;
  if (!email) throw new Error("Expected a captured email");
  expect(email.subject).toBe("Hello");
  expect((await client.latestEmail({ to: recipient })).id).toBe(email.id);
  const byId = await fetch(`${server.apiUrl}/api/emails/${email.id}`).then((response) =>
    response.json(),
  );
  expect(byId.email.id).toBe(email.id);
  expect((await fetch(`${server.apiUrl}/health`)).status).toBe(200);
});

test("lets a test await a magic link, one-time code, and custom key", async () => {
  const inbox = await client.createInbox({ alias: "signup" });
  const link = inbox.waitForLink({
    contains: "ticket=abc",
    subject: /verify your email/i,
    timeoutMs: 2_000,
  });
  await sendSmtp({
    host: server.smtpHost,
    port: server.smtpPort,
    to: inbox.address,
    raw: [
      "Subject: Verify your email",
      "Content-Type: text/html; charset=utf-8",
      "",
      '<a href="https://app.example.test/verify?ticket=abc&amp;next=welcome">Verify</a>',
    ].join("\r\n"),
  });
  expect(await link).toBe("https://app.example.test/verify?ticket=abc&next=welcome");

  const code = inbox.waitForCode({ subject: "security code", timeoutMs: 2_000 });
  await sendSmtp({
    host: server.smtpHost,
    port: server.smtpPort,
    to: inbox.address,
    raw: "Subject: Your security code\r\n\r\nUse 482910 to sign in.",
  });
  expect(await code).toBe("482910");

  const key = inbox.waitForMatch({ pattern: /api_key=([A-Za-z0-9_-]+)/, timeoutMs: 2_000 });
  await sendSmtp({
    host: server.smtpHost,
    port: server.smtpPort,
    to: inbox.address,
    raw: "Subject: Credentials\r\n\r\nContinue with api_key=sk_test_12345",
  });
  expect(await key).toBe("api_key=sk_test_12345");
  expect(await inbox.clear()).toBe(3);
});

test("returns an HTTP timeout when no matching message arrives", async () => {
  const response = await fetch(
    `${server.apiUrl}/api/emails/wait?to=missing@example.test&timeoutMs=10`,
  );
  expect(response.status).toBe(408);
});

test("rejects SMTP messages above the configured size limit", async () => {
  await server.stop();
  server = await new InboxTapServer({
    apiPort: 0,
    maxMessageSize: 20,
    smtpPort: 0,
  }).start();
  client = new InboxTapClient({ baseUrl: server.apiUrl });

  await expect(
    sendSmtp({
      host: server.smtpHost,
      port: server.smtpPort,
      to: "large@example.test",
      raw: "Subject: This message is intentionally too large\r\n\r\nThis body exceeds twenty bytes.",
    }),
  ).rejects.toThrow("SMTP delivery failed");
  expect(await client.listEmails({ to: "large@example.test" })).toEqual([]);
});
