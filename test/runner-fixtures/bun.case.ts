import { afterAll, expect, test } from "bun:test";
import { setupInboxTap } from "../../src/fixtures/bun.js";
import { instrumentTeardown, recordPorts } from "./helpers.js";

const inboxTap = setupInboxTap();
const addresses: string[] = [];
const apiPorts = new Set<number>();

test("uses the Bun lifecycle fixture with an explicit inbox", async () => {
  instrumentTeardown(inboxTap);
  await recordPorts(inboxTap.server.apiPort, inboxTap.server.smtpPort);
  apiPorts.add(inboxTap.server.apiPort);
  const inbox = await inboxTap.createInbox();
  addresses.push(inbox.address);
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    subject: "Bun runner",
    text: "Captured",
    to: inbox.address,
  });
  expect((await inbox.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Bun runner");

  if (process.env.INBOXTAP_FORCE_RUNNER_FAILURE === "1") {
    expect("intentional runner failure").toBe("fixture teardown still runs");
  }
});

test("creates another explicit Bun inbox on the shared file server", async () => {
  instrumentTeardown(inboxTap);
  apiPorts.add(inboxTap.server.apiPort);
  const inbox = await inboxTap.createInbox();
  addresses.push(inbox.address);
  expect(await inbox.messages()).toEqual([]);
});

afterAll(() => {
  expect(new Set(addresses).size).toBe(2);
  expect(apiPorts.size).toBe(1);
});
