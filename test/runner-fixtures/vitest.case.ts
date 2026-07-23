import { expect, test as baseTest } from "vitest";
import { extendInboxTap } from "../../src/fixtures/vitest.js";
import { instrumentTeardown, recordPorts } from "./helpers.js";

const test = extendInboxTap(baseTest.extend("baseMarker", async () => "preserved"));
const addresses: string[] = [];
const apiPorts = new Set<number>();
const synchronizeDelivery = createBarrier(2);

test("uses file and test scoped Vitest fixtures", async ({ baseMarker, inbox, inboxTap }) => {
  instrumentTeardown(inboxTap);
  await recordPorts(inboxTap.server.apiPort, inboxTap.server.smtpPort);
  addresses.push(inbox.address);
  apiPorts.add(inboxTap.server.apiPort);
  expect(baseMarker).toBe("preserved");
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    subject: "Vitest runner",
    text: "Captured",
    to: inbox.address,
  });
  expect((await inbox.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Vitest runner");

  if (process.env.INBOXTAP_FORCE_RUNNER_FAILURE === "1") {
    expect("intentional runner failure").toBe("fixture teardown still runs");
  }
});

for (const label of ["first", "second"] as const) {
  test.concurrent(`isolates the ${label} concurrent Vitest inbox`, async ({ inbox, inboxTap }) => {
    instrumentTeardown(inboxTap);
    addresses.push(inbox.address);
    apiPorts.add(inboxTap.server.apiPort);
    const subject = `Vitest ${label} ${inbox.address}`;

    await synchronizeDelivery();
    await inboxTap.transport.sendMail({
      from: "sender@example.test",
      subject,
      text: label,
      to: inbox.address,
    });

    expect((await inbox.messages()).map((email) => email.subject)).toEqual([subject]);
  });
}

test.afterAll(() => {
  expect(new Set(addresses).size).toBe(3);
  expect(apiPorts.size).toBe(1);
});

function createBarrier(expected: number): () => Promise<void> {
  let count = 0;
  let release: (() => void) | undefined;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });

  return async () => {
    count += 1;
    if (count === expected) release?.();
    await ready;
  };
}
