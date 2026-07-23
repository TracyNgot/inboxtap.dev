import type { PauseGate } from "./pause-gate.js";

interface EntryBase {
  abort: AbortController;
  to?: string;
}

export interface FailureEntry extends EntryBase {
  code: number;
  message: string;
  type: "fail";
}

export interface DelayEntry extends EntryBase {
  durationMs: number;
  type: "delay";
}

export interface DisconnectEntry extends EntryBase {
  afterBytes: number;
  type: "disconnect";
}

export interface PauseEntry extends EntryBase {
  gate: PauseGate;
  type: "pause";
}

export type FaultEntry = FailureEntry | DelayEntry | DisconnectEntry | PauseEntry;
