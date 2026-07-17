import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import { simpleParser } from "mailparser";
import type { CapturedEmail, EmailEnvelope } from "./types.js";

const CODE_PATTERN = /\b\d{4,8}\b/g;
const HREF_PATTERN = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

export async function parseIncomingEmail(
  stream: Readable,
  envelope: EmailEnvelope,
): Promise<CapturedEmail> {
  const rawBuffer = await readStream(stream);
  const raw = rawBuffer.toString("utf8");
  const parsed = await simpleParser(rawBuffer, {
    skipHtmlToText: true,
    skipImageLinks: true,
    skipTextLinks: true,
  });
  const html = typeof parsed.html === "string" ? parsed.html : "";
  const text = parsed.text ?? "";
  const searchable = decodeEntities(`${html}\n${text}`);

  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    envelope,
    from: parsed.from?.text ?? envelope.from ?? "",
    to: envelope.to,
    subject: parsed.subject ?? "",
    headers: normalizeHeaders(parsed.headers),
    text,
    html,
    links: extractLinks(html, searchable),
    codes: extractCodes(searchable),
    raw,
  };
}

function readStream(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    stream.once("end", () => resolve(Buffer.concat(chunks)));
    stream.once("error", reject);
  });
}

function normalizeHeaders(headers: Map<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    [...headers.entries()].map(([name, value]) => [name, serializeHeader(value)]),
  );
}

function serializeHeader(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function extractLinks(html: string, searchable: string): string[] {
  const hrefs = [...html.matchAll(HREF_PATTERN)].map(
    (match) => match[1] ?? match[2] ?? match[3] ?? "",
  );
  const urls = searchable.match(URL_PATTERN) ?? [];
  return [
    ...new Set(
      [...hrefs, ...urls].map(decodeEntities).map(stripTrailingPunctuation).filter(isHttpUrl),
    ),
  ];
}

function extractCodes(value: string): string[] {
  return [...new Set(value.match(CODE_PATTERN) ?? [])];
}

function decodeEntities(value: string): string {
  return value.replace(/&(amp|quot|#39|lt|gt);/gi, (entity) => {
    const replacements: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&#39;": "'",
      "&lt;": "<",
      "&gt;": ">",
    };
    return replacements[entity.toLowerCase()] ?? entity;
  });
}

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:!?)\]]+$/, "");
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
