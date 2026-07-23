import { InboxTapServer } from "inboxtap";
import type { CapturedEmail } from "inboxtap";
import { InboxTapClient } from "inboxtap/client";
import type { TestInbox } from "inboxtap/client";
import { startInboxTapFixture } from "inboxtap/fixtures";
import { setupInboxTap } from "inboxtap/fixtures/bun";
import { extendInboxTap as extendVitestInboxTap } from "inboxtap/fixtures/vitest";
import { createInboxTapMatchers } from "inboxtap/matchers";
import { extendInboxTapExpect as extendVitestInboxTapExpect } from "inboxtap/matchers/vitest";
import { expect as vitestExpect } from "vitest";

const faultServer = new InboxTapServer();
faultServer.faults.failNext({ code: 451 });

const vitestRegistration: void = extendVitestInboxTapExpect(vitestExpect);

declare const inbox: TestInbox;
declare const email: CapturedEmail;
const vitestDeliveryAssertion: Promise<void> = vitestExpect(inbox).toHaveDeliveredOnce();
vitestExpect(email).toHaveRecipient("reader@example.test");
vitestExpect(email).toContainLink(/\/verify/u);
vitestExpect(email).toHaveUnsubscribeHeader();

void [
  InboxTapServer,
  InboxTapClient,
  startInboxTapFixture,
  setupInboxTap,
  extendVitestInboxTap,
  createInboxTapMatchers,
  vitestRegistration,
  vitestDeliveryAssertion,
];
