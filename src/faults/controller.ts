import { claimFault } from "./claim.js";
import type { FaultEntry, PauseEntry } from "./entries.js";
import { PauseGate } from "./pause-gate.js";
import {
  type ClaimedSmtpFault,
  SmtpFaultAbortedError,
  type SmtpFaultController,
  type SmtpFaultControllerRuntime,
} from "./types.js";
import {
  MAX_FAULT_APPLICATIONS,
  normalizeAddress,
  validateAfterBytes,
  validateDuration,
  validateFailureCode,
  validateFailureMessage,
  validateRecipient,
  validateTimes,
} from "./validation.js";

const DEFAULT_PAUSE_TIMEOUT_MS = 60_000;

export function createSmtpFaultControllerRuntime(): SmtpFaultControllerRuntime {
  const queue: FaultEntry[] = [];
  const active = new Set<FaultEntry>();

  const controller: SmtpFaultController = {
    failNext(options) {
      const times = validateTimes(options.times);
      const code = validateFailureCode(options.code);
      const message = validateFailureMessage(options.message);
      enqueueMany(times, options.to, () => ({
        abort: new AbortController(),
        code,
        message,
        type: "fail",
      }));
    },
    delayNext(options) {
      const times = validateTimes(options.times);
      const durationMs = validateDuration(options.durationMs, "durationMs");
      enqueueMany(times, options.to, () => ({
        abort: new AbortController(),
        durationMs,
        type: "delay",
      }));
    },
    disconnectNext(options) {
      const times = validateTimes(options.times);
      const afterBytes = validateAfterBytes(options.afterBytes);
      enqueueMany(times, options.to, () => ({
        abort: new AbortController(),
        afterBytes,
        type: "disconnect",
      }));
    },
    pauseNext(options = {}) {
      const timeoutMs = validateDuration(
        options.timeoutMs ?? DEFAULT_PAUSE_TIMEOUT_MS,
        "timeoutMs",
      );
      ensureCapacity(1);
      const to = validateRecipient(options.to);
      const gate = new PauseGate(timeoutMs);
      const entry: PauseEntry = {
        abort: new AbortController(),
        gate,
        to,
        type: "pause",
      };
      gate.attach({
        onExpire(error) {
          entry.abort.abort(error);
        },
        onPendingEnd() {
          removeQueued(entry);
        },
      });
      queue.push(entry);
      return gate;
    },
    reset() {
      reset("reset");
    },
  };

  function enqueueMany(
    times: number,
    recipient: string | undefined,
    create: () => FaultEntry,
  ): void {
    ensureCapacity(times);
    const entries = Array.from({ length: times }, create);
    const to = validateRecipient(recipient);
    for (const entry of entries) {
      entry.to = to;
      queue.push(entry);
    }
  }

  function ensureCapacity(additional: number): void {
    if (queue.length + active.size + additional > MAX_FAULT_APPLICATIONS) {
      throw new RangeError(`SMTP faults are limited to ${MAX_FAULT_APPLICATIONS} queued or active`);
    }
  }

  function removeQueued(entry: FaultEntry): void {
    const index = queue.indexOf(entry);
    if (index >= 0) queue.splice(index, 1);
  }

  function reset(reason: "reset" | "shutdown" = "reset"): void {
    const error = new SmtpFaultAbortedError(reason);
    for (const entry of [...queue, ...active]) {
      entry.abort.abort(error);
      if (entry.type === "pause") entry.gate.abort(error);
    }
    queue.length = 0;
    active.clear();
  }

  const runtime = {
    claim(recipients: readonly string[]): ClaimedSmtpFault | undefined {
      const normalized = new Set(recipients.map(normalizeAddress));
      const index = queue.findIndex((entry) => entry.to === undefined || normalized.has(entry.to));
      if (index < 0) return undefined;
      const [entry] = queue.splice(index, 1);
      if (!entry) return undefined;
      active.add(entry);
      return claimFault(entry, () => active.delete(entry));
    },
    reset,
    shutdown() {
      reset("shutdown");
    },
  };

  return { controller, runtime };
}
