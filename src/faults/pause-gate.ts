import type { SmtpPauseGate, SmtpPauseState } from "./types.js";
import { SmtpFaultAbortedError } from "./types.js";

interface Deferred {
  promise: Promise<void>;
  reject: (error: Error) => void;
  resolve: () => void;
}

export class PauseGate implements SmtpPauseGate {
  #hasPaused = false;
  #onExpire: ((error: SmtpFaultAbortedError) => void) | undefined;
  #onPendingEnd: (() => void) | undefined;
  #pauseWait: Deferred | undefined;
  #resumeWait: Deferred | undefined;
  #state: SmtpPauseState = "pending";
  #terminalError: Error | undefined;
  #timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(timeoutMs: number) {
    this.#timeout = setTimeout(() => this.#expire(), timeoutMs);
    this.#timeout.unref?.();
  }

  get state(): SmtpPauseState {
    return this.#state;
  }

  release(): void {
    if (this.#state !== "pending" && this.#state !== "paused") return;
    const wasPending = this.#state === "pending";
    this.#state = "released";
    if (!this.#hasPaused) this.#terminalError = unavailableError(this.#state);
    this.#clearTimeout();
    if (wasPending) this.#onPendingEnd?.();
    this.#finishPauseWait();
    this.#resumeWait?.resolve();
  }

  waitUntilPaused(): Promise<void> {
    if (this.#hasPaused) return Promise.resolve();
    if (this.#state !== "pending") {
      return Promise.reject(this.#terminalError ?? unavailableError(this.#state));
    }
    this.#pauseWait ??= deferred();
    return this.#pauseWait.promise;
  }

  attach(callbacks: {
    onExpire: (error: SmtpFaultAbortedError) => void;
    onPendingEnd: () => void;
  }): void {
    this.#onExpire = callbacks.onExpire;
    this.#onPendingEnd = callbacks.onPendingEnd;
  }

  hold(): Promise<void> {
    if (this.#state === "released") return Promise.resolve();
    if (this.#state !== "pending") {
      return Promise.reject(this.#terminalError ?? unavailableError(this.#state));
    }
    this.#hasPaused = true;
    this.#state = "paused";
    this.#pauseWait?.resolve();
    this.#resumeWait ??= deferred();
    return this.#resumeWait.promise;
  }

  abort(error: SmtpFaultAbortedError): void {
    if (this.#state === "released" || this.#state === "expired" || this.#state === "aborted") {
      return;
    }
    const wasPending = this.#state === "pending";
    this.#state = "aborted";
    this.#terminalError = error;
    this.#clearTimeout();
    if (wasPending) this.#onPendingEnd?.();
    this.#pauseWait?.reject(error);
    this.#resumeWait?.reject(error);
  }

  finish(): void {
    this.#clearTimeout();
  }

  #expire(): void {
    if (this.#state !== "pending" && this.#state !== "paused") return;
    const wasPending = this.#state === "pending";
    const error = new SmtpFaultAbortedError("timeout");
    this.#state = "expired";
    this.#terminalError = error;
    this.#timeout = undefined;
    this.#onExpire?.(error);
    if (wasPending) this.#onPendingEnd?.();
    this.#finishPauseWait();
    this.#resumeWait?.reject(error);
  }

  #finishPauseWait(): void {
    if (this.#hasPaused) this.#pauseWait?.resolve();
    else {
      this.#pauseWait?.reject(this.#terminalError ?? unavailableError(this.#state));
    }
  }

  #clearTimeout(): void {
    if (this.#timeout !== undefined) clearTimeout(this.#timeout);
    this.#timeout = undefined;
  }
}

function deferred(): Deferred {
  let resolve = (): void => {};
  let reject = (_error: Error): void => {};
  const promise = new Promise<void>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}

function unavailableError(state: SmtpPauseState): Error {
  return new Error(`SMTP pause gate became ${state} before reaching a transaction`);
}
