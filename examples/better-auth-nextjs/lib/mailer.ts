import { createTransport } from "nodemailer";

const transport = createTransport({
  host: process.env.SMTP_HOST ?? "127.0.0.1",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  ignoreTLS: true,
});

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? "auth@example.test",
    ...options,
  });
}
