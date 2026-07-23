import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname } from "node:path";
import type { InboxTapMatcherObservation, InboxTapMatcherRecorder } from "../matchers/index.js";
import type { CapturedEmail } from "../types.js";
import { recordOmittedBytes, sourceValueBytes } from "./byte-accounting.js";
import { prepareReportMessage } from "./message-input.js";
import { ReportProjector } from "./project.js";
import { renderHtml } from "./render-html.js";
import { renderJson } from "./render-json.js";
import type {
  InboxTapReportAssertion,
  InboxTapReportAssertionInput,
  InboxTapReportDocument,
  InboxTapReportFormat,
  InboxTapReportLimits,
  InboxTapReportMessage,
  InboxTapReportOptions,
  InboxTapReportRenderOptions,
  InboxTapReportWriteOptions,
  MutableReportTruncation,
} from "./types.js";

export const INBOXTAP_REPORT_LIMITS: InboxTapReportLimits = Object.freeze({
  maxAssertions: 1_000,
  maxBytes: 10_485_760,
  maxMessages: 100,
});

const DEFAULT_TITLE = "InboxTap test report";

export class InboxTapReport implements InboxTapMatcherRecorder {
  readonly #assertions: InboxTapReportAssertion[] = [];
  readonly #includeRaw: boolean;
  readonly #messages: InboxTapReportMessage[] = [];
  readonly #projector: ReportProjector;
  readonly #recordedMessageIds = new Set<string>();
  readonly #title: string;
  readonly #truncation: MutableReportTruncation = {
    assertionsOmitted: 0,
    fieldsTruncated: 0,
    messagesOmitted: 0,
    utf8BytesOmitted: 0,
    utf8BytesOmittedExact: true,
  };

  constructor(options: InboxTapReportOptions = {}) {
    validateOptions(options);
    this.#includeRaw = options.includeRaw ?? false;
    this.#projector = new ReportProjector(options, this.#truncation);
    this.#title = this.#projector.redactTitle(options.title ?? DEFAULT_TITLE);
  }

  addMessage(message: CapturedEmail): this {
    const prepared = prepareReportMessage(message);
    if (this.#recordedMessageIds.has(prepared.id)) return this;
    if (this.#messages.length >= INBOXTAP_REPORT_LIMITS.maxMessages) {
      this.#truncation.messagesOmitted += 1;
      recordOmittedBytes(this.#truncation, sourceValueBytes(message));
      return this;
    }
    const projected = this.#projector.projectMessage(prepared);
    this.#recordedMessageIds.add(prepared.id);
    this.#messages.push(projected);
    return this;
  }

  addAssertion(assertion: InboxTapReportAssertionInput): this {
    if (this.#assertions.length >= INBOXTAP_REPORT_LIMITS.maxAssertions) {
      this.#truncation.assertionsOmitted += 1;
      recordOmittedBytes(this.#truncation, sourceValueBytes(assertion));
      return this;
    }
    this.#assertions.push(this.#projector.projectAssertion(assertion));
    return this;
  }

  recordMatcherObservation(observation: InboxTapMatcherObservation): void {
    if (this.#assertions.length >= INBOXTAP_REPORT_LIMITS.maxAssertions) {
      this.#truncation.assertionsOmitted += 1;
      recordOmittedBytes(this.#truncation, sourceValueBytes(observation));
      return;
    }
    this.#assertions.push(this.#projector.projectMatcherObservation(observation));
  }

  render(options: InboxTapReportRenderOptions): string {
    const format = normalizeFormat(options?.format);
    const document = this.#document();
    return format === "json"
      ? renderJson(document, INBOXTAP_REPORT_LIMITS.maxBytes)
      : renderHtml(document, INBOXTAP_REPORT_LIMITS.maxBytes);
  }

  async write(filePath: string, options: InboxTapReportWriteOptions = {}): Promise<void> {
    if (typeof filePath !== "string" || filePath.trim().length === 0)
      throw new TypeError("InboxTap report path must be a non-empty string.");
    const format = options.format ?? inferFormat(filePath);
    const output = this.render({ format });
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, output, "utf8");
  }

  #document(): InboxTapReportDocument {
    const assertions = structuredClone(this.#assertions);
    const messages = structuredClone(this.#messages);
    const truncation = {
      ...this.#truncation,
      limitBytes: INBOXTAP_REPORT_LIMITS.maxBytes,
    };
    return {
      assertions,
      messages,
      protection: {
        rawIncluded: this.#includeRaw,
        redaction: "best-effort",
      },
      schemaVersion: 1,
      summary: {
        assertions: {
          failed: assertions.filter((assertion) => !assertion.passed).length,
          included: assertions.length,
          omitted: truncation.assertionsOmitted,
          passed: assertions.filter((assertion) => assertion.passed).length,
        },
        messages: {
          included: messages.length,
          omitted: truncation.messagesOmitted,
        },
      },
      title: this.#title,
      truncation,
    };
  }
}

function validateOptions(value: InboxTapReportOptions): void {
  if (!isObject(value)) throw new TypeError("InboxTap report options must be an object.");
  if (value.title !== undefined && (typeof value.title !== "string" || !value.title.trim()))
    throw new TypeError("InboxTap report title must be a non-empty string.");
  if (value.includeRaw !== undefined && typeof value.includeRaw !== "boolean")
    throw new TypeError("InboxTap report includeRaw must be a boolean.");
  if (value.redaction !== undefined && !isObject(value.redaction))
    throw new TypeError("InboxTap report redaction options must be an object.");
  if (
    value.redaction?.additionalSensitiveHeaders !== undefined &&
    (!Array.isArray(value.redaction.additionalSensitiveHeaders) ||
      value.redaction.additionalSensitiveHeaders.some(
        (name) => typeof name !== "string" || name.trim().length === 0,
      ))
  )
    throw new TypeError("InboxTap report sensitive headers must be non-empty strings.");
}

function normalizeFormat(value: unknown): InboxTapReportFormat {
  if (value === "html" || value === "json") return value;
  throw new TypeError('InboxTap report format must be "html" or "json".');
}

function inferFormat(filePath: string): InboxTapReportFormat {
  const extension = extname(filePath).toLowerCase();
  if (extension === ".html" || extension === ".htm") return "html";
  if (extension === ".json") return "json";
  throw new TypeError("InboxTap report format could not be inferred from the file extension.");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type {
  InboxTapReportAssertion,
  InboxTapReportAssertionInput,
  InboxTapReportDocument,
  InboxTapReportFormat,
  InboxTapReportLimits,
  InboxTapReportMessage,
  InboxTapReportOptions,
  InboxTapReportRedactionOptions,
  InboxTapReportRenderOptions,
  InboxTapReportTruncation,
  InboxTapReportValue,
  InboxTapReportWriteOptions,
} from "./types.js";
