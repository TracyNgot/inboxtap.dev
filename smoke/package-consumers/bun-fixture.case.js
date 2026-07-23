import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { setupInboxTap } from "inboxtap/fixtures/bun";

const require = createRequire(import.meta.url);
const cjsFixture = require("inboxtap/fixtures/bun");
const inboxTap = setupInboxTap();

test("loads the built Bun fixture from ESM and CJS", async () => {
  expect(typeof cjsFixture.setupInboxTap).toBe("function");
  const inbox = await inboxTap.createInbox();
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    subject: "Built Bun fixture",
    text: "Captured",
    to: inbox.address,
  });
  expect((await inbox.waitForMessage({ timeoutMs: 2_000 })).subject).toBe("Built Bun fixture");
});
