type JsonEstimateMode = "escaped-html" | "utf8";

export function estimatePrettyJsonBytes(value: unknown): number {
  return estimateJsonValue(value, 0, true, "utf8");
}

export function estimateEscapedHtmlPrettyJsonBytes(value: unknown): number {
  return estimateJsonValue(value, 0, true, "escaped-html");
}

function estimateJsonValue(
  value: unknown,
  depth: number,
  pretty: boolean,
  mode: JsonEstimateMode,
): number {
  if (value === null) return 4;
  if (typeof value === "string") return estimateJsonString(value, mode);
  if (typeof value === "boolean") return value ? 4 : 5;
  if (typeof value === "number") {
    const serialized = JSON.stringify(value);
    return serialized ? Buffer.byteLength(serialized) : 4;
  }
  if (Array.isArray(value)) return estimateArray(value, depth, pretty, mode);
  if (typeof value === "object")
    return estimateObject(value as Record<string, unknown>, depth, pretty, mode);
  return 4;
}

function estimateArray(
  values: readonly unknown[],
  depth: number,
  pretty: boolean,
  mode: JsonEstimateMode,
): number {
  if (values.length === 0) return 2;
  let bytes = pretty ? 2 : 1;
  for (let index = 0; index < values.length; index += 1) {
    if (pretty) bytes = safeAdd(bytes, (depth + 1) * 2);
    bytes = safeAdd(bytes, estimateJsonValue(values[index], depth + 1, pretty, mode));
    if (index + 1 < values.length) bytes = safeAdd(bytes, 1);
    if (pretty) bytes = safeAdd(bytes, 1);
  }
  if (pretty) bytes = safeAdd(bytes, depth * 2);
  return safeAdd(bytes, 1);
}

function estimateObject(
  value: Record<string, unknown>,
  depth: number,
  pretty: boolean,
  mode: JsonEstimateMode,
): number {
  const entries = Object.entries(value).filter(([, entry]) => isJsonValue(entry));
  if (entries.length === 0) return 2;
  let bytes = pretty ? 2 : 1;
  for (let index = 0; index < entries.length; index += 1) {
    const [name, entry] = entries[index] as [string, unknown];
    if (pretty) bytes = safeAdd(bytes, (depth + 1) * 2);
    bytes = safeAdd(bytes, estimateJsonString(name, mode));
    bytes = safeAdd(bytes, pretty ? 2 : 1);
    bytes = safeAdd(bytes, estimateJsonValue(entry, depth + 1, pretty, mode));
    if (index + 1 < entries.length) bytes = safeAdd(bytes, 1);
    if (pretty) bytes = safeAdd(bytes, 1);
  }
  if (pretty) bytes = safeAdd(bytes, depth * 2);
  return safeAdd(bytes, 1);
}

function estimateJsonString(value: string, mode: JsonEstimateMode): number {
  let bytes = mode === "escaped-html" ? 12 : 2;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code === 0x22) bytes = safeAdd(bytes, mode === "escaped-html" ? 7 : 2);
    else if (code === 0x5c) bytes = safeAdd(bytes, 2);
    else if (code === 0x08 || code === 0x09 || code === 0x0a || code === 0x0c || code === 0x0d)
      bytes = safeAdd(bytes, 2);
    else if (code <= 0x1f) bytes = safeAdd(bytes, 6);
    else if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes = safeAdd(bytes, 4);
        index += 1;
      } else bytes = safeAdd(bytes, 6);
    } else if (code >= 0xdc00 && code <= 0xdfff) bytes = safeAdd(bytes, 6);
    else if (mode === "escaped-html" && code === 0x26) bytes = safeAdd(bytes, 5);
    else if (mode === "escaped-html" && (code === 0x3c || code === 0x3e)) bytes = safeAdd(bytes, 4);
    else if (mode === "escaped-html" && code === 0x27) bytes = safeAdd(bytes, 5);
    else bytes = safeAdd(bytes, Buffer.byteLength(value[index] as string));
  }
  return bytes;
}

function isJsonValue(value: unknown): boolean {
  return value !== undefined && typeof value !== "function" && typeof value !== "symbol";
}

function safeAdd(left: number, right: number): number {
  const result = left + right;
  return Number.isSafeInteger(result) ? result : Number.MAX_SAFE_INTEGER;
}
