import { createServer as createNetServer } from "node:net";
import type { Server as NetServer } from "node:net";
import { expect, test } from "bun:test";
import { InboxTapServer } from "../src/server.js";
import { sendSmtp } from "./helpers/smtp.js";

const ipv6 = await probeBind("::1", 0).then(closeProbe, () => false);

test.if(ipv6)("delivers over both loopback families into one inbox", async () => {
  const server = await new InboxTapServer({ apiPort: 0, smtpPort: 0 }).start();
  try {
    expect(server.health().smtp.host).toBe("localhost");
    expect(server.health().api.host).toBe("localhost");
    await sendSmtp({
      host: "127.0.0.1",
      port: server.smtpPort,
      to: "dual@example.test",
      raw: "Subject: Via IPv4\r\n\r\nHello",
    });
    await sendSmtp({
      host: "::1",
      port: server.smtpPort,
      to: "dual@example.test",
      raw: "Subject: Via IPv6\r\n\r\nHello",
    });

    const subjects = await listSubjects(`http://[::1]:${server.apiPort}`, "dual@example.test");
    expect(subjects.sort()).toEqual(["Via IPv4", "Via IPv6"]);
    const health = await fetch(`http://localhost:${server.apiPort}/health`);
    expect(health.status).toBe(200);
  } finally {
    await server.stop();
  }
});

test("an explicit host binds that address only", async () => {
  const server = await new InboxTapServer({
    apiHost: "127.0.0.1",
    apiPort: 0,
    smtpHost: "127.0.0.1",
    smtpPort: 0,
  }).start();
  try {
    expect(server.health().smtp.host).toBe("127.0.0.1");
    expect(server.health().api.host).toBe("127.0.0.1");
    if (ipv6) {
      await expect(
        sendSmtp({
          host: "::1",
          port: server.smtpPort,
          to: "v4only@example.test",
          raw: "Subject: Should fail\r\n\r\nHello",
        }),
      ).rejects.toThrow();
    }
  } finally {
    await server.stop();
  }
});

test.if(ipv6)("falls back to IPv4 only when the fixed port is squatted on ::1", async () => {
  const squatter = await probeBind("::1", 0);
  const port = readProbePort(squatter);
  const ipv4Free = await probeBind("127.0.0.1", port).then(closeProbe, () => false);
  try {
    if (!ipv4Free) return;
    const server = await new InboxTapServer({ apiPort: 0, smtpPort: port }).start();
    try {
      expect(server.health().smtp.host).toBe("127.0.0.1");
      await sendSmtp({
        host: "127.0.0.1",
        port: server.smtpPort,
        to: "fallback@example.test",
        raw: "Subject: Fallback\r\n\r\nHello",
      });
      const subjects = await listSubjects(server.apiUrl, "fallback@example.test");
      expect(subjects).toEqual(["Fallback"]);
    } finally {
      await server.stop();
    }
  } finally {
    await closeProbe(squatter);
  }
});

async function listSubjects(baseUrl: string, to: string): Promise<string[]> {
  const response = await fetch(`${baseUrl}/api/emails?to=${encodeURIComponent(to)}`);
  const body = (await response.json()) as { emails: Array<{ subject: string }> };
  return body.emails.map((email) => email.subject);
}

function probeBind(host: string, port: number): Promise<NetServer> {
  return new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once("error", reject);
    probe.listen(port, host, () => resolve(probe));
  });
}

function readProbePort(probe: NetServer): number {
  const address = probe.address();
  if (!address || typeof address === "string") throw new Error("Unable to read the probe port");
  return address.port;
}

function closeProbe(probe: NetServer): Promise<true> {
  return new Promise((resolve) => {
    probe.close(() => resolve(true));
  });
}
