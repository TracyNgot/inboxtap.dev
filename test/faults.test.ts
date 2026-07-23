import { createServer as createNetServer } from "node:net";
import type { Server as NetServer } from "node:net";
import { afterEach, beforeEach, expect, test } from "bun:test";
import { InboxTapServer } from "../src/server.js";
import { sendSmtp, SmtpConnectionError, SmtpDeliveryError } from "./helpers/smtp.js";

const DEFAULT_RECIPIENT = "faults@example.test";
const ipv6 = await probeBind("::1", 0).then(closeProbe, () => false);

let server: InboxTapServer;

beforeEach(async () => {
  server = await new InboxTapServer({ apiPort: 0, smtpPort: 0 }).start();
});

afterEach(async () => {
  await server.stop();
});

test("returns a temporary 451 once and captures only the successful retry", async () => {
  server.faults.failNext({
    code: 451,
    message: "Temporary local failure",
    to: DEFAULT_RECIPIENT,
  });

  const error = await smtpFailure(deliver("Attempt 1"));
  expect(error.responseCode).toBe(451);
  expect(error.transcript).toContain("Temporary local failure");
  expect(subjects()).toEqual([]);

  await deliver("Attempt 2");
  expect(subjects()).toEqual(["Attempt 2"]);
});

test("returns a permanent 550 for the configured number of transactions", async () => {
  server.faults.failNext({ code: 550, times: 2 });

  expect((await smtpFailure(deliver("Rejected 1"))).responseCode).toBe(550);
  expect((await smtpFailure(deliver("Rejected 2"))).responseCode).toBe(550);
  expect(subjects()).toEqual([]);

  await deliver("Accepted");
  expect(subjects()).toEqual(["Accepted"]);
});

test("matches recipients case-insensitively and faults a whole multi-recipient transaction", async () => {
  server.faults.failNext({
    code: 451,
    to: "Target@Example.Test",
  });

  await deliver("Unmatched", { to: "other@example.test" });
  const error = await smtpFailure(
    deliver("Multi-recipient", {
      to: ["second@example.test", "TARGET@EXAMPLE.TEST"],
    }),
  );

  expect(error.responseCode).toBe(451);
  expect(subjects()).toEqual(["Unmatched"]);
  expect(server.store.list({ to: "second@example.test" })).toEqual([]);

  await deliver("Target retry", { to: "target@example.test" });
  expect(subjects("target@example.test")).toEqual(["Target retry"]);
});

test("applies at most one queued rule to each transaction", async () => {
  server.faults.failNext({ code: 451 });
  server.faults.delayNext({ durationMs: 150 });

  expect((await smtpFailure(deliver("Failed"))).responseCode).toBe(451);

  const dataStarted = deferred();
  const startedAt = performance.now();
  const delayed = deliver("Delayed", { onDataStart: dataStarted.resolve });
  await dataStarted.promise;
  await wait(40);
  expect(subjects()).toEqual([]);

  await delayed;
  expect(performance.now() - startedAt).toBeGreaterThanOrEqual(100);
  expect(subjects()).toEqual(["Delayed"]);
});

test("consumes concurrent fault applications exactly once", async () => {
  server.faults.failNext({ code: 451, times: 2 });

  const results = await Promise.allSettled([
    deliver("Concurrent 1"),
    deliver("Concurrent 2"),
    deliver("Concurrent 3"),
    deliver("Concurrent 4"),
  ]);
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  const successes = results.filter((result) => result.status === "fulfilled");

  expect(failures).toHaveLength(2);
  expect(successes).toHaveLength(2);
  expect(
    failures.map((result) => {
      expect(result.reason).toBeInstanceOf(SmtpDeliveryError);
      return (result.reason as SmtpDeliveryError).responseCode;
    }),
  ).toEqual([451, 451]);
  expect(subjects()).toHaveLength(2);

  await deliver("After concurrency");
  expect(subjects()).toHaveLength(3);
});

test("reset aborts an active delay without capturing and clears the queue", async () => {
  server.faults.delayNext({ durationMs: 5_000 });
  const dataStarted = deferred();
  const delivery = deliver("Reset delay", {
    onDataStart: dataStarted.resolve,
    timeoutMs: 2_000,
  });
  await dataStarted.promise;

  server.faults.reset();
  await expect(delivery).rejects.toBeInstanceOf(SmtpDeliveryError);
  expect(subjects()).toEqual([]);

  await deliver("After reset");
  expect(subjects()).toEqual(["After reset"]);
});

