import { readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";
import {
  InboxTapReport,
  type InboxTapReportDocument,
  type InboxTapReportValue,
} from "inboxtap/reports";
import { beforeAll, expect, test as baseTest } from "vitest";

const artifactsDirectory = fileURLToPath(new URL("../artifacts/", import.meta.url));
const jsonPath = fileURLToPath(new URL("../artifacts/verification-email.json", import.meta.url));
const htmlPath = fileURLToPath(new URL("../artifacts/verification-email.html", import.meta.url));

beforeAll(async () => {
  await rm(artifactsDirectory, { force: true, recursive: true });
});

const test = extendInboxTap(baseTest);

test("writes redacted evidence for a verification email", async ({ inbox, inboxTap }) => {
  const report = new InboxTapReport({
    redaction: {
      additionalSensitiveHeaders: ["X-Workflow-Secret"],
      patterns: [/account-\d+/giu],
    },
    title: "Verification email test report",
  });
  extendInboxTapExpect(expect, { recorder: report });

  const verificationUrl =
    "https://workflow-user:workflow-pass@app.example.test/verify/path-secret" +
    "?token=query-secret&next=account-42#fragment-secret";
  const privateSender = "Report Owner <report-owner@private.test>";
  const headerSecret = "workflow-header-secret";

  await inboxTap.transport.sendMail({
    from: privateSender,
    headers: {
      "X-Workflow-Secret": headerSecret,
    },
    html: [
      "<p>Verify account-42</p>",
      `<a href="${verificationUrl}">Verify email</a>`,
      '<img src="https://pixel.example.test/open?token=pixel-secret">',
    ].join(""),
    subject: "Verify account-42",
    text: `Verify account-42 at ${verificationUrl}`,
    to: inbox.address,
  });

  try {
    await expect(inbox).toHaveDeliveredOnce({
      quietMs: 50,
      subject: /verify/i,
    });
    const [email] = await inbox.messages();
    if (!email) throw new Error("Expected the verification email to be captured.");

    expect(email).toHaveRecipient(inbox.address);
    expect(email).toContainLink("/verify/");
    report.addAssertion({
      details: {
        account: "account-42",
        link: email.links[0] ?? verificationUrl,
        recipient: inbox.address,
      },
      message: "The application accepted the verification email.",
      messageId: email.id,
      name: "Application verification state",
      passed: true,
    });
  } finally {
    for (const message of await inbox.messages()) report.addMessage(message);
    await Promise.all([report.write(jsonPath), report.write(htmlPath)]);
  }

  const [json, html] = await Promise.all([readFile(jsonPath, "utf8"), readFile(htmlPath, "utf8")]);
  const document = JSON.parse(json) as InboxTapReportDocument;
  const applicationAssertion = document.assertions.find(
    (assertion) => assertion.source === "application",
  );
  const details = applicationAssertion?.details as Record<string, InboxTapReportValue> | undefined;
  const recipientAlias = document.messages[0]?.envelope.to[0];

  expect(json).toBe(report.render({ format: "json" }));
  expect(html).toBe(report.render({ format: "html" }));
  expect(document.schemaVersion).toBe(1);
  expect(document.protection).toEqual({
    rawIncluded: false,
    redaction: "best-effort",
  });
  expect(document.messages).toHaveLength(1);
  expect(document.messages[0]?.raw).toBeUndefined();
  expect(new Set(document.assertions.map((assertion) => assertion.source))).toEqual(
    new Set(["application", "matcher"]),
  );
  expect(recipientAlias).toMatch(/^email-\d{3}@example\.invalid$/u);
  expect(details?.recipient).toBe(recipientAlias);
  expect(html).toContain("Content-Security-Policy");
  expect(html).toContain("default-src 'none'");
  expect(html).toContain("&lt;p&gt;Verify [REDACTED CUSTOM]&lt;/p&gt;");
  expect(html).not.toMatch(/<(?:a|img|script)\b/iu);

  for (const secret of [
    inbox.address,
    "report-owner@private.test",
    "workflow-user",
    "workflow-pass",
    "path-secret",
    "query-secret",
    "fragment-secret",
    "pixel-secret",
    headerSecret,
    "account-42",
  ]) {
    expect(json).not.toContain(secret);
    expect(html).not.toContain(secret);
  }
});
