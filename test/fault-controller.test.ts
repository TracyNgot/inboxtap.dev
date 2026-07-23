import { expect, test } from "bun:test";
import type {
  ClaimedSmtpDelay,
  ClaimedSmtpDisconnect,
  ClaimedSmtpFailure,
  ClaimedSmtpPause,
  SmtpFaultControllerRuntime,
} from "../src/faults/index.js";
import { createSmtpFaultControllerRuntime, SmtpFaultAbortedError } from "../src/faults/index.js";

test("validates every public fault option before queuing a rule", () => {
  const { controller, runtime } = createSmtpFaultControllerRuntime();

  for (const code of [399, 600, 451.5, Number.NaN]) {
    expect(() => controller.failNext({ code })).toThrow(
      "SMTP failure code must be an integer from 400 to 599",
    );
  }
  for (const message of ["bad\rmessage", "bad\nmessage"]) {
    expect(() => controller.failNext({ code: 451, message })).toThrow(
      "SMTP failure message must be a string without CR or LF",
    );
  }
  for (const durationMs of [-1, 60_001, 1.5]) {
    expect(() => controller.delayNext({ durationMs })).toThrow(
      "durationMs must be an integer from 0 to 60000",
    );
  }
  for (const timeoutMs of [-1, 60_001, 1.5]) {
    expect(() => controller.pauseNext({ timeoutMs })).toThrow(
      "timeoutMs must be an integer from 0 to 60000",
    );
  }
  for (const afterBytes of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    expect(() => controller.disconnectNext({ afterBytes })).toThrow(
      "afterBytes must be a non-negative safe integer",
    );
  }
  for (const times of [0, 101, 1.5]) {
    expect(() => controller.failNext({ code: 451, times })).toThrow(
      "times must be an integer from 1 to 100",
    );
  }
  expect(() => controller.failNext({ code: 451, to: "  " })).toThrow(
    "SMTP fault recipient must be a non-empty string",
  );

  expect(runtime.claim(["person@example.test"])).toBeUndefined();
});

test("expands times into FIFO entries with stable failure defaults", () => {
  const fixture = createSmtpFaultControllerRuntime();
  fixture.controller.failNext({ code: 451, times: 2 });

  const first = claimFailure(fixture);
  const second = claimFailure(fixture);
  expect(first).not.toBe(second);
  expect(first.code).toBe(451);
  expect(first.message).toBe("Injected SMTP failure");
  expect(second.code).toBe(451);
  expect(fixture.runtime.claim(["person@example.test"])).toBeUndefined();

  first.complete();
  first.complete();
  second.complete();
});

test("matches any envelope recipient case-insensitively in rule order", () => {
  const fixture = createSmtpFaultControllerRuntime();
  fixture.controller.failNext({ code: 451, message: "first", to: " First@Example.Test " });
  fixture.controller.disconnectNext({ afterBytes: 42, to: "second@example.test" });
  fixture.controller.delayNext({ durationMs: 0 });

  const first = fixture.runtime.claim(["SECOND@EXAMPLE.TEST", "first@example.test"]);
  expect(first?.type).toBe("fail");
  expect((first as ClaimedSmtpFailure).message).toBe("first");
  first?.complete();

  const unmatched = fixture.runtime.claim(["other@example.test"]);
  expect(unmatched?.type).toBe("delay");
  unmatched?.complete();

  const second = fixture.runtime.claim(["SECOND@example.test"]);
  expect(second?.type).toBe("disconnect");
  expect((second as ClaimedSmtpDisconnect).afterBytes).toBe(42);
  second?.complete();
});

test("counts queued and claimed applications against the bounded capacity", () => {
  const fixture = createSmtpFaultControllerRuntime();
  fixture.controller.failNext({ code: 451, times: 100 });
  const active = claimFailure(fixture);

  expect(() => fixture.controller.delayNext({ durationMs: 0 })).toThrow(
    "SMTP faults are limited to 100 queued or active",
  );
  active.complete();
  fixture.controller.delayNext({ durationMs: 0 });
  fixture.controller.reset();

  fixture.controller.disconnectNext({ afterBytes: 0, times: 100 });
  expect(() => fixture.controller.pauseNext()).toThrow(
    "SMTP faults are limited to 100 queued or active",
  );
  fixture.controller.reset();
  expect(() => fixture.controller.pauseNext()).not.toThrow();
  fixture.controller.reset();
});

