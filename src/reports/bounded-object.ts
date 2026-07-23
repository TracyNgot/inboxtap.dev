import {
  combineByteMeasurements,
  exactBytes,
  inexactBytes,
  type OmittedByteMeasurement,
  sourceValueBytes,
} from "./byte-accounting.js";

const MAX_SCANNED_PROPERTIES = 1_000;

export interface BoundedObjectEntry {
  descriptor: PropertyDescriptor;
  name: string;
}

export interface BoundedObjectEntries {
  entries: BoundedObjectEntry[];
  omittedBytes: OmittedByteMeasurement;
  omittedLabel?: string;
}

export function collectBoundedObjectEntries(value: object, limit: number): BoundedObjectEntries {
  const entries: BoundedObjectEntry[] = [];
  let omittedBytes = exactBytes(0);
  let omittedCount = 0;
  let scannedProperties = 0;
  for (const name in value) {
    if (scannedProperties >= MAX_SCANNED_PROPERTIES)
      return {
        entries,
        omittedBytes: inexactBytes(omittedBytes.bytes),
        omittedLabel: "Additional fields omitted",
      };
    scannedProperties += 1;
    if (!Object.hasOwn(value, name)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor) continue;
    if (entries.length < limit) {
      entries.push({ descriptor, name });
      continue;
    }
    const entryBytes = combineByteMeasurements(
      sourceValueBytes(name),
      "value" in descriptor ? sourceValueBytes(descriptor.value) : inexactBytes(0),
    );
    omittedBytes = combineByteMeasurements(omittedBytes, entryBytes);
    if (omittedCount > 0)
      return {
        entries,
        omittedBytes: inexactBytes(omittedBytes.bytes),
        omittedLabel: "Additional fields omitted",
      };
    omittedCount = 1;
  }
  return {
    entries,
    omittedBytes,
    ...(omittedCount > 0 ? { omittedLabel: `${omittedCount} field(s) omitted` } : {}),
  };
}
