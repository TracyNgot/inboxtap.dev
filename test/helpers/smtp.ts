import { createConnection } from "node:net";

export interface SendSmtpOptions {
  host: string;
  onDataStart?: () => void;
  port: number;
  to: string | string[];
  raw: string;
  timeoutMs?: number;
}

export class SmtpDeliveryError extends Error {
  readonly responseCode: number;
  readonly transcript: string;

  constructor(responseCode: number, transcript: string) {
    super(`SMTP delivery failed with ${responseCode}: ${transcript}`);
    this.name = "SmtpDeliveryError";
    this.responseCode = responseCode;
    this.transcript = transcript;
  }
}

export class SmtpConnectionError extends Error {
  readonly transcript: string;

  constructor(message: string, transcript: string, options?: ErrorOptions) {
    super(`SMTP delivery failed: ${message}: ${transcript}`, options);
    this.name = "SmtpConnectionError";
    this.transcript = transcript;
  }
}

export function sendSmtp(options: SendSmtpOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    let stage: "greeting" | "ehlo" | "mail" | "recipient" | "data" | "body" | "quit" = "greeting";
    let recipientIndex = 0;
    let settled = false;
    let transcript = "";
    let responseBuffer = "";
    const timeout = setTimeout(
      () => finish(new SmtpConnectionError("timed out", transcript)),
      options.timeoutMs ?? 2_000,
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
    socket.once("error", (error) => {
      finish(new SmtpConnectionError(error.message, transcript, { cause: error }));
    });
    socket.once("close", () => {
      finish(new SmtpConnectionError("connection closed before completion", transcript));
    });
    socket.on("data", (chunk) => {
      transcript += chunk;
      responseBuffer += chunk;
      while (true) {
        const lineEnd = responseBuffer.indexOf("\r\n");
        if (lineEnd < 0) break;
        const line = responseBuffer.slice(0, lineEnd);
        responseBuffer = responseBuffer.slice(lineEnd + 2);
        const response = /^(\d{3})([- ])(.*)$/u.exec(line);
        if (!response || response[2] === "-") continue;
        const responseCode = Number(response[1]);
        if (responseCode >= 400) {
          finish(new SmtpDeliveryError(responseCode, transcript));
          return;
        }
        try {
          advance(responseCode);
        } catch (error) {
          finish(error instanceof Error ? error : new Error(String(error)));
          return;
        }
      }
    });

    function advance(responseCode: number): void {
      if (stage === "greeting" && responseCode === 220) {
        stage = "ehlo";
        socket.write("EHLO test.example\r\n");
        return;
      }
      if (stage === "ehlo" && responseCode === 250) {
        stage = "mail";
        socket.write("MAIL FROM:<test@example.test>\r\n");
        return;
      }
      if (stage === "mail" && responseCode === 250) {
        stage = "recipient";
        socket.write(`RCPT TO:<${recipients[recipientIndex]}>\r\n`);
        return;
      }
      if (stage === "recipient" && responseCode === 250) {
        recipientIndex += 1;
        const recipient = recipients[recipientIndex];
        if (recipient) socket.write(`RCPT TO:<${recipient}>\r\n`);
        else {
          stage = "data";
          socket.write("DATA\r\n");
        }
        return;
      }
      if (stage === "data" && responseCode === 354) {
        stage = "body";
        options.onDataStart?.();
        socket.write(`${dotStuff(options.raw)}\r\n.\r\n`);
        return;
      }
      if (stage === "body" && responseCode === 250) {
        stage = "quit";
        socket.write("QUIT\r\n");
        return;
      }
      if (stage === "quit" && responseCode === 221) {
        finish();
        return;
      }
      throw new SmtpConnectionError(
        `unexpected ${responseCode} response during ${stage}`,
        transcript,
      );
    }
  });
}

function dotStuff(value: string): string {
  return value.replace(/(^|\r\n)\./g, "$1..");
}
