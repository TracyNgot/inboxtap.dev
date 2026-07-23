const MAX_DURATION_MS = 60_000;
export const MAX_FAULT_APPLICATIONS = 100;

export function validateFailureCode(code: number): number {
  if (!Number.isInteger(code) || code < 400 || code > 599) {
    throw new RangeError("SMTP failure code must be an integer from 400 to 599");
  }
  return code;
}

export function validateFailureMessage(message = "Injected SMTP failure"): string {
  if (typeof message !== "string" || /[\r\n]/u.test(message)) {
    throw new TypeError("SMTP failure message must be a string without CR or LF");
  }
  return message;
}

export function validateDuration(value: number, name: "durationMs" | "timeoutMs"): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_DURATION_MS) {
    throw new RangeError(`${name} must be an integer from 0 to ${MAX_DURATION_MS}`);
  }
  return value;
}

export function validateAfterBytes(afterBytes: number): number {
  if (!Number.isSafeInteger(afterBytes) || afterBytes < 0) {
    throw new RangeError("afterBytes must be a non-negative safe integer");
  }
  return afterBytes;
}

export function validateTimes(times = 1): number {
  if (!Number.isInteger(times) || times < 1 || times > MAX_FAULT_APPLICATIONS) {
    throw new RangeError(`times must be an integer from 1 to ${MAX_FAULT_APPLICATIONS}`);
  }
  return times;
}

export function validateRecipient(to: string | undefined): string | undefined {
  if (to === undefined) return undefined;
  if (typeof to !== "string" || to.trim() === "") {
    throw new TypeError("SMTP fault recipient must be a non-empty string");
  }
  return normalizeAddress(to);
}

export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}
