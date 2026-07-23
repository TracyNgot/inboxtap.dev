import {
  exactBytes,
  projectedValueBytes,
  recordOmittedBytes,
  sourceStringBytes,
  TRUNCATION_MARKER,
} from "./byte-accounting.js";
import type { InboxTapReportDocument } from "./types.js";

const MIN_TRUNCATABLE_BYTES = 256;

interface StringSlot {
  path: string;
  set(value: string): void;
  value: string;
}

export function fitRenderedDocument(
  source: InboxTapReportDocument,
  render: (document: InboxTapReportDocument) => string,
  limitBytes: number,
  estimateBytes?: (document: InboxTapReportDocument) => number,
): string {
  const document = structuredClone(source);
  if (estimateBytes) {
    let estimate = estimateBytes(document);
    while (estimate > limitBytes) {
      if (!reduceDocument(document, estimate, limitBytes, 0.8))
        throw new Error("InboxTap report output shell exceeds its byte limit.");
      estimate = estimateBytes(document);
    }
  }
  let output = render(document);

  while (Buffer.byteLength(output) > limitBytes) {
    const outputBytes = Buffer.byteLength(output);
    if (!reduceDocument(document, outputBytes, limitBytes, 0.9))
      throw new Error("InboxTap report output shell exceeds its byte limit.");
    output = render(document);
  }
  return output;
}

function reduceDocument(
  document: InboxTapReportDocument,
  currentBytes: number,
  limitBytes: number,
  headroom: number,
): boolean {
  const slots = truncatableStringSlots(document);
  if (slots.length > 0) {
    const ratio = Math.min(0.9, Math.max(0.05, (limitBytes / currentBytes) * headroom));
    shortenSlots(document, slots, ratio);
    return true;
  }
  if (document.assertions.length > 0) {
    const omitted = omissionCount(document.assertions.length, currentBytes, limitBytes);
    const removed = document.assertions.splice(-omitted);
    document.truncation.assertionsOmitted += omitted;
    recordOmittedBytes(document.truncation, projectedValueBytes(removed));
    refreshSummary(document);
    return true;
  }
  if (document.messages.length > 0) {
    const omitted = omissionCount(document.messages.length, currentBytes, limitBytes);
    const removed = document.messages.splice(-omitted);
    document.truncation.messagesOmitted += omitted;
    recordOmittedBytes(document.truncation, projectedValueBytes(removed));
    refreshSummary(document);
    return true;
  }
  return false;
}

function omissionCount(length: number, currentBytes: number, limitBytes: number): number {
  const fraction = Number.isFinite(currentBytes) ? 1 - limitBytes / currentBytes : 1;
  return Math.min(length, Math.max(1, Math.ceil(length * fraction)));
}

function shortenSlots(document: InboxTapReportDocument, slots: StringSlot[], ratio: number): void {
  for (const slot of slots) {
    const source = stripGeneratedMarker(slot.value);
    const targetBytes = Math.max(16, Math.floor(sourceStringBytes(source) * ratio));
    const shortened = truncateUtf8(source, targetBytes);
    if (shortened.omittedBytes === 0) continue;
    slot.set(shortened.value);
    document.truncation.fieldsTruncated += 1;
    recordOmittedBytes(document.truncation, exactBytes(shortened.omittedBytes));
  }
}

export function truncateUtf8(
  value: string,
  maximumBytes: number,
): { omittedBytes: number; value: string } {
  const originalBytes = Buffer.byteLength(value);
  if (originalBytes <= maximumBytes) return { omittedBytes: 0, value };
  const marker = TRUNCATION_MARKER;
  const markerBytes = Buffer.byteLength(marker);
  if (maximumBytes <= markerBytes)
    return { omittedBytes: originalBytes, value: marker.slice(0, maximumBytes) };

  const prefix: string[] = [];
  let prefixBytes = 0;
  for (const character of value) {
    const characterBytes = Buffer.byteLength(character);
    if (prefixBytes + characterBytes + markerBytes > maximumBytes) break;
    prefix.push(character);
    prefixBytes += characterBytes;
  }
  return {
    omittedBytes: originalBytes - prefixBytes,
    value: `${prefix.join("")}${marker}`,
  };
}

function stripGeneratedMarker(value: string): string {
  return value.endsWith(TRUNCATION_MARKER) ? value.slice(0, -TRUNCATION_MARKER.length) : value;
}

function truncatableStringSlots(document: InboxTapReportDocument): StringSlot[] {
  const slots: StringSlot[] = [];
  collectStringSlots(document, "$", slots, new Set<object>());
  return slots
    .filter((slot) => Buffer.byteLength(slot.value) > MIN_TRUNCATABLE_BYTES)
    .sort((left, right) => {
      const difference = Buffer.byteLength(right.value) - Buffer.byteLength(left.value);
      return difference || compareAscii(left.path, right.path);
    });
}

function collectStringSlots(
  value: unknown,
  path: string,
  slots: StringSlot[],
  seen: Set<object>,
): void {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const entry = value[index];
      if (typeof entry === "string") {
        slots.push({
          path: `${path}[${index}]`,
          set: (next) => {
            value[index] = next;
          },
          value: entry,
        });
      } else collectStringSlots(entry, `${path}[${index}]`, slots, seen);
    }
  } else {
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record).sort(compareAscii)) {
      const entry = record[key];
      if (typeof entry === "string") {
        slots.push({
          path: `${path}.${key}`,
          set: (next) => {
            record[key] = next;
          },
          value: entry,
        });
      } else collectStringSlots(entry, `${path}.${key}`, slots, seen);
    }
  }
  seen.delete(value);
}

function refreshSummary(document: InboxTapReportDocument): void {
  document.summary.messages = {
    included: document.messages.length,
    omitted: document.truncation.messagesOmitted,
  };
  document.summary.assertions = {
    failed: document.assertions.filter((assertion) => !assertion.passed).length,
    included: document.assertions.length,
    omitted: document.truncation.assertionsOmitted,
    passed: document.assertions.filter((assertion) => assertion.passed).length,
  };
}

function compareAscii(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
