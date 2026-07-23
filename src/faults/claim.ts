import type { FaultEntry } from "./entries.js";
import {
  type ClaimedSmtpFault,
  SmtpFaultAbortedError,
  type SmtpFaultAbortReason,
  type SmtpFaultInterruptionReason,
} from "./types.js";

export function claimFault(entry: FaultEntry, onComplete: () => void): ClaimedSmtpFault {
  let completed = false;
  let cancelWait: (() => void) | undefined;
  const complete = (): void => {
    if (completed) return;
    completed = true;
    cancelWait?.();
    if (entry.type === "pause") entry.gate.finish();
    onComplete();
  };
  const abort = (reason: SmtpFaultInterruptionReason): void => {
    if (completed) return;
    const error = new SmtpFaultAbortedError(reason);
    entry.abort.abort(error);
    if (entry.type === "pause") entry.gate.abort(error);
    complete();
  };
  const abortReason = (): SmtpFaultAbortReason | undefined => {
    const reason = entry.abort.signal.reason;
    return reason instanceof SmtpFaultAbortedError ? reason.reason : undefined;
  };

  if (entry.type === "fail") {
    return {
      get abortReason() {
        return abortReason();
      },
      abort,
      code: entry.code,
      complete,
      message: entry.message,
      signal: entry.abort.signal,
      type: "fail",
    };
  }
  if (entry.type === "disconnect") {
    return {
      get abortReason() {
        return abortReason();
      },
      abort,
      afterBytes: entry.afterBytes,
      complete,
      signal: entry.abort.signal,
      type: "disconnect",
    };
  }
  if (entry.type === "pause") {
    let waitPromise: Promise<void> | undefined;
    return {
      get abortReason() {
        return abortReason();
      },
      abort,
      complete,
      gate: entry.gate,
      signal: entry.abort.signal,
      type: "pause",
      wait() {
        waitPromise ??= entry.gate.hold();
        return waitPromise;
      },
    };
  }

  let waitPromise: Promise<void> | undefined;
  return {
    get abortReason() {
      return abortReason();
    },
    abort,
    complete,
    durationMs: entry.durationMs,
    signal: entry.abort.signal,
    type: "delay",
    wait() {
      if (!waitPromise) {
        const wait = abortableDelay(entry.durationMs, entry.abort.signal);
        cancelWait = wait.cancel;
        waitPromise = wait.promise;
      }
      return waitPromise;
    },
  };
}

function abortableDelay(
  durationMs: number,
  signal: AbortSignal,
): { cancel: () => void; promise: Promise<void> } {
  let finish = (): void => {};
  const promise = new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = (): void => {
      clearTimeout(timeout);
      reject(signal.reason);
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, durationMs);
    timeout.unref?.();
    signal.addEventListener("abort", onAbort, { once: true });
    finish = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
  });
  return { cancel: () => finish(), promise };
}
