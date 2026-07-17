import { createConnection } from "node:net";

export interface SendSmtpOptions {
  host: string;
  port: number;
  to: string | string[];
  raw: string;
}

export function sendSmtp(options: SendSmtpOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    let sent = false;
    let settled = false;
    let transcript = "";
    const timeout = setTimeout(
      () => finish(new Error(`SMTP delivery timed out: ${transcript}`)),
      2_000,
    );

    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setEncoding("utf8");
    socket.once("error", finish);
    socket.on("data", (chunk) => {
      transcript += chunk;
      if (!sent && transcript.includes("220")) {
        sent = true;
        const recipientCommands = recipients.map((address) => `RCPT TO:<${address}>`).join("\r\n");
        socket.write(
          `EHLO test.example\r\nMAIL FROM:<test@example.test>\r\n${recipientCommands}\r\nDATA\r\n${dotStuff(options.raw)}\r\n.\r\nQUIT\r\n`,
        );
      }
      if (/\r\n[45]\d\d /.test(transcript))
        finish(new Error(`SMTP delivery failed: ${transcript}`));
      else if (transcript.includes("221")) finish();
    });
  });
}

function dotStuff(value: string): string {
  return value.replace(/(^|\r\n)\./g, "$1..");
}
