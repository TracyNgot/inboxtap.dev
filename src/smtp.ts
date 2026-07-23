import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { SMTPServer } from "smtp-server";
import {
  type ClaimedSmtpDisconnect,
  type ClaimedSmtpFault,
  SmtpFaultAbortedError,
  type SmtpFaultRuntime,
} from "./faults/index.js";
import { parseIncomingEmail } from "./parser.js";
import { disconnectSmtpSession } from "./smtp-disconnect.js";
import type { CapturedEmail, EmailEnvelope } from "./types.js";

export interface SmtpCaptureOptions {
  faults: SmtpFaultRuntime;
  maxMessageSize: number;
  onEmail: (email: CapturedEmail) => void | Promise<void>;
}

interface ActiveTransaction {
  closed: boolean;
  fault: ClaimedSmtpFault | undefined;
  stream: SMTPServerDataStream;
}

export function createSmtpServer(options: SmtpCaptureOptions): SMTPServer {
  const active = new WeakMap<SMTPServerSession, ActiveTransaction>();
  let server: SMTPServer;

  server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["AUTH", "STARTTLS"],
    size: options.maxMessageSize,
    onClose(session) {
      const transaction = active.get(session);
      if (!transaction) return;
      transaction.closed = true;
      transaction.fault?.abort("client");
      if (!transaction.stream.destroyed && !transaction.stream.readableEnded) {
        if (transaction.fault?.type === "disconnect") transaction.stream.destroy();
        else transaction.stream.destroy(new Error("SMTP client disconnected during DATA"));
      }
      active.delete(session);
    },
    onData(stream, session, callback) {
      const envelope = envelopeFrom(session);
      const transaction: ActiveTransaction = {
        closed: false,
        fault: options.faults.claim(envelope.to),
        stream,
      };
      active.set(session, transaction);
      let finished = false;
      const finish = (error?: Error): void => {
        if (finished) return;
        finished = true;
        transaction.fault?.complete();
        if (active.get(session) === transaction) active.delete(session);
        if (!transaction.closed) {
          if (error) callback(error);
          else callback(null, "Message captured");
        }
      };

      if (transaction.fault?.type === "disconnect") {
        handleDisconnect(stream, session, server, transaction, transaction.fault, finish);
        return;
      }

      void handleData(stream, envelope, transaction, options).then(
        () => finish(),
        (error: unknown) => finish(toSmtpError(error)),
      );
    },
  });

  return server;
}

async function handleData(
  stream: SMTPServerDataStream,
  envelope: EmailEnvelope,
  transaction: ActiveTransaction,
  options: SmtpCaptureOptions,
): Promise<void> {
  const fault = transaction.fault;
  if (fault?.type === "fail") {
    await drainStream(stream);
    rejectOversized(stream, undefined, options.maxMessageSize, fault);
    throwIfAborted(fault);
    throw withResponseCode(fault.message, fault.code);
  }

  let email: CapturedEmail;
  try {
    email = await parseIncomingEmail(stream, envelope);
    rejectOversized(stream, email, options.maxMessageSize, fault);
    if (fault?.type === "delay" || fault?.type === "pause") await fault.wait();
    throwIfAborted(fault);
    if (transaction.closed) throw new Error("SMTP client disconnected during DATA");
    await options.onEmail(email);
  } catch (error) {
    if (fault && !(error instanceof SmtpFaultAbortedError)) fault.abort("transaction");
    throw error;
  }
}

function handleDisconnect(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
  server: SMTPServer,
  transaction: ActiveTransaction,
  fault: ClaimedSmtpDisconnect,
  finish: (error?: Error) => void,
): void {
  let bytes = 0;
  let ended = false;
  let attempted = false;
  let fallbackError: Error | undefined;

  const cleanup = (): void => {
    stream.off("data", onData);
    stream.off("end", onEnd);
    stream.off("error", onError);
    fault.signal.removeEventListener("abort", onAbort);
  };
  const failSafely = (error: Error): void => {
    fallbackError = error;
    if (ended) {
      cleanup();
      finish(error);
    }
  };
  const attemptDisconnect = (): void => {
    if (attempted || fallbackError || transaction.closed || fault.signal.aborted) return;
    attempted = true;
    const result = disconnectSmtpSession(server, session);
    if (result.status === "disconnected" || result.status === "already-disconnected") {
      cleanup();
      fault.complete();
      return;
    }
    failSafely(withResponseCode("Unable to inject the SMTP disconnect", 451));
  };
  const onAbort = (): void => {
    if (transaction.closed) {
      cleanup();
      fault.complete();
      return;
    }
    failSafely(abortedFaultToSmtpError(fault.signal.reason));
  };
  const onData = (chunk: Buffer | string): void => {
    bytes += Buffer.byteLength(chunk);
    if (bytes >= fault.afterBytes) attemptDisconnect();
  };
  const onEnd = (): void => {
    ended = true;
    if (fallbackError) {
      cleanup();
      finish(fallbackError);
      return;
    }
    attemptDisconnect();
  };
  const onError = (error: Error): void => {
    cleanup();
    if (!transaction.closed) finish(error);
  };

  stream.on("data", onData);
  stream.once("end", onEnd);
  stream.once("error", onError);
  fault.signal.addEventListener("abort", onAbort, { once: true });
  if (fault.afterBytes === 0) attemptDisconnect();
}

function rejectOversized(
  stream: SMTPServerDataStream,
  email: CapturedEmail | undefined,
  maxMessageSize: number,
  fault: ClaimedSmtpFault | undefined,
): void {
  if (!stream.sizeExceeded && (!email || Buffer.byteLength(email.raw) <= maxMessageSize)) return;
  fault?.abort("transaction");
  throw withResponseCode("Message exceeds the configured size limit", 552);
}

function throwIfAborted(fault: ClaimedSmtpFault | undefined): void {
  if (fault?.signal.aborted) throw fault.signal.reason;
}

function drainStream(stream: SMTPServerDataStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.once("end", resolve);
    stream.once("error", reject);
    stream.resume();
  });
}

function envelopeFrom(session: SMTPServerSession): EmailEnvelope {
  return {
    from: session.envelope.mailFrom ? session.envelope.mailFrom.address : null,
    to: session.envelope.rcptTo.map((recipient) => recipient.address),
  };
}

function toSmtpError(error: unknown): Error {
  if (error instanceof SmtpFaultAbortedError) return abortedFaultToSmtpError(error);
  if (error instanceof Error) return error;
  return withResponseCode("Unable to parse the email message", 554);
}

function abortedFaultToSmtpError(error: unknown): Error {
  if (!(error instanceof SmtpFaultAbortedError)) {
    return withResponseCode("Injected SMTP fault was interrupted", 451);
  }
  if (error.reason === "shutdown") {
    return withResponseCode("InboxTap is shutting down", 421);
  }
  if (error.reason === "timeout") {
    return withResponseCode("Injected SMTP pause expired", 451);
  }
  return withResponseCode("Injected SMTP fault was reset", 451);
}

function withResponseCode(message: string, responseCode: number): Error & { responseCode: number } {
  const error = new Error(message) as Error & { responseCode: number };
  error.responseCode = responseCode;
  return error;
}
