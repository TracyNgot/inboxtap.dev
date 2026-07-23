import { collectBoundedObjectEntries } from "./bounded-object.js";
import {
  exactBytes,
  inexactBytes,
  type OmittedByteMeasurement,
  recordOmittedBytes,
  sourceArrayRangeBytes,
  sourceValueBytes,
} from "./byte-accounting.js";
import { truncateUtf8 } from "./fit-output.js";
import { compareAscii, uniqueKey } from "./record-utils.js";
import { redactRawSource } from "./redact-raw.js";
import { redactUrl } from "./redact-url.js";
import {
  isSecretName,
  QUOTED_SECRET_ASSIGNMENT_PATTERN,
  SECRET_ASSIGNMENT_PATTERN,
} from "./secret-keys.js";
import type {
  InboxTapReportRedactionOptions,
  InboxTapReportValue,
  MutableReportTruncation,
} from "./types.js";

const DEFAULT_SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "proxy-authorization",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
];
const EMAIL_PATTERN =
  /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Z0-9](?:[A-Z0-9.-]{0,253}[A-Z0-9])?/giu;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/giu;
const AUTH_PATTERN = /\b(?:basic|bearer)\s+[A-Za-z0-9+/._~-]+={0,2}/giu;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu;
const OPAQUE_TOKEN_PATTERN = /\b(?:[A-F0-9]{24,}|[A-Za-z0-9_-]{32,})\b/giu;
const SHORT_CODE_PATTERN = /\b\d{4,8}\b/gu;
const MAX_VALUE_DEPTH = 8;
const MAX_COLLECTION_ENTRIES = 100;
const MAX_REDACTED_TEXT_BYTES = 16_384;
const MAX_REDACTED_VALUE_TEXT_BYTES = 2_048;
const MAX_VALUE_NODES = 50;
const MAX_EMAIL_PSEUDONYMS = 256;
const OVERFLOW_EMAIL_ALIAS = "email-overflow@example.invalid";

export class ReportRedactor {
  readonly #addresses = new Map<string, string>();
  readonly #customPatterns: RegExp[];
  readonly #sensitiveHeaders: Set<string>;
  readonly #truncation: MutableReportTruncation;

