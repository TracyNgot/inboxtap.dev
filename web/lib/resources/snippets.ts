export const playwrightFixtureSnippet = `import { test as base } from "@playwright/test";
import { extendInboxTap } from "inboxtap/fixtures/playwright";

const withInboxTap = extendInboxTap(base);

export const test = withInboxTap.extend<object, { app: TestApp }>({
  app: [
    async ({ inboxTap }, use) => {
      const app = await startTestApp({ smtp: inboxTap.smtp });
      try {
        await use(app);
      } finally {
        await app.close();
      }
    },
    { scope: "worker" },
  ],
});`;

export const cypressTaskSnippet = `import { defineConfig } from "cypress";
import { InboxTapClient, TestInbox } from "inboxtap/client";

const inboxTap = new InboxTapClient();

interface LinkArgs {
  to: string;
  subject?: string;
  contains?: string;
  timeoutMs?: number;
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on("task", {
        "inboxtap:createInbox": async (alias: string) =>
          (await inboxTap.createInbox({ alias })).address,

        "inboxtap:waitForLink": ({ to, ...options }: LinkArgs) =>
          new TestInbox(inboxTap, to).waitForLink(options),
      });
    },
  },
});`;

export const vitestFixtureSnippet = `import { expect, test as base } from "vitest";
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";

extendInboxTapExpect(expect);
const test = extendInboxTap(base);

test.concurrent("captures one delivery", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Account",
    text: "https://app.local.test/verify",
  });

  const email = await inbox.waitForMessage();
  await expect(inbox).toHaveDeliveredOnce({ quietMs: 100 });
  expect(email).toHaveRecipient(inbox.address);
  expect(email).toContainLink("/verify");
});`;

export const betterAuthCallbackSnippet = `const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: ({ user, url }) =>
      sendLocalEmail(user.email, "Verify your email", url),
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: ({ user, url }) =>
      sendLocalEmail(user.email, "Reset your password", url),
  },
  plugins: [
    magicLink({
      sendMagicLink: ({ email, url }) =>
        sendLocalEmail(email, "Your sign-in link", url),
    }),
    emailOTP({
      sendVerificationOTP: ({ email, otp }) =>
        sendLocalEmail(email, "Your verification code", otp),
    }),
  ],
});`;

export const supabaseMagicLinkSnippet = `const inbox = await inboxTap.createInbox({ alias: "supabase-auth" });

const { error } = await supabase.auth.signInWithOtp({
  email: inbox.address,
});

if (error) throw error;

const confirmationUrl = await inbox.waitForLink({
  contains: "/auth/v1/verify",
  timeoutMs: 20_000,
});`;

export const nodemailerFixtureSnippet = `import { startInboxTapFixture } from "inboxtap/fixtures";

const inboxTap = await startInboxTapFixture();

try {
  const inbox = await inboxTap.createInbox();

  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Account",
    text: "https://app.local.test/verify",
  });

  const email = await inbox.waitForMessage();
  expect(email.envelope.to).toContain(inbox.address);
} finally {
  await inboxTap.close();
}`;

export const magicLinkSnippet = `const rawUrl = await inbox.waitForLink({
  contains: "/auth/callback",
  timeoutMs: 20_000,
});

const url = new URL(rawUrl);
expect(url.origin).toBe(appOrigin);
expect(url.pathname).toBe("/auth/callback");

await page.goto(url.href);`;

export const otpResendSnippet = `const firstEmail = await inbox.waitForMessage({
  subject: /code/i,
  timeoutMs: 20_000,
});

await requestAnotherCode();

const secondEmail = await inbox.waitForMessage({
  subject: /code/i,
  afterId: firstEmail.id,
  timeoutMs: 20_000,
});

const secondCode = secondEmail.text.match(/\\b\\d{6}\\b/)?.[0];
expect(secondCode).toBeDefined();`;

export const passwordResetSnippet = `await requestPasswordReset(inbox.address);

const rawUrl = await inbox.waitForLink({
  contains: "/reset-password",
  timeoutMs: 20_000,
});

const resetUrl = new URL(rawUrl);
expect(resetUrl.origin).toBe(appOrigin);
expect(resetUrl.pathname).toBe("/reset-password");

await completePasswordReset(resetUrl.href, newPassword);
expect(await signIn(inbox.address, oldPassword)).toBe(false);
expect(await signIn(inbox.address, newPassword)).toBe(true);`;
