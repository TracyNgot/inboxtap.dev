import { expect, test as baseTest } from "@playwright/test";
import { extendInboxTap } from "../../src/fixtures/playwright.js";
import { instrumentTeardown, recordPorts } from "./helpers.js";

const test = extendInboxTap(baseTest).extend<Record<never, never>, { appSmtpPort: number }>({
  appSmtpPort: [
    async ({ inboxTap }, use) => {
      await use(inboxTap.smtp.port);
    },
    { scope: "worker" },
  ],
});
const addresses: string[] = [];
const apiPorts = new Set<number>();

test("uses worker and test scoped Playwright fixtures", async ({
  appSmtpPort,
  inbox,
  inboxTap,
}) => {
  instrumentTeardown(inboxTap);
  await recordPorts(inboxTap.server.apiPort, inboxTap.server.smtpPort);
  addresses.push(inbox.address);
  apiPorts.add(inboxTap.server.apiPort);
  expect(appSmtpPort).toBe(inboxTap.smtp.port);
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    subject: "Playwright runner",
    text: "Captured",
    to: inbox.address,
  });
  expect((await inbox.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Playwright runner");

  if (process.env.INBOXTAP_FORCE_RUNNER_FAILURE === "1") {
    expect("intentional runner failure").toBe("fixture teardown still runs");
  }
});

test("creates a fresh inbox on the shared Playwright worker", async ({ inbox, inboxTap }) => {
  instrumentTeardown(inboxTap);
  addresses.push(inbox.address);
  apiPorts.add(inboxTap.server.apiPort);
  expect(await inbox.messages()).toEqual([]);
});

test.afterAll(() => {
  expect(new Set(addresses).size).toBe(2);
  expect(apiPorts.size).toBe(1);
});
