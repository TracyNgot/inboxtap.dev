# Redacted test reports with Vitest

Generate deterministic HTML and JSON evidence from a real SMTP delivery. This standalone Vitest
project records InboxTap matcher observations, an application assertion, and the captured message
while redacting common secrets and personal addresses.

## Prerequisites

- Bun 1.3 or later

## Setup

```bash
bun install --frozen-lockfile
```

InboxTap is pinned to `1.4.1`, which includes the report API and its custom-pattern URL
redaction hardening.

## Run the tests

```bash
bun run test
```

The test leaves its latest artifacts in `artifacts/verification-email.html` and
`artifacts/verification-email.json`. The directory is ignored by Git.

## What the example proves

The test sends a verification email through the dynamic Nodemailer transport and then:

- records `toHaveDeliveredOnce`, `toHaveRecipient`, and `toContainLink` observations;
- adds an explicit application assertion;
- captures the message without including its raw RFC source;
- writes deterministic, self-contained HTML and versioned JSON; and
- verifies that addresses, URL secrets, a sensitive header, and a caller-provided pattern are
  absent from both artifacts.

## Collect matcher observations

Create one collector for the test and pass it to the Vitest matcher adapter:

```ts
const report = new InboxTapReport({
  redaction: {
    additionalSensitiveHeaders: ["X-Workflow-Secret"],
    patterns: [/account-\d+/giu],
  },
});

extendInboxTapExpect(expect, { recorder: report });

await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify/");
```

Keep tests that replace the matcher recorder non-concurrent. A shared Vitest `expect` instance
cannot safely point concurrent tests at different collectors.

## Add messages and assertions

Application assertions can reference the captured message and include structured details. The
collector maps source message IDs to safe report IDs and redacts detail values:

```ts
report.addAssertion({
  details: {
    link: email.links[0],
    recipient: inbox.address,
  },
  messageId: email.id,
  name: "Application verification state",
  passed: true,
});

for (const message of await inbox.messages()) {
  report.addMessage(message);
}
```

## Write HTML and JSON

Write artifacts from `finally` so a failed matcher can still leave CI evidence:

```ts
try {
  await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
} finally {
  for (const message of await inbox.messages()) report.addMessage(message);
  await Promise.all([
    report.write("artifacts/verification-email.json"),
    report.write("artifacts/verification-email.html"),
  ]);
}
```

`render()` and `write()` produce the same deterministic bytes for the same collector state. The
HTML is static and self-contained, with captured markup escaped and a restrictive content security
policy.

## Redaction boundaries

Default reports exclude raw RFC source, pseudonymize email addresses consistently, redact sensitive
headers, URL credentials, every query value, fragments, semantic or opaque path secrets, common
tokens, and caller-provided patterns. Setting `includeRaw: true` includes only a redacted projection
of the source.

Redaction is best-effort, not a guarantee that arbitrary personal information can always be
detected. Review every artifact before sharing it, keep custom patterns and sensitive-header names
close to the application, and do not treat a report as a safe secret store.

## Artifact lifecycle

The example deletes stale artifacts at the start of the next test run, retains the newest run for
local inspection or CI upload, and ignores the directory in Git. Configure CI retention explicitly
and remove reports when they are no longer needed.

## Troubleshooting

- **No artifact appears after an assertion failure** — keep message collection and both `write()`
  calls inside `finally`.
- **A private value remains visible** — add a custom redaction pattern or sensitive-header name,
  rerun the test, and review both formats again.
- **Concurrent tests record each other's observations** — use a separate test file or serialize
  tests that install different recorders on the same Vitest `expect`.
- **The example resolves an unreleased API** — install with the committed lockfile and keep
  `inboxtap` pinned exactly to `1.4.1`.