test("delays for the full duration from wait and memoizes the wait", async () => {
  const fixture = createSmtpFaultControllerRuntime();
  fixture.controller.delayNext({ durationMs: 25 });
  const fault = claimDelay(fixture);

  await Bun.sleep(15);
  const startedAt = performance.now();
  const firstWait = fault.wait();
  expect(fault.wait()).toBe(firstWait);
  await firstWait;
  expect(performance.now() - startedAt).toBeGreaterThanOrEqual(20);
  fault.complete();
});

test("aborts active faults with observable client and transaction reasons", async () => {
  const clientFixture = createSmtpFaultControllerRuntime();
  clientFixture.controller.delayNext({ durationMs: 60_000 });
  const delayed = claimDelay(clientFixture);
  const delayedWait = delayed.wait();
  delayed.abort("client");
  delayed.abort("transaction");

  await expect(delayedWait).rejects.toMatchObject({
    name: "SmtpFaultAbortedError",
    reason: "client",
  });
  expect(delayed.signal.aborted).toBe(true);
  expect(delayed.abortReason).toBe("client");

  clientFixture.controller.failNext({ code: 451, times: 100 });
  clientFixture.runtime.reset();

  const transactionFixture = createSmtpFaultControllerRuntime();
  transactionFixture.controller.disconnectNext({ afterBytes: 1 });
  const disconnected = claimDisconnect(transactionFixture);
  disconnected.abort("transaction");
  expect(disconnected.abortReason).toBe("transaction");
  expect(disconnected.signal.reason).toBeInstanceOf(SmtpFaultAbortedError);
});

test("reset and shutdown abort active waits with distinct reasons and free capacity", async () => {
  const resetFixture = createSmtpFaultControllerRuntime();
  resetFixture.controller.delayNext({ durationMs: 60_000 });
  const resetFault = claimDelay(resetFixture);
  const resetWait = resetFault.wait();
  resetFixture.controller.reset();
  await expect(resetWait).rejects.toMatchObject({ reason: "reset" });
  expect(resetFault.abortReason).toBe("reset");
  expect(() => resetFixture.controller.failNext({ code: 451, times: 100 })).not.toThrow();
  resetFixture.controller.reset();

  const shutdownFixture = createSmtpFaultControllerRuntime();
  shutdownFixture.controller.delayNext({ durationMs: 60_000 });
  const shutdownFault = claimDelay(shutdownFixture);
  const shutdownWait = shutdownFault.wait();
  shutdownFixture.runtime.shutdown();
  await expect(shutdownWait).rejects.toMatchObject({ reason: "shutdown" });
  expect(shutdownFault.abortReason).toBe("shutdown");
});

test("releasing a pending gate cancels its queued rule idempotently", async () => {
  const fixture = createSmtpFaultControllerRuntime();
  const gate = fixture.controller.pauseNext({ timeoutMs: 50 });
  const paused = gate.waitUntilPaused();

  gate.release();
  gate.release();

  expect(gate.state).toBe("released");
  await expect(paused).rejects.toThrow("released before reaching a transaction");
  expect(fixture.runtime.claim(["person@example.test"])).toBeUndefined();
  await Bun.sleep(60);
  expect(gate.state).toBe("released");
});

test("a claimed pause becomes observable only when its hold starts", async () => {
  const fixture = createSmtpFaultControllerRuntime();
  const gate = fixture.controller.pauseNext({ timeoutMs: 500 });
  const paused = gate.waitUntilPaused();
  const fault = claimPause(fixture);

  expect(gate.state).toBe("pending");
  const hold = fault.wait();
  await paused;
  expect(gate.state).toBe("paused");

  gate.release();
  gate.release();
  await hold;
  expect(gate.state).toBe("released");
  await expect(gate.waitUntilPaused()).resolves.toBeUndefined();
  fault.complete();
});

test("release after a claim but before its hold skips the pause", async () => {
  const fixture = createSmtpFaultControllerRuntime();
  const gate = fixture.controller.pauseNext({ timeoutMs: 500 });
  const fault = claimPause(fixture);

  gate.release();
  expect(gate.state).toBe("released");
  await expect(fault.wait()).resolves.toBeUndefined();
  await expect(gate.waitUntilPaused()).rejects.toThrow("released before reaching a transaction");
  fault.complete();
});

