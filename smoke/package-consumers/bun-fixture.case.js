import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import { setupInboxTap } from "inboxtap/fixtures/bun";
import { extendInboxTapExpect } from "inboxtap/matchers/bun";

const require = createRequire(import.meta.url);
const cjsFixture = require("inboxtap/fixtures/bun");
const cjsMatchers = require("inboxtap/matchers/bun");
const inboxTap = setupInboxTap();
extendInboxTapExpect(expect);

test("loads the built Bun fixture from ESM and CJS", async () => {
  expect(typeof cjsFixture.setupInboxTap).toBe("function");
  expect(typeof cjsMatchers.extendInboxTapExpect).toBe("function");
  const inbox = await inboxTap.createInbox();
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    headers: {
      "List-Unsubscribe": "<https://example.test/unsubscribe?token=package-secret>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: '<a href="https://example.test/verify?token=package-secret">Verify</a>',
    subject: "Built Bun fixture",
    text: "Captured https://example.test/verify?token=package-secret",
    to: inbox.address,
  });
  const email = await inbox.waitForMessage({ timeoutMs: 2_000 });
  expect(email.subject).toBe("Built Bun fixture");
  await expect(inbox).toHaveDeliveredOnce({ subject: "Built Bun fixture" });
  expect(email).toHaveRecipient(inbox.address.toUpperCase());
  expect(email).toContainLink("/verify");
  expect(email).toHaveUnsubscribeHeader({ oneClick: true });
  expect(email).not.toContainLink("missing-link");
});