  constructor(options: InboxTapReportRedactionOptions, truncation: MutableReportTruncation) {
    this.#customPatterns = normalizePatterns(options.patterns);
    this.#sensitiveHeaders = new Set([
      ...DEFAULT_SENSITIVE_HEADERS,
      ...(options.additionalSensitiveHeaders ?? []).map(normalizeHeaderName),
    ]);
    this.#truncation = truncation;
  }

  redactHeader(name: string, value: string): string {
    if (this.#sensitiveHeaders.has(normalizeHeaderName(name))) return "[REDACTED HEADER]";
    return this.redactText(value, 4_096);
  }

  redactRaw(raw: string): string {
    const source = this.#truncateSource(raw, MAX_REDACTED_TEXT_BYTES);
    const redacted = redactRawSource(source, {
      redactHeader: (name, value) => this.redactHeader(name, value),
      redactText: (value, maximumBytes) => this.redactText(value, maximumBytes),
    });
    return this.#truncateOutput(redacted, MAX_REDACTED_TEXT_BYTES);
  }

  redactText(value: string, maximumBytes = MAX_REDACTED_TEXT_BYTES): string {
    let redacted = this.#truncateSource(value, maximumBytes);
    for (const pattern of this.#customPatterns) {
      redacted = redacted.replace(pattern, "[REDACTED CUSTOM]");
    }
    const protectedUrls: { placeholder: string; value: string }[] = [];
    redacted = redacted.replace(URL_PATTERN, (candidate) => {
      const placeholder = `\uE000URL_${protectedUrls.length.toString(36)}\uE001`;
      protectedUrls.push({
        placeholder,
        value: this.#redactEmails(redactUrl(candidate)),
      });
      return placeholder;
    });
    redacted = this.#redactEmails(redacted);
    redacted = redacted
      .replace(AUTH_PATTERN, (match) => `${match.split(/\s/u, 1)[0]} [REDACTED]`)
      .replace(JWT_PATTERN, "[REDACTED TOKEN]")
      .replace(
        QUOTED_SECRET_ASSIGNMENT_PATTERN,
        (_match, keyQuote: string, name: string, separator: string, valueQuote: string) =>
          `${keyQuote}${name}${keyQuote}${separator}${valueQuote}[REDACTED]${valueQuote}`,
      )
      .replace(
        SECRET_ASSIGNMENT_PATTERN,
        (_match, name: string, separator: string, quote: string) =>
          `${name}${separator}${quote}[REDACTED]${quote}`,
      )
      .replace(OPAQUE_TOKEN_PATTERN, "[REDACTED TOKEN]")
      .replace(SHORT_CODE_PATTERN, "[REDACTED CODE]");
    for (const protectedUrl of protectedUrls)
      redacted = redacted.replace(protectedUrl.placeholder, protectedUrl.value);
    return this.#truncateOutput(redacted, maximumBytes);
  }

  #truncateSource(value: string, maximumBytes: number): string {
    const shortened = truncateUtf8(value, maximumBytes);
    if (shortened.omittedBytes > 0) {
      this.#truncation.fieldsTruncated += 1;
      recordOmittedBytes(this.#truncation, exactBytes(shortened.omittedBytes));
    }
    return shortened.value;
  }

  #truncateOutput(value: string, maximumBytes: number): string {
    const shortened = truncateUtf8(value, maximumBytes);
    if (shortened.omittedBytes > 0) {
      this.#truncation.fieldsTruncated += 1;
      recordOmittedBytes(this.#truncation, inexactBytes(0));
    }
    return shortened.value;
  }
  redactValue(value: unknown): InboxTapReportValue {
    return this.#redactValue(value, 0, new Set<object>(), { remaining: MAX_VALUE_NODES });
  }
  #aliasAddress(address: string): string {
    const key = address.toLowerCase();
    const existing = this.#addresses.get(key);
    if (existing) return existing;
    if (this.#addresses.size >= MAX_EMAIL_PSEUDONYMS) return OVERFLOW_EMAIL_ALIAS;
    const alias = `email-${String(this.#addresses.size + 1).padStart(3, "0")}@example.invalid`;
    this.#addresses.set(key, alias);
    return alias;
  }
  #redactEmails(value: string): string {
    return value.includes("@")
      ? value.replace(EMAIL_PATTERN, (address) => this.#aliasAddress(address))
      : value;
  }

  #redactValue(
    value: unknown,
    depth: number,
    seen: Set<object>,
    budget: { remaining: number },
  ): InboxTapReportValue {
    if (budget.remaining <= 0) {
      this.#markTruncated(sourceValueBytes(value));
      return "[TRUNCATED: value budget reached]";
    }
    budget.remaining -= 1;
    if (value === null || typeof value === "boolean") return value;
    if (typeof value === "string") return this.redactText(value, MAX_REDACTED_VALUE_TEXT_BYTES);
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return "[NON-FINITE NUMBER]";
      if (Number.isInteger(value) && value >= 1_000 && value <= 99_999_999)
        return "[REDACTED CODE]";
      return value;
    }
    if (depth >= MAX_VALUE_DEPTH) {
      this.#markTruncated(sourceValueBytes(value));
      return "[TRUNCATED: maximum depth reached]";
    }
    if (typeof value !== "object") return "[UNSUPPORTED VALUE]";
    if (seen.has(value)) return "[CIRCULAR VALUE]";
    seen.add(value);
    const result = Array.isArray(value)
      ? this.#redactArray(value, depth, seen, budget)
      : this.#redactObject(value, depth, seen, budget);
    seen.delete(value);
    return result;
  }

  #redactArray(
    value: readonly unknown[],
    depth: number,
    seen: Set<object>,
    budget: { remaining: number },
  ) {
    const retained = Math.min(value.length, MAX_COLLECTION_ENTRIES);
    const entries: InboxTapReportValue[] = [];
    for (let index = 0; index < retained; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor) {
        entries.push(this.#redactValue(null, depth + 1, seen, budget));
        continue;
      }
      if (!("value" in descriptor)) {
        this.#markTruncated(inexactBytes(0));
        entries.push("[ACCESSOR OMITTED]");
        continue;
      }
      entries.push(this.#redactValue(descriptor.value, depth + 1, seen, budget));
    }
    if (value.length > entries.length) {
      this.#markTruncated(sourceArrayRangeBytes(value, entries.length));
      entries.push(`[TRUNCATED: ${value.length - entries.length} item(s) omitted]`);
    }
    return entries;
  }

  #redactObject(value: object, depth: number, seen: Set<object>, budget: { remaining: number }) {
    const projection = collectBoundedObjectEntries(value, MAX_COLLECTION_ENTRIES);
    const { entries } = projection;
    entries.sort((left, right) => compareAscii(left.name, right.name));
    const result: Record<string, InboxTapReportValue> = {};
    for (const { descriptor, name } of entries) {
      const safeName = this.redactText(name, 256);
      const entry =
        "value" in descriptor
          ? this.#redactValue(descriptor.value, depth + 1, seen, budget)
          : "[ACCESSOR OMITTED]";
      result[uniqueKey(result, safeName)] = isSecretName(name) ? "[REDACTED]" : entry;
    }
    if (projection.omittedLabel) {
      this.#markTruncated(projection.omittedBytes);
      result["[TRUNCATED]"] = projection.omittedLabel;
    }
    return result;
  }

  #markTruncated(omittedBytes: OmittedByteMeasurement): void {
    this.#truncation.fieldsTruncated += 1;
    recordOmittedBytes(this.#truncation, omittedBytes);
  }
}

function normalizePatterns(patterns: readonly RegExp[] | undefined): RegExp[] {
  if (!patterns) return [];
  return patterns.map((pattern) => {
    if (!(pattern instanceof RegExp))
      throw new TypeError("InboxTap report redaction patterns must be regular expressions.");
    const flags = pattern.flags.replace("y", "");
    return new RegExp(pattern.source, flags.includes("g") ? flags : `${flags}g`);
  });
}

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}
