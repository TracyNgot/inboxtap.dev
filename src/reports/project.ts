import type { InboxTapMatcherObservation } from "../matchers/index.js";
import { type OmittedByteMeasurement, recordOmittedBytes } from "./byte-accounting.js";
import {
  type PreparedReportMessage,
  type PreparedStringCollection,
  validateSourceMessageId,
} from "./message-input.js";
import { projectMatcherObservationDetails, requireMatcherObservation } from "./observation.js";
import { uniqueKey } from "./record-utils.js";
import { ReportRedactor } from "./redactor.js";
import type {
  InboxTapReportAssertion,
  InboxTapReportAssertionInput,
  InboxTapReportMessage,
  InboxTapReportOptions,
  MutableReportTruncation,
} from "./types.js";

export class ReportProjector {
  readonly #includeRaw: boolean;
  readonly #messageIds = new Map<string, string>();
  readonly #redactor: ReportRedactor;
  readonly #truncation: MutableReportTruncation;
  #assertionSequence = 0;

  constructor(options: InboxTapReportOptions, truncation: MutableReportTruncation) {
    this.#includeRaw = options.includeRaw ?? false;
    this.#truncation = truncation;
    this.#redactor = new ReportRedactor(options.redaction ?? {}, truncation);
  }

  redactTitle(title: string): string {
    return this.#redactor.redactText(title);
  }

  projectMessage(message: PreparedReportMessage): InboxTapReportMessage {
    const headers: Record<string, string> = {};
    for (const [name, value] of message.headers.entries) {
      const safeName = this.#redactor.redactText(name, 256);
      headers[uniqueKey(headers, safeName)] = this.#redactor.redactHeader(name, value);
    }
    if (message.headers.omitted) this.#recordOmission(message.headers.omittedBytes);

    const projected: InboxTapReportMessage = {
      codeCount: message.codeCount,
      envelope: {
        from: message.envelopeFrom ? this.#redactor.redactText(message.envelopeFrom) : null,
        to: this.#projectStrings(message.envelopeTo),
      },
      from: this.#redactor.redactText(message.from),
      headers,
      html: this.#redactor.redactText(message.html),
      id: this.messageId(message.id),
      links: this.#projectStrings(message.links),
      receivedAt: message.receivedAt,
      subject: this.#redactor.redactText(message.subject),
      text: this.#redactor.redactText(message.text),
      to: this.#projectStrings(message.to),
    };
    if (this.#includeRaw) projected.raw = this.#redactor.redactRaw(message.raw);
    return projected;
  }

  projectAssertion(input: InboxTapReportAssertionInput): InboxTapReportAssertion {
    if (!isObject(input)) throw new TypeError("InboxTap report assertion must be an object.");
    if (typeof input.name !== "string" || input.name.trim().length === 0)
      throw new TypeError("InboxTap report assertion name must be a non-empty string.");
    if (typeof input.passed !== "boolean")
      throw new TypeError("InboxTap report assertion passed must be a boolean.");
    if (input.message !== undefined && typeof input.message !== "string")
      throw new TypeError("InboxTap report assertion message must be a string.");
    validateSourceMessageId(input.messageId);

    return {
      ...(input.details === undefined
        ? {}
        : { details: this.#redactor.redactValue(input.details) }),
      id: this.#nextAssertionId(),
      ...(input.message === undefined ? {} : { message: this.#redactor.redactText(input.message) }),
      ...(input.messageId ? { messageId: this.messageId(input.messageId) } : {}),
      name: this.#redactor.redactText(input.name.trim()),
      passed: input.passed,
      source: "application",
    };
  }

  projectMatcherObservation(observation: InboxTapMatcherObservation): InboxTapReportAssertion {
    requireMatcherObservation(observation);
    const details = projectMatcherObservationDetails(observation);
    return {
      assertionPassed: observation.assertionPassed,
      details,
      id: this.#nextAssertionId(),
      ...(observation.messageId ? { messageId: this.messageId(observation.messageId) } : {}),
      name: observation.matcher,
      negated: observation.negated,
      passed: observation.assertionPassed,
      predicatePassed: observation.predicatePassed,
      source: "matcher",
    };
  }

  messageId(sourceId: string): string {
    validateSourceMessageId(sourceId);
    const existing = this.#messageIds.get(sourceId);
    if (existing) return existing;
    const id = `message-${String(this.#messageIds.size + 1).padStart(3, "0")}`;
    this.#messageIds.set(sourceId, id);
    return id;
  }

  #nextAssertionId(): string {
    this.#assertionSequence += 1;
    return `assertion-${String(this.#assertionSequence).padStart(4, "0")}`;
  }

  #projectStrings(collection: PreparedStringCollection): string[] {
    if (collection.omitted) this.#recordOmission(collection.omittedBytes);
    return collection.values.map((value) => this.#redactor.redactText(value, 4_096));
  }

  #recordOmission(omittedBytes: OmittedByteMeasurement): void {
    this.#truncation.fieldsTruncated += 1;
    recordOmittedBytes(this.#truncation, omittedBytes);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