test("pause gates release independently and release is idempotent", async () => {
  const firstGate = server.faults.pauseNext({
    timeoutMs: 2_000,
    to: "first@example.test",
  });
  const secondGate = server.faults.pauseNext({
    timeoutMs: 2_000,
    to: "second@example.test",
  });
  const firstDelivery = deliver("First paused", { to: "first@example.test" });
  const secondDelivery = deliver("Second paused", { to: "second@example.test" });

  await Promise.all([firstGate.waitUntilPaused(), secondGate.waitUntilPaused()]);
  expect(firstGate.state).toBe("paused");
  expect(secondGate.state).toBe("paused");
  expect(subjects()).toEqual([]);

  firstGate.release();
  firstGate.release();
  await firstDelivery;
  expect(firstGate.state).toBe("released");
  expect(secondGate.state).toBe("paused");
  expect(subjects()).toEqual(["First paused"]);

  secondGate.release();
  await secondDelivery;
  expect(subjects().sort()).toEqual(["First paused", "Second paused"]);
});

test("an active pause expires with 451 and captures nothing", async () => {
  const gate = server.faults.pauseNext({ timeoutMs: 500 });
  const startedAt = performance.now();
  const delivery = deliver("Expired pause");

  await gate.waitUntilPaused();
  expect(gate.state).toBe("paused");
  expect(subjects()).toEqual([]);

  expect((await smtpFailure(delivery)).responseCode).toBe(451);
  expect(gate.state).toBe("expired");
  expect(performance.now() - startedAt).toBeGreaterThanOrEqual(350);
  expect(subjects()).toEqual([]);

  await deliver("After pause expiry");
  expect(subjects()).toEqual(["After pause expiry"]);
});

test("a pause that expires while queued does not affect a later transaction", async () => {
  const gate = server.faults.pauseNext({
    timeoutMs: 50,
    to: "later@example.test",
  });

  await expect(gate.waitUntilPaused()).rejects.toBeInstanceOf(Error);
  expect(gate.state).toBe("expired");

  await deliver("After queued expiry", { to: "later@example.test" });
  expect(subjects()).toEqual(["After queued expiry"]);
});

test("releasing a pending pause removes it before delivery", async () => {
  const gate = server.faults.pauseNext({ timeoutMs: 2_000 });
  const pauseError = rejection(gate.waitUntilPaused());

  gate.release();
  gate.release();

  expect(gate.state).toBe("released");
  expect(await pauseError).toHaveProperty("message", expect.stringContaining("released"));
  await deliver("Not paused");
  expect(subjects()).toEqual(["Not paused"]);
});

test("reset aborts an active pause and prevents partial capture", async () => {
  const gate = server.faults.pauseNext({ timeoutMs: 5_000 });
  const delivery = deliver("Reset pause");

  await gate.waitUntilPaused();
  server.faults.reset();

  expect(gate.state).toBe("aborted");
  await expect(delivery).rejects.toBeInstanceOf(SmtpDeliveryError);
  expect(subjects()).toEqual([]);

  await deliver("After pause reset");
  expect(subjects()).toEqual(["After pause reset"]);
});

test("shutdown aborts active and queued pause gates without leaking a connection", async () => {
  const activeGate = server.faults.pauseNext({
    timeoutMs: 5_000,
    to: "active@example.test",
  });
  const queuedGate = server.faults.pauseNext({
    timeoutMs: 5_000,
    to: "queued@example.test",
  });
  const queuedError = rejection(queuedGate.waitUntilPaused());
  const delivery = deliver("Shutdown pause", {
    timeoutMs: 2_000,
    to: "active@example.test",
  });

  await activeGate.waitUntilPaused();
  const stop = server.stop();

  await expect(delivery).rejects.toBeInstanceOf(SmtpDeliveryError);
  expect(await queuedError).toHaveProperty("message", expect.stringContaining("shutdown"));
  await stop;
  expect(activeGate.state).toBe("aborted");
  expect(queuedGate.state).toBe("aborted");
  expect(subjects()).toEqual([]);
});

test.each([
  ["before the first body chunk", 0],
  ["within the body", 32],
  ["past the end of the body", 1_000_000],
])("disconnects %s, captures nothing, and accepts the next connection", async (_, afterBytes) => {
  server.faults.disconnectNext({ afterBytes });

  const error = await connectionFailure(
    deliver("Interrupted", {
      body: "This body is deliberately long enough to cross a small stream threshold.",
    }),
  );
  expect(error).toBeInstanceOf(SmtpConnectionError);
  expect(subjects()).toEqual([]);

  await deliver("Recovered");
  expect(subjects()).toEqual(["Recovered"]);
});

