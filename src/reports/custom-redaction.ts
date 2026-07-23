import { QUOTED_SECRET_ASSIGNMENT_PATTERN, SECRET_ASSIGNMENT_PATTERN } from "./secret-keys.js";

interface RedactionRange {
  end: number;
  replacement: "[REDACTED CUSTOM]" | "[REDACTED]";
  start: number;
}

interface UrlRange {
  candidate: string;
  end: number;
  start: number;
}

export function redactCustomSegments(
  value: string,
  patterns: readonly RegExp[],
  redactPlain: (value: string) => string,
  redactUrl: (value: string) => string,
): string {
  const urls = collectUrlRanges(value);
  if (urls.length === 0) {
    if (patterns.length === 0) return redactPlain(value);
    const ranges = collectRedactionRanges(value, patterns, urls);
    return redactPlain(applyRedaction(value, 0, ranges));
  }
  const ranges = collectRedactionRanges(value, patterns, urls);
  const parts: string[] = [];
  let offset = 0;
  for (const url of urls) {
    if (url.start > offset) {
      parts.push(redactPlain(applyRedaction(value.slice(offset, url.start), offset, ranges)));
    }
    parts.push(
      overlapsRedaction(ranges, url.start, url.end) ? "[REDACTED URL]" : redactUrl(url.candidate),
    );
    offset = url.end;
  }
  if (offset < value.length) {
    parts.push(redactPlain(applyRedaction(value.slice(offset), offset, ranges)));
  }
  return parts.join("");
}

function collectUrlRanges(value: string): UrlRange[] {
  return [...value.matchAll(/https?:\/\/[^\s<>"']+/giu)].map((match) => ({
    candidate: match[0],
    end: match.index + match[0].length,
    start: match.index,
  }));
}

function collectRedactionRanges(
  value: string,
  patterns: readonly RegExp[],
  urls: readonly UrlRange[],
): RedactionRange[] {
  const ranges: RedactionRange[] = [];
  for (const pattern of patterns) {
    for (const match of value.matchAll(pattern)) {
      if (match[0].length === 0) continue;
      ranges.push({
        end: match.index + match[0].length,
        replacement: "[REDACTED CUSTOM]",
        start: match.index,
      });
    }
  }
  if (urls.length > 0) {
    collectBoundarySecretRanges(value, QUOTED_SECRET_ASSIGNMENT_PATTERN, 5, 4, urls, ranges);
    collectBoundarySecretRanges(value, SECRET_ASSIGNMENT_PATTERN, 4, 3, urls, ranges);
  }
  ranges.sort((left, right) => left.start - right.start || left.end - right.end);
  const merged: RedactionRange[] = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
      if (range.replacement === "[REDACTED CUSTOM]") previous.replacement = range.replacement;
    } else merged.push({ ...range });
  }
  return merged;
}

function collectBoundarySecretRanges(
  value: string,
  pattern: RegExp,
  valueGroup: number,
  quoteGroup: number,
  urls: readonly UrlRange[],
  ranges: RedactionRange[],
): void {
  for (const match of value.matchAll(pattern)) {
    if (overlapsRange(urls, match.index, match.index + 1)) continue;
    const secret = match[valueGroup] ?? "";
    const closingQuote = match[quoteGroup] ?? "";
    const end = match.index + match[0].length - closingQuote.length;
    const start = end - secret.length;
    if (start < end && overlapsRange(urls, start, end)) {
      ranges.push({ end, replacement: "[REDACTED]", start });
    }
  }
}

function overlapsRedaction(ranges: readonly RedactionRange[], start: number, end: number): boolean {
  return overlapsRange(ranges, start, end);
}

function overlapsRange(
  ranges: readonly { end: number; start: number }[],
  start: number,
  end: number,
): boolean {
  const range = ranges[firstEndingAfter(ranges, start)];
  return range !== undefined && range.start < end;
}

function firstEndingAfter(
  ranges: readonly { end: number; start: number }[],
  start: number,
): number {
  let lower = 0;
  let upper = ranges.length;
  while (lower < upper) {
    const middle = Math.floor((lower + upper) / 2);
    if ((ranges[middle]?.end ?? 0) <= start) lower = middle + 1;
    else upper = middle;
  }
  return lower;
}

function applyRedaction(
  value: string,
  absoluteStart: number,
  ranges: readonly RedactionRange[],
): string {
  const absoluteEnd = absoluteStart + value.length;
  const parts: string[] = [];
  let cursor = absoluteStart;
  for (let index = firstEndingAfter(ranges, absoluteStart); index < ranges.length; index += 1) {
    const range = ranges[index];
    if (!range) break;
    if (range.start >= absoluteEnd) break;
    const start = Math.max(range.start, absoluteStart);
    const end = Math.min(range.end, absoluteEnd);
    if (start > cursor) parts.push(value.slice(cursor - absoluteStart, start - absoluteStart));
    if (end > cursor) {
      parts.push(range.replacement);
      cursor = end;
    }
  }
  if (cursor < absoluteEnd) parts.push(value.slice(cursor - absoluteStart));
  return parts.join("");
}
