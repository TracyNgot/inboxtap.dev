export interface SmtpFailNextOptions {
  code: number;
  message?: string;
  times?: number;
  to?: string;
}

export interface SmtpDelayNextOptions {
  durationMs: number;
  times?: number;
  to?: string;
}

export interface SmtpDisconnectNextOptions {
  afterBytes: number;
  times?: number;
  to?: string;
}

export interface SmtpPauseNextOptions {
  timeoutMs?: number;
  to?: string;
}

export type SmtpPauseState = "pending" | "paused" | "released" | "expired" | "aborted";

export interface SmtpPauseGate {
  readonly state: SmtpPauseState;
  release(): void;
  waitUntilPaused(): Promise<void>;
}

export interface SmtpFaultController {
  failNext(options: SmtpFailNextOptions): void;
  delayNext(options: SmtpDelayNextOptions): void;
  disconnectNext(options: SmtpDisconnectNextOptions): void;
  pauseNext(options?: SmtpPauseNextOptions): SmtpPauseGate;
  reset(): void;
}

export type SmtpFaultInterruptionReason = "client" | "transaction";
export type SmtpFaultAbortReason = SmtpFaultInterruptionReason | "reset" | "shutdown" | "timeout";

export class SmtpFaultAbortedError extends Error {
  readonly reason: SmtpFaultAbortReason;

  constructor(reason: SmtpFaultAbortReason) {
    super(
      reason === "timeout"
        ? "SMTP pause gate expired after its timeout before the transaction completed"
        : `SMTP fault was aborted by ${reason}`,
    );
    this.name = "SmtpFaultAbortedError";
    this.reason = reason;
  }
}

interface ClaimedSmtpFaultBase {
  readonly abortReason: SmtpFaultAbortReason | undefined;
  readonly signal: AbortSignal;
  abort(reason: SmtpFaultInterruptionReason): void;
  complete(): void;
}

export interface ClaimedSmtpFailure extends ClaimedSmtpFaultBase {
  readonly code: number;
  readonly message: string;
  readonly type: "fail";
}

export interface ClaimedSmtpDelay extends ClaimedSmtpFaultBase {
  readonly durationMs: number;
  readonly type: "delay";
  wait(): Promise<void>;
}

export interface ClaimedSmtpDisconnect extends ClaimedSmtpFaultBase {
  readonly afterBytes: number;
  readonly type: "disconnect";
}

export interface ClaimedSmtpPause extends ClaimedSmtpFaultBase {
  readonly gate: SmtpPauseGate;
  readonly type: "pause";
  wait(): Promise<void>;
}

export type ClaimedSmtpFault =
  | ClaimedSmtpFailure
  | ClaimedSmtpDelay
  | ClaimedSmtpDisconnect
  | ClaimedSmtpPause;

export interface SmtpFaultRuntime {
  claim(recipients: readonly string[]): ClaimedSmtpFault | undefined;
  reset(reason?: "reset" | "shutdown"): void;
  shutdown(): void;
}

export interface SmtpFaultControllerRuntime {
  controller: SmtpFaultController;
  runtime: SmtpFaultRuntime;
}