test("an absolute pause timeout expires queued and claimed rules without capture", async () => {
  const queuedFixture = createSmtpFaultControllerRuntime();
  const queuedGate = queuedFixture.controller.pauseNext({ timeoutMs: 10 });
  const queuedPaused = queuedGate.waitUntilPaused();

  await expect(queuedPaused).rejects.toMatchObject({ reason: "timeout" });
  expect(queuedGate.state).toBe("expired");
  expect(queuedFixture.runtime.claim(["person@example.test"])).toBeUndefined();

  const claimedFixture = createSmtpFaultControllerRuntime();
  const claimedGate = claimedFixture.controller.pauseNext({ timeoutMs: 40 });
  await Bun.sleep(15);
  const claimed = claimPause(claimedFixture);
  const paused = claimedGate.waitUntilPaused();
  const hold = claimed.wait();

  await paused;
  await expect(hold).rejects.toMatchObject({ reason: "timeout" });
  expect(claimedGate.state).toBe("expired");
  expect(claimed.abortReason).toBe("timeout");
  claimed.complete();
});

test("reset and shutdown abort pause gates and clear their absolute timers", async () => {
  const pendingFixture = createSmtpFaultControllerRuntime();
  const pendingGate = pendingFixture.controller.pauseNext({ timeoutMs: 30 });
  const pendingPaused = pendingGate.waitUntilPaused();
  pendingFixture.controller.reset();

  await expect(pendingPaused).rejects.toMatchObject({ reason: "reset" });
  expect(pendingGate.state).toBe("aborted");
  await Bun.sleep(40);
  expect(pendingGate.state).toBe("aborted");

  const activeFixture = createSmtpFaultControllerRuntime();
  const activeGate = activeFixture.controller.pauseNext({ timeoutMs: 500 });
  const activeFault = claimPause(activeFixture);
  const hold = activeFault.wait();
  await activeGate.waitUntilPaused();
  activeFixture.runtime.shutdown();

  await expect(hold).rejects.toMatchObject({ reason: "shutdown" });
  expect(activeGate.state).toBe("aborted");
  expect(activeFault.abortReason).toBe("shutdown");
});

test("transaction abort before and after a pause starts rejects the right observers", async () => {
  const beforeFixture = createSmtpFaultControllerRuntime();
  const beforeGate = beforeFixture.controller.pauseNext({ timeoutMs: 500 });
  const beforePaused = beforeGate.waitUntilPaused();
  const beforeFault = claimPause(beforeFixture);
  beforeFault.abort("transaction");

  await expect(beforePaused).rejects.toMatchObject({ reason: "transaction" });
  await expect(beforeFault.wait()).rejects.toMatchObject({ reason: "transaction" });
  expect(beforeGate.state).toBe("aborted");

  const afterFixture = createSmtpFaultControllerRuntime();
  const afterGate = afterFixture.controller.pauseNext({ timeoutMs: 500 });
  const afterFault = claimPause(afterFixture);
  const afterHold = afterFault.wait();
  await afterGate.waitUntilPaused();
  afterFault.abort("client");

  await expect(afterHold).rejects.toMatchObject({ reason: "client" });
  await expect(afterGate.waitUntilPaused()).resolves.toBeUndefined();
  expect(afterGate.state).toBe("aborted");
});

function claimFailure(fixture: SmtpFaultControllerRuntime): ClaimedSmtpFailure {
  const fault = fixture.runtime.claim(["person@example.test"]);
  if (fault?.type !== "fail") throw new Error("Expected a claimed SMTP failure");
  return fault;
}

function claimDelay(fixture: SmtpFaultControllerRuntime): ClaimedSmtpDelay {
  const fault = fixture.runtime.claim(["person@example.test"]);
  if (fault?.type !== "delay") throw new Error("Expected a claimed SMTP delay");
  return fault;
}

function claimDisconnect(fixture: SmtpFaultControllerRuntime): ClaimedSmtpDisconnect {
  const fault = fixture.runtime.claim(["person@example.test"]);
  if (fault?.type !== "disconnect") throw new Error("Expected a claimed SMTP disconnect");
  return fault;
}

function claimPause(fixture: SmtpFaultControllerRuntime): ClaimedSmtpPause {
  const fault = fixture.runtime.claim(["person@example.test"]);
  if (fault?.type !== "pause") throw new Error("Expected a claimed SMTP pause");
  return fault;
}
