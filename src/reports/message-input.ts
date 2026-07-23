import {
  combineByteMeasurements,
  exactBytes,
  inexactBytes,
  type OmittedByteMeasurement,
  sourceArrayRangeBytes,
  sourceValueBytes,
} from "./byte-accounting.js";
import { compareAscii } from "./record-utils.js";

const MAX_RETAINED_ENTRIES = 50;
const MAX_SCANNED_PROPERTIES = 1_000;

export interface PreparedStringCollection {
  omitted: boolean;
  omittedBytes: OmittedByteMeasurement;
  values: string[];
}

export interface PreparedHeaderCollection {
  entries: [string, string][];
  omitted: boolean;
  omittedBytes: OmittedByteMeasurement;
}

export interface PreparedReportMessage {
  codeCount: number;
  envelopeFrom: string | null;
  envelopeTo: PreparedStringCollection;
  from: string;
  headers: PreparedHeaderCollection;
  html: string;
  id: string;
  links: PreparedStringCollection;
  raw: string;
  receivedAt: string;
  subject: string;
  text: string;
  to: PreparedStringCollection;
}

export function prepareReportMessage(value: unknown): PreparedReportMessage {
  if (!isObject(value)) throw new TypeError("InboxTap report message must be a CapturedEmail.");
  const id = requireString(value, "id");
  validateSourceMessageId(id);
  const receivedAt = normalizeTimestamp(requireString(value, "receivedAt"));
  const envelope = requireObject(value, "envelope");
  const envelopeFrom = requireNullableString(envelope, "from");
  const envelopeTo = prepareStrings(requireData(envelope, "to"));
  const to = prepareStrings(requireData(value, "to"));
  const links = prepareStrings(requireData(value, "links"));
  const codes = requireArray(value, "codes");
  prepareStrings(codes);
  return {
    codeCount: codes.length,
    envelopeFrom,
    envelopeTo,
    from: requireString(value, "from"),
    headers: prepareHeaders(requireData(value, "headers")),
    html: requireString(value, "html"),
    id,
    links,
    raw: requireString(value, "raw"),
    receivedAt,
    subject: requireString(value, "subject"),
    text: requireString(value, "text"),
    to,
  };
}

export function validateSourceMessageId(value: unknown): void {
  if (value === undefined) return;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 1_024)
    throw new TypeError("InboxTap report message ID is invalid.");
}

function prepareStrings(value: unknown): PreparedStringCollection {
  if (!Array.isArray(value))
    throw new TypeError("InboxTap report message must be a CapturedEmail.");
  const retained = Math.min(value.length, MAX_RETAINED_ENTRIES);
  const values: string[] = [];
  for (let index = 0; index < retained; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string")
      throw new TypeError("InboxTap report message must be a CapturedEmail.");
    values.push(descriptor.value);
  }
  return {
    omitted: value.length > retained,
    omittedBytes: value.length > retained ? sourceArrayRangeBytes(value, retained) : exactBytes(0),
    values,
  };
}

function prepareHeaders(value: unknown): PreparedHeaderCollection {
  if (!isObject(value)) throw new TypeError("InboxTap report message must be a CapturedEmail.");
  const entries: [string, string][] = [];
  let omittedBytes = exactBytes(0);
  let omittedCount = 0;
  let scannedProperties = 0;
  for (const name in value) {
    if (scannedProperties >= MAX_SCANNED_PROPERTIES)
      return {
        entries: entries.sort(([left], [right]) => compareAscii(left, right)),
        omitted: true,
        omittedBytes: inexactBytes(omittedBytes.bytes),
      };
    scannedProperties += 1;
    if (!Object.hasOwn(value, name)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string")
      throw new TypeError("InboxTap report message must be a CapturedEmail.");
    if (entries.length < MAX_RETAINED_ENTRIES) {
      entries.push([name, descriptor.value]);
      continue;
    }
    omittedCount += 1;
    omittedBytes = combineByteMeasurements(
      omittedBytes,
      combineByteMeasurements(sourceValueBytes(name), sourceValueBytes(descriptor.value)),
    );
    if (omittedCount > 1) {
      omittedBytes = inexactBytes(omittedBytes.bytes);
      break;
    }
  }
  entries.sort(([left], [right]) => compareAscii(left, right));
  return { entries, omitted: omittedCount > 0, omittedBytes };
}

function requireData(value: Record<string, unknown>, name: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, name);
  if (!descriptor || !("value" in descriptor))
    throw new TypeError("InboxTap report message must be a CapturedEmail.");
  return descriptor.value;
}

function requireString(value: Record<string, unknown>, name: string): string {
  const entry = requireData(value, name);
  if (typeof entry !== "string")
    throw new TypeError("InboxTap report message must be a CapturedEmail.");
  return entry;
}

function requireNullableString(value: Record<string, unknown>, name: string): string | null {
  const entry = requireData(value, name);
  if (entry !== null && typeof entry !== "string")
    throw new TypeError("InboxTap report message must be a CapturedEmail.");
  return entry;
}

function requireObject(value: Record<string, unknown>, name: string): Record<string, unknown> {
  const entry = requireData(value, name);
  if (!isObject(entry)) throw new TypeError("InboxTap report message must be a CapturedEmail.");
  return entry;
}

function requireArray(value: Record<string, unknown>, name: string): unknown[] {
  const entry = requireData(value, name);
  if (!Array.isArray(entry))
    throw new TypeError("InboxTap report message must be a CapturedEmail.");
  return entry;
}

function normalizeTimestamp(value: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.valueOf()))
    throw new TypeError("InboxTap report message receivedAt must be a valid timestamp.");
  return timestamp.toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
