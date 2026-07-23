import { InboxTapServer } from "inboxtap";
import { InboxTapClient } from "inboxtap/client";
import { startInboxTapFixture } from "inboxtap/fixtures";
import { setupInboxTap } from "inboxtap/fixtures/bun";
import { extendInboxTap as extendVitestInboxTap } from "inboxtap/fixtures/vitest";

void [
  InboxTapServer,
  InboxTapClient,
  startInboxTapFixture,
  setupInboxTap,
  extendVitestInboxTap,
];
