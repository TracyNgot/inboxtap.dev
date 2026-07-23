import type { TestInbox } from "../client/index.js";
import type { CapturedEmail } from "../types.js";
import type { ToHaveDeliveredOnceOptions } from "./types.js";

const MAX_QUIET_MS = 60_000;
const OPTIONS_TYPE_ERROR = "InboxTap matcher options are invalid.";

interface NormalizedDeliveredOnceOptions {
  subject: string | RegExp | undefined;
  quietMs: number;
}

export interface DeliveredOnceEvaluation {
  pass: boolean;
  messageId?: string;
  initialCount: number;
  finalCount?: number;
  additionalObserved: boolean;
}

export async function evaluateDeliveredOnce(
  inbox: TestInbox,
  options: ToHaveDeliveredOnceOptions,
): Promise<DeliveredOnceEvaluation> {
  const normalized = normalizeOptions(options);
  const initial = await inbox.messages();
  const initialMatches = matchingMessages(initial, normalized.subject);
  let finalMatches: CapturedEmail[] | undefined;
  let additionalObserved = false;

  if (initialMatches.length === 1 && normalized.quietMs > 0) {
    additionalObserved = await observeQuietWindow(inbox, initial, normalized);
    finalMatches = matchingMessages(await inbox.messages(), normalized.subject);
    if (finalMatches.length === 1 && finalMatches[0]?.id !== initialMatches[0]?.id) {
      additionalObserved = true;
    }
  }

  const observed = finalMatches ?? initialMatches;
  return {
    pass: observed.length === 1 && !additionalObserved,
    ...(observed.length === 1 && observed[0] ? { messageId: observed[0].id } : {}),
    initialCount: initialMatches.length,
    ...(finalMatches ? { finalCount: finalMatches.length } : {}),
    additionalObserved,
  };
}

export function subjectFilterKind(
  subject: string | RegExp | undefined,
): "none" | "string" | "regexp" {
  if (subject === undefined) return "none";
  return typeof subject === "string" ? "string" : "regexp";
}

function normalizeOptions(options: ToHaveDeliveredOnceOptions): NormalizedDeliveredOnceOptions {
  if (!isOptionsObject(options)) throw new TypeError(OPTIONS_TYPE_ERROR);
  if (
    options.subject !== undefined &&
    typeof options.subject !== "string" &&
    !(options.subject instanceof RegExp)
  ) {
    throw new TypeError(OPTIONS_TYPE_ERROR);
  }
  const quietMs = options.quietMs ?? 0;
  if (!Number.isInteger(quietMs) || quietMs < 0 || quietMs > MAX_QUIET_MS) {
    throw new TypeError(OPTIONS_TYPE_ERROR);
  }
  return { subject: options.subject, quietMs };
}

async function observeQuietWindow(
  inbox: TestInbox,
  initial: CapturedEmail[],
  options: NormalizedDeliveredOnceOptions,
): Promise<boolean> {
  try {
    await inbox.waitForMessage({
      afterId: initial.at(-1)?.id,
      subject: options.subject,
      timeoutMs: options.quietMs,
    });
    return true;
  } catch (error) {
    if (isTimeoutError(error)) return false;
    throw error;
  }
}

function matchingMessages(
  messages: CapturedEmail[],
  subject: string | RegExp | undefined,
): CapturedEmail[] {
  if (subject === undefined) return messages;
  return messages.filter((message) => matchesSubject(message.subject, subject));
}

function matchesSubject(subject: string, filter: string | RegExp): boolean {
  if (typeof filter === "string") return subject.toLowerCase().includes(filter.toLowerCase());
  return new RegExp(filter.source, filter.flags).test(subject);
}

function isOptionsObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && "status" in error && error.status === 408;
}
