import type { SMTPServer, SMTPServerSession } from "smtp-server";

export type SmtpDisconnectResult =
  | { status: "disconnected" }
  | { status: "connection-not-found" }
  | { status: "incompatible-socket" }
  | { status: "already-disconnected" }
  | { status: "disconnect-failed" };

interface SocketShape {
  destroyed: boolean;
  destroy: () => void;
}

const destroyAttempts = new WeakSet<object>();

export function disconnectSmtpSession(
  server: SMTPServer,
  session: SMTPServerSession,
): SmtpDisconnectResult {
  let matchedSession = false;

  for (const candidate of server.connections as Set<unknown>) {
    if (!isObject(candidate) || !hasMatchingSession(candidate, session)) continue;
    matchedSession = true;

    const socket = readSocket(candidate);
    if (!isSocket(socket)) continue;
    if (socket.destroyed || destroyAttempts.has(socket)) {
      return { status: "already-disconnected" };
    }

    destroyAttempts.add(socket);
    try {
      socket.destroy();
      return { status: "disconnected" };
    } catch {
      return { status: "disconnect-failed" };
    }
  }

  return { status: matchedSession ? "incompatible-socket" : "connection-not-found" };
}

function hasMatchingSession(
  connection: Record<PropertyKey, unknown>,
  session: SMTPServerSession,
): boolean {
  try {
    return connection.session === session;
  } catch {
    return false;
  }
}

function readSocket(connection: Record<PropertyKey, unknown>): unknown {
  try {
    return connection._socket;
  } catch {
    return undefined;
  }
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function isSocket(value: unknown): value is SocketShape & object {
  if (!isObject(value)) return false;
  try {
    return typeof value.destroyed === "boolean" && typeof value.destroy === "function";
  } catch {
    return false;
  }
}
