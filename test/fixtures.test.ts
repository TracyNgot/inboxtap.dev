import { expect, test } from "bun:test";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { setupInboxTap } from "../src/fixtures/bun.js";
import { startInboxTapFixture } from "../src/fixtures/index.js";

const bunInboxTap = setupInboxTap();

test("starts a ready plaintext fixture on dynamic ports", async () => {
  const fixture = await startInboxTapFixture();

  try {
    expect(fixture.server.apiPort).toBeGreaterThan(0);
    expect(fixture.server.smtpPort).toBeGreaterThan(0);
    expect(fixture.smtp).toEqual({
      host: fixture.server.smtpHost,
      ignoreTLS: true,
      port: fixture.server.smtpPort,
      secure: false,
    });
    expect(await fixture.client.health()).toEqual(fixture.server.health());

    const inbox = await fixture.createInbox({ alias: "ready" });
    await fixture.transport.sendMail({
      from: "sender@example.test",
      subject: "Fixture ready",
      text: "Captured locally",
      to: inbox.address,
    });

    expect((await inbox.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Fixture ready");
  } finally {
    await fixture.close();
  }
});

test("isolates concurrently created inboxes", async () => {
  const fixture = await startInboxTapFixture();

  try {
    const [first, second] = await Promise.all([
      fixture.createInbox({ alias: "parallel" }),
      fixture.createInbox({ alias: "parallel" }),
    ]);
    expect(first.address).not.toBe(second.address);

    await Promise.all([
      fixture.transport.sendMail({
        from: "sender@example.test",
        subject: "First delivery",
        text: "One",
        to: first.address,
      }),
      fixture.transport.sendMail({
        from: "sender@example.test",
        subject: "Second delivery",
        text: "Two",
        to: second.address,
      }),
    ]);

    const [firstMessages, secondMessages] = await Promise.all([
      first.messages(),
      second.messages(),
    ]);
    expect(firstMessages.map(({ subject }) => subject)).toEqual(["First delivery"]);
    expect(secondMessages.map(({ subject }) => subject)).toEqual(["Second delivery"]);
  } finally {
    await fixture.close();
  }
});

test("shares one teardown across concurrent close calls", async () => {
  const fixture = await startInboxTapFixture();
  const apiUrl = fixture.server.apiUrl;

  await Promise.all([fixture.close(), fixture.close(), fixture.close()]);
  await expect(fetch(`${apiUrl}/health`)).rejects.toThrow();
  await fixture.close();
});

test("cleans SMTP startup when the API port is occupied", async () => {
  const occupiedApi = await reservePort();
  const availableSmtp = await reservePort();
  const smtpPort = availableSmtp.port;
  await closeServer(availableSmtp.server);

  try {
    await expect(
      startInboxTapFixture({
        apiHost: "127.0.0.1",
        apiPort: occupiedApi.port,
        smtpHost: "127.0.0.1",
        smtpPort,
      }),
    ).rejects.toThrow();

    const rebound = await listenOnPort(smtpPort);
    await closeServer(rebound);
  } finally {
    await closeServer(occupiedApi.server);
  }
});

test("registers Bun lifecycle hooks and creates a fresh inbox per test", async () => {
  const first = await bunInboxTap.createInbox({ alias: "bun" });
  const second = await bunInboxTap.createInbox({ alias: "bun" });

  expect(first.address).not.toBe(second.address);
  await bunInboxTap.transport.sendMail({
    from: "sender@example.test",
    subject: "Bun lifecycle",
    text: "Ready",
    to: first.address,
  });
  expect((await first.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Bun lifecycle");
  expect(await second.messages()).toEqual([]);
});

async function reservePort(): Promise<{ port: number; server: ReturnType<typeof createServer> }> {
  const server = await listenOnPort(0);
  const address = server.address() as AddressInfo;
  return { port: address.port, server };
}

function listenOnPort(port: number): Promise<ReturnType<typeof createServer>> {
  const server = createServer();
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
