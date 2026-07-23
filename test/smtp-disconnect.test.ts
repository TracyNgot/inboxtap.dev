import { expect, test } from "bun:test";
import type { SMTPServer, SMTPServerSession } from "smtp-server";
import { disconnectSmtpSession } from "../src/smtp-disconnect.js";

test("matches a connection by session identity only", () => {
  const session = fakeSession();
  const lookalike = { ...session };
  const wrongSocket = fakeSocket();
  const matchingSocket = fakeSocket();
  const server = fakeServer([
    { session: lookalike, _socket: wrongSocket },
    { session, _socket: matchingSocket },
  ]);

  expect(disconnectSmtpSession(server, session)).toEqual({ status: "disconnected" });
  expect(wrongSocket.destroyCalls).toBe(0);
  expect(matchingSocket.destroyCalls).toBe(1);
});

test("returns safe failures for missing connections and incompatible sockets", () => {
  const session = fakeSession();

  expect(disconnectSmtpSession(fakeServer([]), session)).toEqual({
    status: "connection-not-found",
  });

  for (const socket of [
    undefined,
    null,
    {},
    { destroyed: false },
    { destroy: () => undefined },
    { destroyed: "no", destroy: () => undefined },
  ]) {
    expect(disconnectSmtpSession(fakeServer([{ session, _socket: socket }]), session)).toEqual({
      status: "incompatible-socket",
    });
  }
});

test("does not destroy an already destroyed socket", () => {
  const session = fakeSession();
  const socket = fakeSocket(true);

  expect(disconnectSmtpSession(fakeServer([{ session, _socket: socket }]), session)).toEqual({
    status: "already-disconnected",
  });
  expect(socket.destroyCalls).toBe(0);
});

test("destroys a socket at most once", () => {
  const session = fakeSession();
  const socket = fakeSocket();
  const server = fakeServer([{ session, _socket: socket }]);

  expect(disconnectSmtpSession(server, session)).toEqual({ status: "disconnected" });
  expect(disconnectSmtpSession(server, session)).toEqual({ status: "already-disconnected" });
  expect(socket.destroyCalls).toBe(1);
});

interface FakeSocket {
  destroyed: boolean;
  destroyCalls: number;
  destroy: () => void;
}

function fakeSocket(destroyed = false): FakeSocket {
  const socket: FakeSocket = {
    destroyed,
    destroyCalls: 0,
    destroy() {
      socket.destroyCalls += 1;
    },
  };
  return socket;
}

function fakeSession(): SMTPServerSession {
  return { id: "session" } as SMTPServerSession;
}

function fakeServer(connections: unknown[]): SMTPServer {
  return { connections: new Set(connections) } as SMTPServer;
}
