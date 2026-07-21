import { expect, test } from "@playwright/test";
import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();
const codePattern = /\b\d{6}\b/;

test("signs in with an emailed one-time code", async ({ page }) => {
  const inbox = await inboxTap.createInbox({ alias: "otp" });

  await page.goto("/otp");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Email me a code" }).click();

  const code = await inbox.waitForCode({ subject: /sign-in code/i, timeoutMs: 20_000 });
  await page.getByLabel("Code").fill(code);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(`Signed in as ${inbox.address}`)).toBeVisible();
});

test("a re-requested code supersedes the first one", async ({ page }) => {
  const inbox = await inboxTap.createInbox({ alias: "otp-resend" });

  await page.goto("/otp");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Email me a code" }).click();

  const firstEmail = await inbox.waitForMessage({ subject: /sign-in code/i, timeoutMs: 20_000 });
  await page.getByRole("button", { name: "Send a new code" }).click();
  const secondEmail = await inbox.waitForMessage({
    subject: /sign-in code/i,
    afterId: firstEmail.id,
    timeoutMs: 20_000,
  });
  const secondCode = secondEmail.text.match(codePattern)?.[0];
  expect(secondCode).toBeDefined();
  expect(secondCode).not.toBe(firstEmail.text.match(codePattern)?.[0]);

  await page.getByLabel("Code").fill(secondCode ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(`Signed in as ${inbox.address}`)).toBeVisible();
});
