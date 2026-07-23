import { expect } from "bun:test";
import type { CapturedEmail } from "inboxtap";
import type { TestInbox } from "inboxtap/client";
import { extendInboxTapExpect } from "inboxtap/matchers/bun";

const registration: void = extendInboxTapExpect(expect);

declare const inbox: TestInbox;
declare const email: CapturedEmail;
const deliveryAssertion: Promise<void> = expect(inbox).toHaveDeliveredOnce({ quietMs: 10 });
expect(email).toHaveRecipient("reader@example.test");
expect(email).toContainLink(/\/verify/u);
expect(email).toHaveUnsubscribeHeader({ oneClick: true });

void [registration, deliveryAssertion];
