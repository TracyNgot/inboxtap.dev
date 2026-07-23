export type InboxTapReportFormat = "html" | "json";

export type InboxTapReportValue =
  | boolean
  | null
  | number
  | string
  | readonly InboxTapReportValue[]
  | { readonly [key: string]: InboxTapReportValue };

export interface InboxTapReportRedactionOptions {
  additionalSensitiveHeaders?: readonly string[];
  patterns?: readonly RegExp[];
}

export interface InboxTapReportOptions {
  includeRaw?: boolean;
  redaction?: InboxTapReportRedactionOptions;
  title?: string;
}

export interface InboxTapReportAssertionInput {
  details?: InboxTapReportValue;
  message?: string;
  messageId?: string;
  name: string;
  passed: boolean;
}

export interface InboxTapReportRenderOptions {
  format: InboxTapReportFormat;
}

export interface InboxTapReportWriteOptions {
  format?: InboxTapReportFormat;
}

export interface InboxTapReportMessage {
  codeCount: number;
  envelope: {
    from: string | null;
    to: string[];
  };
  from: string;
  headers: Record<string, string>;
  html: string;
  id: string;
  links: string[];
  raw?: string;
  receivedAt: string;
  subject: string;
  text: string;
  to: string[];
}

export interface InboxTapReportAssertion {
  assertionPassed?: boolean;
  details?: InboxTapReportValue;
  id: string;
  message?: string;
  messageId?: string;
  name: string;
  negated?: boolean;
  passed: boolean;
  predicatePassed?: boolean;
  source: "application" | "matcher";
}

export interface InboxTapReportTruncation {
  assertionsOmitted: number;
  fieldsTruncated: number;
  limitBytes: number;
  messagesOmitted: number;
  utf8BytesOmitted: number;
  utf8BytesOmittedExact: boolean;
}

export interface InboxTapReportDocument {
  assertions: InboxTapReportAssertion[];
  messages: InboxTapReportMessage[];
  protection: {
    rawIncluded: boolean;
    redaction: "best-effort";
  };
  schemaVersion: 1;
  summary: {
    assertions: {
      failed: number;
      included: number;
      omitted: number;
      passed: number;
    };
    messages: {
      included: number;
      omitted: number;
    };
  };
  title: string;
  truncation: InboxTapReportTruncation;
}

export interface InboxTapReportLimits {
  maxAssertions: 1_000;
  maxBytes: 10_485_760;
  maxMessages: 100;
}

export interface MutableReportTruncation {
  assertionsOmitted: number;
  fieldsTruncated: number;
  messagesOmitted: number;
  utf8BytesOmitted: number;
  utf8BytesOmittedExact: boolean;
}
