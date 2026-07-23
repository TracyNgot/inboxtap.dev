import type { Fixtures, TestType } from "@playwright/test";
import type { TestInbox } from "../client/index.js";
import type { InboxTapFixture, InboxTapFixtureOptions } from "./index.js";
import { startInboxTapFixture } from "./index.js";

export interface PlaywrightInboxTapFixtures {
  inbox: TestInbox;
}

export interface PlaywrightInboxTapWorkerFixtures {
  inboxTap: InboxTapFixture;
}

export function extendInboxTap<TestArgs extends object, WorkerArgs extends object>(
  baseTest: TestType<TestArgs, WorkerArgs>,
  options: InboxTapFixtureOptions = {},
): TestType<TestArgs & PlaywrightInboxTapFixtures, WorkerArgs & PlaywrightInboxTapWorkerFixtures> {
  const fixtures: Fixtures<PlaywrightInboxTapFixtures, PlaywrightInboxTapWorkerFixtures> = {
    inbox: async ({ inboxTap }, use) => {
      await use(await inboxTap.createInbox());
    },
    inboxTap: [
      // biome-ignore lint/correctness/noEmptyPattern: Playwright requires fixture arguments to use object destructuring.
      async ({}, use) => {
        const fixture = await startInboxTapFixture(options);
        try {
          await use(fixture);
        } finally {
          await fixture.close();
        }
      },
      { scope: "worker" },
    ],
  };
  return baseTest.extend<PlaywrightInboxTapFixtures, PlaywrightInboxTapWorkerFixtures>(fixtures);
}
