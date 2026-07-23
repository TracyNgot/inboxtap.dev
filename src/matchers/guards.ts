import type { TestInbox } from "../client/index.js";
import type { CapturedEmail } from "../types.js";

const INBOX_TYPE_ERROR =
  "toHaveDeliveredOnce() expects an InboxTap TestInbox as the received value.";
const EMAIL_TYPE_ERROR = "This InboxTap matcher expects a CapturedEmail as the received value.";

export function requireTestInbox(value: unknown): TestInbox {
  if (
    !isObject(value) ||
    typeof value.address !== "string" ||
    typeof value.messages !== "function" ||
    typeof value.waitForMessage !== "function"
  ) {
    throw new TypeError(INBOX_TYPE_ERROR);
  }
  return value as unknown as TestInbox;
}

export function requireCapturedEmail(value: unknown): CapturedEmail {
  if (!isCapturedEmail(value)) throw new TypeError(EMAIL_TYPE_ERROR);
  return value;
}

function isCapturedEmail(value: unknown): value is CapturedEmail {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.receivedAt === "string" &&
    isEnvelope(value.envelope) &&
    typeof value.from === "string" &&
    isStringArray(value.to) &&
    typeof value.subject === "string" &&
    isStringRecord(value.headers) &&
    typeof value.text === "string" &&
    typeof value.html === "string" &&
    isStringArray(value.links) &&
    isStringArray(value.codes) &&
    typeof value.raw === "string"
  );
}

function isEnvelope(value: unknown): boolean {
  return (
    isObject(value) &&
    (value.from === null || typeof value.from === "string") &&
    isStringArray(value.to)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isObject(value) &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([name, entry]) => typeof name === "string" && typeof entry === "string",
    )
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
