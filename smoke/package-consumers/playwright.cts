import { expect as baseExpect } from "@playwright/test";
import type { CapturedEmail } from "inboxtap";
import type { TestInbox } from "inboxtap/client";
import { extendInboxTap } from "inboxtap/fixtures/playwright";
import { extendInboxTapExpect } from "inboxtap/matchers/playwright";

const inboxTapExpect = extendInboxTapExpect(baseExpect);
declare const inbox: TestInbox;
declare const email: CapturedEmail;

const deliveryAssertion: Promise<void> = inboxTapExpect(inbox).toHaveDeliveredOnce({
  quietMs: 10,
});
inboxTapExpect(email).toHaveRecipient("reader@example.test");
inboxTapExpect(email).toContainLink(/\/verify/u);
inboxTapExpect(email).toHaveUnsubscribeHeader({ oneClick: true });

// @ts-expect-error Playwright exposes InboxTap matchers only on the returned expect instance.
baseExpect(email).toHaveRecipient("reader@example.test");
// @ts-expect-error Delivery assertions require a TestInbox receiver.
inboxTapExpect(email).toHaveDeliveredOnce();
// @ts-expect-error Message assertions require a CapturedEmail receiver.
inboxTapExpect(inbox).toContainLink("/verify");

void [extendInboxTap, deliveryAssertion];
