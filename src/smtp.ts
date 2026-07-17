import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { SMTPServer } from "smtp-server";
import { parseIncomingEmail } from "./parser.js";
import type { CapturedEmail, EmailEnvelope } from "./types.js";

export interface SmtpCaptureOptions {
  maxMessageSize: number;
  onEmail: (email: CapturedEmail) => void | Promise<void>;
}

export function createSmtpServer(options: SmtpCaptureOptions): SMTPServer {
  return new SMTPServer({
    authOptional: true,
    disabledCommands: ["AUTH", "STARTTLS"],
    size: options.maxMessageSize,
    onData(stream, session, callback) {
      void handleData(stream, session, options)
        .then(() => callback(null, "Message captured"))
        .catch((error: unknown) => callback(toSmtpError(error)));
    },
  });
}

async function handleData(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
  options: SmtpCaptureOptions,
): Promise<void> {
  const email = await parseIncomingEmail(stream, envelopeFrom(session));
  if (stream.sizeExceeded || Buffer.byteLength(email.raw) > options.maxMessageSize) {
    throw withResponseCode("Message exceeds the configured size limit", 552);
  }
  await options.onEmail(email);
}

function envelopeFrom(session: SMTPServerSession): EmailEnvelope {
  return {
    from: session.envelope.mailFrom ? session.envelope.mailFrom.address : null,
    to: session.envelope.rcptTo.map((recipient) => recipient.address),
  };
}

function toSmtpError(error: unknown): Error {
  if (error instanceof Error) return error;
  return withResponseCode("Unable to parse the email message", 554);
}

function withResponseCode(message: string, responseCode: number): Error & { responseCode: number } {
  const error = new Error(message) as Error & { responseCode: number };
  error.responseCode = responseCode;
  return error;
}
