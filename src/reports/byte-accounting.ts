import type { MutableReportTruncation } from "./types.js";

export const TRUNCATION_MARKER = "[TRUNCATED]";
const MAX_ACCOUNTING_NODES = 1_000;
const MAX_ACCOUNTED_STRING_CODE_UNITS = 65_536;
const MAX_SCANNED_PROPERTIES = 1_000;

interface AccountingState {
  exact: boolean;
  remaining: number;
  remainingProperties: number;
}

export interface OmittedByteMeasurement {
  bytes: number;
  exact: boolean;
}

export function sourceStringBytes(value: string): number {
  if (/^\[TRUNCATED:/u.test(value)) return 0;
  const payload = value.endsWith(TRUNCATION_MARKER)
    ? value.slice(0, -TRUNCATION_MARKER.length)
    : value;
  return Buffer.byteLength(payload);
}

export function sourceValueBytes(value: unknown): OmittedByteMeasurement {
  return measureBounded(value, false);
}

export function projectedValueBytes(value: unknown): OmittedByteMeasurement {
  return measureBounded(value, true);
}

export function sourceArrayRangeBytes(
  values: readonly unknown[],
  start: number,
): OmittedByteMeasurement {
  const state = createState();
  let result = exactBytes(0);
  for (let index = start; index < values.length; index += 1) {
    if (state.remaining <= 0) {
      state.exact = false;
      break;
    }
    result = combineByteMeasurements(
      result,
      exactBytes(measureArrayEntry(values, index, new Set<object>(), state, false)),
    );
  }
  return { bytes: result.bytes, exact: result.exact && state.exact };
}

export function exactBytes(bytes: number): OmittedByteMeasurement {
  return { bytes, exact: true };
}

export function inexactBytes(bytes: number): OmittedByteMeasurement {
  return { bytes, exact: false };
}

export function combineByteMeasurements(
  left: OmittedByteMeasurement,
  right: OmittedByteMeasurement,
): OmittedByteMeasurement {
  const sum = left.bytes + right.bytes;
  const overflowed = !Number.isSafeInteger(sum);
  return {
    bytes: overflowed ? Number.MAX_SAFE_INTEGER : sum,
    exact: left.exact && right.exact && !overflowed,
  };
}

export function recordOmittedBytes(
  truncation: MutableReportTruncation,
  additional: OmittedByteMeasurement,
): void {
  const combined = combineByteMeasurements(
    {
      bytes: truncation.utf8BytesOmitted,
      exact: truncation.utf8BytesOmittedExact,
    },
    additional,
  );
  truncation.utf8BytesOmitted = combined.bytes;
  truncation.utf8BytesOmittedExact = combined.exact;
}

function measureBounded(value: unknown, stripMarkers: boolean): OmittedByteMeasurement {
  const state = createState();
  const bytes = measure(value, new Set<object>(), state, stripMarkers);
  return { bytes, exact: state.exact };
}

function measure(
  value: unknown,
  seen: Set<object>,
  state: AccountingState,
  stripMarkers: boolean,
): number {
  if (state.remaining <= 0) {
    state.exact = false;
    return 0;
  }
  state.remaining -= 1;
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    const hasSuffixMarker = stripMarkers && value.endsWith(TRUNCATION_MARKER);
    const payload = hasSuffixMarker ? value.slice(0, -TRUNCATION_MARKER.length) : value;
    if (hasSuffixMarker) state.exact = false;
    if (/^\[TRUNCATED:/u.test(payload)) {
      if (stripMarkers) state.exact = false;
      return 0;
    }
    if (payload.length <= MAX_ACCOUNTED_STRING_CODE_UNITS) return Buffer.byteLength(payload);
    state.exact = false;
    return Buffer.byteLength(payload.slice(0, MAX_ACCOUNTED_STRING_CODE_UNITS));
  }
  if (typeof value === "number" || typeof value === "boolean")
    return Buffer.byteLength(String(value));
  if (typeof value !== "object") {
    state.exact = false;
    return 0;
  }
  if (seen.has(value)) {
    state.exact = false;
    return 0;
  }

  seen.add(value);
  let bytes = 0;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (state.remaining <= 0) {
        state.exact = false;
        break;
      }
      bytes = safeAdd(bytes, measureArrayEntry(value, index, seen, state, stripMarkers), state);
    }
  } else {
    for (const name in value) {
      if (state.remainingProperties <= 0) {
        state.exact = false;
        break;
      }
      state.remainingProperties -= 1;
      if (!Object.hasOwn(value, name)) continue;
      if (state.remaining <= 0) {
        state.exact = false;
        break;
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, name);
      if (!descriptor) continue;
      bytes = safeAdd(bytes, boundedStringBytes(name, state), state);
      if ("value" in descriptor)
        bytes = safeAdd(bytes, measure(descriptor.value, seen, state, stripMarkers), state);
      else state.exact = false;
    }
  }
  seen.delete(value);
  return bytes;
}

function measureArrayEntry(
  values: readonly unknown[],
  index: number,
  seen: Set<object>,
  state: AccountingState,
  stripMarkers: boolean,
): number {
  const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
  if (!descriptor) return measure(undefined, seen, state, stripMarkers);
  if ("value" in descriptor) return measure(descriptor.value, seen, state, stripMarkers);
  state.exact = false;
  return measure(undefined, seen, state, stripMarkers);
}

function createState(): AccountingState {
  return {
    exact: true,
    remaining: MAX_ACCOUNTING_NODES,
    remainingProperties: MAX_SCANNED_PROPERTIES,
  };
}

function boundedStringBytes(value: string, state: AccountingState): number {
  if (value.length <= MAX_ACCOUNTED_STRING_CODE_UNITS) return Buffer.byteLength(value);
  state.exact = false;
  return Buffer.byteLength(value.slice(0, MAX_ACCOUNTED_STRING_CODE_UNITS));
}

function safeAdd(left: number, right: number, state: AccountingState): number {
  const sum = left + right;
  if (Number.isSafeInteger(sum)) return sum;
  state.exact = false;
  return Number.MAX_SAFE_INTEGER;
}