test.if(ipv6)("shares one fault controller across IPv4 and IPv6 SMTP listeners", async () => {
  server.faults.failNext({ code: 451, times: 2 });

  expect(
    (
      await smtpFailure(
        deliver("IPv4 failure", {
          host: "127.0.0.1",
        }),
      )
    ).responseCode,
  ).toBe(451);
  expect(
    (
      await smtpFailure(
        deliver("IPv6 failure", {
          host: "::1",
        }),
      )
    ).responseCode,
  ).toBe(451);
  expect(subjects()).toEqual([]);

  await deliver("IPv6 recovery", { host: "::1" });
  expect(subjects()).toEqual(["IPv6 recovery"]);
});

test("message-size rejection takes precedence over an injected failure", async () => {
  await restartWithSmallMessageLimit();
  server.faults.failNext({ code: 451 });

  expect((await smtpFailure(deliverOversized("Oversized failure"))).responseCode).toBe(552);
  expect(subjects()).toEqual([]);

  await deliver("Failure consumed");
  expect(subjects()).toEqual(["Failure consumed"]);
});

test("message-size rejection takes precedence over an injected delay", async () => {
  await restartWithSmallMessageLimit();
  server.faults.delayNext({ durationMs: 5_000 });

  expect((await smtpFailure(deliverOversized("Oversized delay", 1_000))).responseCode).toBe(552);
  expect(subjects()).toEqual([]);

  await deliver("Delay consumed");
  expect(subjects()).toEqual(["Delay consumed"]);
});

test("message-size rejection aborts a claimed pause before it becomes observable", async () => {
  await restartWithSmallMessageLimit();
  const gate = server.faults.pauseNext({ timeoutMs: 2_000 });
  const pauseError = rejection(gate.waitUntilPaused());

  expect((await smtpFailure(deliverOversized("Oversized pause"))).responseCode).toBe(552);
  expect(await pauseError).toBeInstanceOf(Error);
  expect(gate.state).toBe("aborted");
  expect(subjects()).toEqual([]);

  await deliver("Pause consumed");
  expect(subjects()).toEqual(["Pause consumed"]);
});

test("disconnect remains a physical close for an oversized transaction", async () => {
  await restartWithSmallMessageLimit();
  server.faults.disconnectNext({ afterBytes: 1_000_000 });

  await connectionFailure(deliverOversized("Oversized disconnect"));
  expect(subjects()).toEqual([]);

  await deliver("Disconnect consumed");
  expect(subjects()).toEqual(["Disconnect consumed"]);
});

function deliver(
  subject: string,
  options: {
    body?: string;
    host?: string;
    onDataStart?: () => void;
    timeoutMs?: number;
    to?: string | string[];
  } = {},
): Promise<void> {
  return sendSmtp({
    host: options.host ?? server.smtpHost,
    onDataStart: options.onDataStart,
    port: server.smtpPort,
    raw: [`Subject: ${subject}`, "", options.body ?? "Body"].join("\r\n"),
    timeoutMs: options.timeoutMs,
    to: options.to ?? DEFAULT_RECIPIENT,
  });
}

function deliverOversized(subject: string, timeoutMs?: number): Promise<void> {
  return deliver(subject, { body: "x".repeat(1_024), timeoutMs });
}

function subjects(to?: string): string[] {
  return server.store.list(to ? { to } : {}).map((email) => email.subject);
}

async function smtpFailure(delivery: Promise<void>): Promise<SmtpDeliveryError> {
  const error = await rejection(delivery);
  expect(error).toBeInstanceOf(SmtpDeliveryError);
  return error as SmtpDeliveryError;
}

async function connectionFailure(delivery: Promise<void>): Promise<SmtpConnectionError> {
  const error = await rejection(delivery);
  expect(error).toBeInstanceOf(SmtpConnectionError);
  expect(error).not.toHaveProperty("responseCode");
  return error as SmtpConnectionError;
}

async function rejection(delivery: Promise<unknown>): Promise<unknown> {
  return delivery.then(
    () => {
      throw new Error("Expected SMTP delivery to fail");
    },
    (error: unknown) => error,
  );
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve = (): void => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function restartWithSmallMessageLimit(): Promise<void> {
  await server.stop();
  server = await new InboxTapServer({
    apiPort: 0,
    maxMessageSize: 128,
    smtpPort: 0,
  }).start();
}

function probeBind(host: string, port: number): Promise<NetServer> {
  return new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once("error", reject);
    probe.listen(port, host, () => resolve(probe));
  });
}

function closeProbe(probe: NetServer): Promise<true> {
  return new Promise((resolve) => {
    probe.close(() => resolve(true));
  });
}
