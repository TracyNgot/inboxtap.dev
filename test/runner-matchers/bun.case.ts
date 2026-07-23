import { expect, test } from "bun:test";
import { setupInboxTap } from "../../src/fixtures/bun.js";
import { extendInboxTapExpect } from "../../src/matchers/bun.js";
import type { InboxTapMatcherObservation } from "../../src/matchers/index.js";
import { captureMatcherEmail, errorMessage, SENSITIVE_BODY, SENSITIVE_TOKEN } from "./helpers.js";

const observations: InboxTapMatcherObservation[] = [];
const inboxTap = setupInboxTap();
extendInboxTapExpect(expect, {
  recorder: { recordMatcherObservation: (observation) => observations.push(observation) },
});

test("registers InboxTap matchers with Bun expect", async () => {
  const inbox = await inboxTap.createInbox();
  const email = await captureMatcherEmail(inboxTap, inbox);

  await expect(inbox).toHaveDeliveredOnce({ quietMs: 10, subject: "Matcher delivery" });
  await expect(inbox).not.toHaveDeliveredOnce({ subject: "not this message" });
  expect(email).toHaveRecipient(inbox.address.toUpperCase());
  expect(email).not.toHaveRecipient("other@example.test");
  expect(email).toContainLink("/verify");
  expect(email).not.toContainLink("missing-link");
  expect(email).toHaveUnsubscribeHeader({ oneClick: true });

  let failure = "";
  try {
    expect(email).toContainLink(`missing?token=${SENSITIVE_TOKEN}`);
  } catch (error) {
    failure = errorMessage(error);
  }

  expect(failure).toContain("Expected captured email to contain a matching link");
  expect(failure).not.toContain(SENSITIVE_TOKEN);
  expect(failure).not.toContain(SENSITIVE_BODY);
  expect(observations.map(({ matcher }) => matcher)).toEqual([
    "toHaveDeliveredOnce",
    "toHaveDeliveredOnce",
    "toHaveRecipient",
    "toHaveRecipient",
    "toContainLink",
    "toContainLink",
    "toHaveUnsubscribeHeader",
    "toContainLink",
  ]);
});
