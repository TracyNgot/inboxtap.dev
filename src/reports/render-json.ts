import { fitRenderedDocument } from "./fit-output.js";
import { estimatePrettyJsonBytes } from "./json-size.js";
import type { InboxTapReportDocument } from "./types.js";

export function renderJson(document: InboxTapReportDocument, limitBytes: number): string {
  return fitRenderedDocument(
    document,
    serializeJson,
    limitBytes,
    (value) => estimatePrettyJsonBytes(value) + 1,
  );
}

function serializeJson(document: InboxTapReportDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
