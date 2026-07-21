import { createTransport } from "nodemailer";

export interface MailerOptions {
  host: string;
  port: number;
  from?: string;
}

export interface Mailer {
  sendWelcomeEmail(to: string, verifyUrl: string): Promise<void>;
  sendInviteEmail(to: string, token: string): Promise<void>;
  sendOtpEmail(to: string, code: string): Promise<void>;
}

export function createMailer(options: MailerOptions): Mailer {
  const from = options.from ?? "Acme <no-reply@example.test>";
  const transport = createTransport({
    host: options.host,
    port: options.port,
    secure: false,
    ignoreTLS: true,
  });

  return {
    async sendWelcomeEmail(to, verifyUrl) {
      await transport.sendMail({
        from,
        to,
        subject: "Welcome to Acme",
        text: `Welcome to Acme! Confirm your address: ${verifyUrl}`,
        html: `<p>Welcome to Acme!</p><p><a href="${verifyUrl}">Verify your email</a></p>`,
      });
    },
    async sendInviteEmail(to, token) {
      await transport.sendMail({
        from,
        to,
        subject: "You have been invited to Acme",
        text: `You have been invited to join Acme. Your invite token: ${token}`,
      });
    },
    async sendOtpEmail(to, code) {
      await transport.sendMail({
        from,
        to,
        subject: "Your Acme sign-in code",
        text: `Your code is ${code}`,
      });
    },
  };
}
