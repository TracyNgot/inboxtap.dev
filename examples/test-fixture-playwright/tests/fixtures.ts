import { test as base } from "@playwright/test";
import { extendInboxTap } from "inboxtap/fixtures/playwright";
import nodemailer from "nodemailer";

interface TestApplication {
  sendWelcome(to: string): Promise<void>;
  smtpPort: number;
}

interface ApplicationWorkerFixtures {
  app: TestApplication;
}

const withInboxTap = extendInboxTap(base);

export const test = withInboxTap.extend<object, ApplicationWorkerFixtures>({
  app: [
    async ({ inboxTap }, use) => {
      const transport = nodemailer.createTransport(inboxTap.smtp);
      await transport.verify();

      try {
        await use({
          smtpPort: inboxTap.smtp.port,
          async sendWelcome(to) {
            await transport.sendMail({
              from: "app@local.test",
              to,
              subject: "Welcome from the worker fixture",
              text: "Your account is ready.",
            });
          },
        });
      } finally {
        transport.close();
      }
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";
