// biome-ignore syntax/correctness/noTypeOnlyImportAttributes: CJS declarations need ESM type resolution.
import type { TestAPI } from "vitest" with { "resolution-mode": "import" };
import type { TestInbox } from "../client/index.js";
import type { InboxTapFixture, InboxTapFixtureOptions } from "./index.js";
import { startInboxTapFixture } from "./index.js";

export interface VitestInboxTapFixtures {
  inbox: TestInbox;
  inboxTap: InboxTapFixture;
}

export function extendInboxTap<Context extends object>(
  baseTest: TestAPI<Context>,
  options: InboxTapFixtureOptions = {},
): TestAPI<Context & VitestInboxTapFixtures> {
  return baseTest.extend<{
    $file: { inboxTap: InboxTapFixture };
    $test: { inbox: TestInbox };
  }>({
    inbox: async ({ inboxTap }, use) => {
      await use(await inboxTap.createInbox());
    },
    inboxTap: [
      // biome-ignore lint/correctness/noEmptyPattern: Vitest requires fixture arguments to use object destructuring.
      async ({}, use) => {
        const fixture = await startInboxTapFixture(options);
        try {
          await use(fixture);
        } finally {
          await fixture.close();
        }
      },
      { scope: "file" },
    ],
  });
}
