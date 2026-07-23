import { fitRenderedDocument } from "./fit-output.js";
import { estimateEscapedHtmlPrettyJsonBytes } from "./json-size.js";
import type {
  InboxTapReportAssertion,
  InboxTapReportDocument,
  InboxTapReportMessage,
} from "./types.js";

export function renderHtml(document: InboxTapReportDocument, limitBytes: number): string {
  return fitRenderedDocument(document, serializeHtml, limitBytes, estimateHtmlBytes);
}

function serializeHtml(document: InboxTapReportDocument): string {
  const assertionCards = document.assertions.map(renderAssertion).join("\n");
  const messageCards = document.messages.map(renderMessage).join("\n");
  const truncation = document.truncation;
  const wasTruncated =
    truncation.messagesOmitted > 0 ||
    truncation.assertionsOmitted > 0 ||
    truncation.fieldsTruncated > 0;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'none'; connect-src 'none'; media-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; style-src 'unsafe-inline'">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(document.title)}</title>
<style>
:root{color-scheme:light dark;font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.5}
body{margin:0 auto;max-width:72rem;padding:2rem}h1,h2{line-height:1.2}
.notice,.card{border:1px solid #8885;border-radius:.5rem;margin:1rem 0;padding:1rem}
.pass{border-left:.4rem solid #16803c}.fail{border-left:.4rem solid #c62828}
dl{display:grid;grid-template-columns:max-content 1fr;gap:.35rem 1rem}dt{font-weight:700}
pre{background:#8882;border-radius:.35rem;overflow-wrap:anywhere;padding:.75rem;white-space:pre-wrap}
table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #8885;padding:.35rem;text-align:left;vertical-align:top}
code{overflow-wrap:anywhere}
</style>
</head>
<body>
<main>
<h1>${escapeHtml(document.title)}</h1>
<p class="notice">This artifact uses best-effort redaction. Review it before sharing. Raw RFC source is ${document.protection.rawIncluded ? "included in redacted form" : "excluded"}.</p>
<section aria-labelledby="summary"><h2 id="summary">Summary</h2>
<dl><dt>Messages</dt><dd>${document.summary.messages.included} included, ${document.summary.messages.omitted} omitted</dd>
<dt>Assertions</dt><dd>${document.summary.assertions.passed} passed, ${document.summary.assertions.failed} failed, ${document.summary.assertions.omitted} omitted</dd></dl>
${wasTruncated ? `<p class="notice">Truncated: ${truncation.fieldsTruncated} field(s), ${truncation.utf8BytesOmittedExact ? `exactly ${truncation.utf8BytesOmitted}` : `at least ${truncation.utf8BytesOmitted}`} UTF-8 byte(s), ${truncation.messagesOmitted} message(s), ${truncation.assertionsOmitted} assertion(s).</p>` : ""}
</section>
<section aria-labelledby="assertions"><h2 id="assertions">Assertions</h2>
${assertionCards || "<p>No assertions recorded.</p>"}
</section>
<section aria-labelledby="messages"><h2 id="messages">Captured messages</h2>
${messageCards || "<p>No messages recorded.</p>"}
</section>
</main>
</body>
</html>
`;
}

function renderAssertion(assertion: InboxTapReportAssertion): string {
  return `<article class="card ${assertion.passed ? "pass" : "fail"}">
<h3>${escapeHtml(assertion.name)}</h3>
<dl><dt>Result</dt><dd>${assertion.passed ? "Passed" : "Failed"}</dd>
<dt>Source</dt><dd>${escapeHtml(assertion.source)}</dd>
${assertion.messageId ? `<dt>Message</dt><dd><code>${escapeHtml(assertion.messageId)}</code></dd>` : ""}</dl>
${assertion.message ? `<pre>${escapeHtml(assertion.message)}</pre>` : ""}
${assertion.details === undefined ? "" : `<pre>${escapeHtml(JSON.stringify(assertion.details, null, 2))}</pre>`}
</article>`;
}

function renderMessage(message: InboxTapReportMessage): string {
  const headerRows = Object.entries(message.headers)
    .map(
      ([name, value]) =>
        `<tr><th scope="row">${escapeHtml(name)}</th><td><code>${escapeHtml(value)}</code></td></tr>`,
    )
    .join("");
  const links = message.links.map((link) => `<li><code>${escapeHtml(link)}</code></li>`).join("");
  return `<article class="card">
<h3>${escapeHtml(message.subject || "(no subject)")}</h3>
<dl><dt>ID</dt><dd><code>${escapeHtml(message.id)}</code></dd>
<dt>Received</dt><dd>${escapeHtml(message.receivedAt)}</dd>
<dt>From</dt><dd>${escapeHtml(message.from)}</dd>
<dt>Envelope recipients</dt><dd>${escapeHtml(message.envelope.to.join(", "))}</dd>
<dt>Codes</dt><dd>${message.codeCount} redacted</dd></dl>
<h4>Headers</h4><table><tbody>${headerRows}</tbody></table>
<h4>Links</h4>${links ? `<ul>${links}</ul>` : "<p>None.</p>"}
<h4>Text</h4><pre>${escapeHtml(message.text)}</pre>
<h4>Captured HTML (escaped)</h4><pre>${escapeHtml(message.html)}</pre>
${message.raw === undefined ? "" : `<h4>Raw RFC source (redacted)</h4><pre>${escapeHtml(message.raw)}</pre>`}
</article>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function estimateHtmlBytes(document: InboxTapReportDocument): number {
  let total = 8_192 + document.messages.length * 2_048 + document.assertions.length * 1_024;
  total += escapedHtmlBytes(document.title) * 2;
  for (const assertion of document.assertions) {
    total += escapedHtmlBytes(assertion.name) + escapedHtmlBytes(assertion.source);
    if (assertion.messageId) total += escapedHtmlBytes(assertion.messageId);
    if (assertion.message) total += escapedHtmlBytes(assertion.message);
    if (assertion.details !== undefined)
      total += estimateEscapedHtmlPrettyJsonBytes(assertion.details);
  }
  for (const message of document.messages) {
    total += escapedHtmlBytes(message.subject || "(no subject)");
    total += escapedHtmlBytes(message.id);
    total += escapedHtmlBytes(message.receivedAt);
    total += escapedHtmlBytes(message.from);
    total += message.envelope.to.reduce(
      (bytes, recipient) => bytes + escapedHtmlBytes(recipient),
      Math.max(0, message.envelope.to.length - 1) * 2,
    );
    for (const [name, value] of Object.entries(message.headers)) {
      total += 128 + escapedHtmlBytes(name) + escapedHtmlBytes(value);
    }
    for (const link of message.links) total += 64 + escapedHtmlBytes(link);
    total += escapedHtmlBytes(message.text) + escapedHtmlBytes(message.html);
    if (message.raw !== undefined) total += escapedHtmlBytes(message.raw);
  }
  return total;
}

function escapedHtmlBytes(value: string): number {
  let bytes = 0;
  for (const character of value) {
    if (character === "&" || character === "'") bytes += 5;
    else if (character === "<" || character === ">") bytes += 4;
    else if (character === '"') bytes += 6;
    else bytes += Buffer.byteLength(character);
  }
  return bytes;
}
