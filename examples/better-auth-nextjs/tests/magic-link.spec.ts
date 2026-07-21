import { expect, test } from "@playwright/test";
import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();

test("signs in a brand-new user through a magic link", async ({ page }) => {
  const inbox = await inboxTap.createInbox({ alias: "magic" });

  await page.goto("/magic-link");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(page.getByText("Check your email for a sign-in link")).toBeVisible();

  const signInUrl = await inbox.waitForLink({ subject: /sign-in link/i, timeoutMs: 20_000 });
  await page.goto(signInUrl);

  await page.goto("/");
  await expect(page.getByText(`Signed in as ${inbox.address}`)).toBeVisible();
});
