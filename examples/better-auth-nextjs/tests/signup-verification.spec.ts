import { expect, test } from "@playwright/test";
import { InboxTapClient } from "inboxtap/client";

const inboxTap = new InboxTapClient();
const password = "inboxtap-example-password";

async function signUp(page: import("@playwright/test").Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Check your email for a verification link")).toBeVisible();
}

test("signs up, verifies via the emailed link, and lands signed in", async ({ page }) => {
  const inbox = await inboxTap.createInbox({ alias: "signup" });

  await signUp(page, inbox.address);

  const verificationUrl = await inbox.waitForLink({
    subject: /verify your email/i,
    timeoutMs: 20_000,
  });
  await page.goto(verificationUrl);

  await page.goto("/");
  await expect(page.getByText(`Signed in as ${inbox.address} (verified: true)`)).toBeVisible();
});

test("blocks password sign-in until the email is verified", async ({ page }) => {
  const inbox = await inboxTap.createInbox({ alias: "unverified" });

  await signUp(page, inbox.address);

  await page.goto("/signin");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(/not verified/i)).toBeVisible();
});
