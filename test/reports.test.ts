import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { InboxTapMatcherObservation } from "../src/matchers/index.js";
import { sourceValueBytes } from "../src/reports/byte-accounting.js";
import {
  INBOXTAP_REPORT_LIMITS,
  InboxTapReport,
  type InboxTapReportDocument,
} from "../src/reports/index.js";
import type { CapturedEmail } from "../src/types.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("InboxTapReport", () => {
  test("renders deterministic versioned JSON with every default redaction surface", () => {
    const customPattern = /customer-\d+/giu;
    customPattern.lastIndex = 4;
    const report = new InboxTapReport({
      title: "Report for owner@example.test",
      redaction: {
        additionalSensitiveHeaders: ["X-Private"],
        patterns: [customPattern],
      },
    });
    report
      .addMessage(
        message({
          from: "Owner <owner@example.test>",
          codes: ["123456"],
          headers: {
            Authorization: "Bearer short-secret",
            "List-Unsubscribe":
              "<https://mailer.example.test/unsubscribe?token=query-secret#fragment-secret>",
            "X-Private": "short-private-value",
          },
          html: `<img src="https://pixel.example.test/open?token=pixel-secret"><p>customer-42 eyJabc.def.ghi</p>`,
          links: [
            "https://app.example.test/reset/abcdefghijklmnopqrstuvwxyzABCDEF?token=query-secret#fragment-secret",
          ],
          raw: "Cookie: sid=raw-secret\r\n\r\nraw body secret",
          subject: "Code 123456 for owner@example.test",
          text: "Bearer abcdefghijklmnopqrstuvwxyz123456 customer-42",
        }),
      )
      .addAssertion({
        details: {
          email: "owner@example.test",
          link: "https://app.example.test/path?credential=assertion-secret#private",
          token: "short-assertion-secret",
        },
        message: "customer-42 belongs to owner@example.test",
        messageId: "source-message-id",
        name: "Application customer-42",
        passed: true,
      });

    const first = report.render({ format: "json" });
    const second = report.render({ format: "json" });
    const document = JSON.parse(first) as InboxTapReportDocument;

    expect(first).toBe(second);
    expect(document.schemaVersion).toBe(1);
    expect(document.protection).toEqual({
      rawIncluded: false,
      redaction: "best-effort",
    });
    expect(document.messages[0]?.raw).toBeUndefined();
    expect(document.messages[0]?.id).toBe("message-001");
    expect(document.assertions[0]?.messageId).toBe("message-001");
    expect(document.messages[0]?.codeCount).toBe(1);
    expect(first).toContain("email-001@example.invalid");
    expect(first).toContain("[REDACTED HEADER]");
    for (const secret of [
      "owner@example.test",
      "query-secret",
      "fragment-secret",
      "pixel-secret",
      "short-private-value",
      "short-assertion-secret",
      "customer-42",
      "eyJabc.def.ghi",
      "123456",
      "source-message-id",
    ])
      expect(first).not.toContain(secret);
    expect(customPattern.lastIndex).toBe(4);
  });

  test("redacts raw folded headers and preserves pseudonyms across raw and structured fields", () => {
    const report = new InboxTapReport({ includeRaw: true });
    report.addMessage(
      message({
        envelope: { from: "alice@example.test", to: ["reader@example.test"] },
        from: "Alice <alice@example.test>",
        raw: [
          "From: Alice <alice@example.test>",
          "COOKIE: session=short",
          "\tcontinued-secret",
          "X-Note: alice@example.test",
          "",
          "Hello alice@example.test",
        ].join("\r\n"),
      }),
    );

    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;
    const captured = document.messages[0];
    expect(captured?.raw).toContain("COOKIE: [REDACTED HEADER]");
    expect(captured?.raw).not.toContain("continued-secret");
    expect(captured?.raw).not.toContain("session=short");
    const alias = captured?.from.match(/email-\d{3}@example\.invalid/u)?.[0];
    expect(alias).toBeDefined();
    expect(captured?.raw).toContain(alias as string);
  });

  test("bounds unique email pseudonyms with a deterministic overflow alias", () => {
    const addresses = Array.from({ length: 400 }, (_, index) => `person-${index}@example.test`);
    const report = new InboxTapReport();
    report.addMessage(
      message({
        headers: {},
        text: addresses.join(" "),
      }),
    );

    const first = report.render({ format: "json" });
    expect(first).toBe(report.render({ format: "json" }));
    expect(first).toContain("email-256@example.invalid");
    expect(first).toContain("email-overflow@example.invalid");
    expect(first).not.toContain("email-257@example.invalid");
    expect(first).not.toContain("person-399@example.test");
  });

  test("rejected messages cannot consume aliases, IDs, or truncation state", () => {
    const report = new InboxTapReport();
    expect(() =>
      report.addMessage(
        message({
          from: "Poison <poison@example.test>",
          headers: { From: "poison@example.test" },
          id: "x".repeat(1_025),
        }),
      ),
    ).toThrow("message ID is invalid");
    expect(() =>
      report.addMessage(
        message({
          from: "Poison <second-poison@example.test>",
          headers: { From: "second-poison@example.test" },
          id: "valid-source-id",
          receivedAt: "not-a-timestamp",
          text: "😀".repeat(10_000),
        }),
      ),
    ).toThrow("receivedAt");

    report.addMessage(
      message({
        envelope: { from: "safe@example.test", to: ["safe@example.test"] },
        from: "safe@example.test",
        headers: {},
        id: "accepted-source-id",
        raw: "",
        to: ["safe@example.test"],
      }),
    );
    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;

    expect(document.messages[0]?.id).toBe("message-001");
    expect(document.messages[0]?.from).toBe("email-001@example.invalid");
    expect(document.truncation.fieldsTruncated).toBe(0);
    expect(document.truncation.utf8BytesOmitted).toBe(0);
    expect(document.truncation.utf8BytesOmittedExact).toBe(true);
    expect(JSON.stringify(document)).not.toContain("poison");
  });

  test("projects matcher observations through their safe v1 whitelist", () => {
    const report = new InboxTapReport();
    const observation = {
      assertionPassed: true,
      details: { envelopeRecipientCount: 2 },
      kind: "matcher",
      matcher: "toHaveRecipient",
      messageId: "private-source-id",
      negated: true,
      predicatePassed: false,
      schemaVersion: 1,
      smuggledBody: "never-print-this",
    } as unknown as InboxTapMatcherObservation;

    report.recordMatcherObservation(observation);
    report.addMessage(message({ id: "private-source-id" }));
    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;

    expect(document.assertions[0]).toEqual({
      assertionPassed: true,
      details: { envelopeRecipientCount: 2 },
      id: "assertion-0001",
      messageId: "message-001",
      name: "toHaveRecipient",
      negated: true,
      passed: true,
      predicatePassed: false,
      source: "matcher",
    });
    expect(JSON.stringify(document)).not.toContain("never-print-this");
    expect(JSON.stringify(document)).not.toContain("private-source-id");
  });

  test("rejects malformed and inconsistent observations", () => {
    const report = new InboxTapReport();
    const base = {
      assertionPassed: true,
      details: { envelopeRecipientCount: 1 },
      kind: "matcher",
      matcher: "toHaveRecipient",
      negated: false,
      predicatePassed: true,
      schemaVersion: 1,
    };
    expect(() =>
      report.recordMatcherObservation({
        ...base,
        schemaVersion: 2,
      } as unknown as InboxTapMatcherObservation),
    ).toThrow("observation is invalid");
    expect(() =>
      report.recordMatcherObservation({
        ...base,
        assertionPassed: false,
      } as InboxTapMatcherObservation),
    ).toThrow("pass state is inconsistent");
    expect(() =>
      report.recordMatcherObservation({
        ...base,
        details: { envelopeRecipientCount: -1 },
      } as InboxTapMatcherObservation),
    ).toThrow("details are invalid");
    for (const matcher of [["toHaveRecipient"], { toString: () => "toHaveRecipient" }]) {
      expect(() =>
        report.recordMatcherObservation({
          ...base,
          matcher,
        } as unknown as InboxTapMatcherObservation),
      ).toThrow("observation is invalid");
    }
  });

  test("redacts quoted secrets, URL credentials, encoded values, and short path tokens", () => {
    const report = new InboxTapReport({ includeRaw: true });
    report.addMessage(
      message({
        headers: {
          "X-Note": `token="header-short" and "secret":"json-short" and "access_token":"header-access" and refresh_token='header-refresh'`,
        },
        html: `<p>"token":"html-short" "refresh_token":"html-refresh"</p><a href="HTTPS://app.example.test/path?access_token=HTML-UPPER#HTML-FRAGMENT">open</a>`,
        links: [
          "https://private-user:private-pass@app.example.test/verify/tiny?next=%252Fprivate&token=s%65cret#fragment-value",
          "https://app.example.test/token/short-path-value",
          "HTTPS://app.example.test/reset/tiny?access_token=UPPER-QUERY#UPPER-FRAGMENT",
          "HtTpS://app.example.test/path?refresh_token=Mixed-Query#Mixed-Fragment",
        ],
        raw: `X-Note: token="raw-header-short" access_token="raw-access"\r\n\r\n"secret":"raw-body-short" "refresh_token":"raw-refresh"`,
        text: `token="text-short" and "password": "json-password" and "access_token":"text-access" refresh_token='text-refresh'`,
      }),
    );
    report.addAssertion({
      details: {
        access_token: "structured-access",
        refresh_token: "structured-refresh",
      },
      name: "Token variants",
      passed: true,
    });

    const output = report.render({ format: "json" });
    for (const secret of [
      "header-short",
      "json-short",
      "html-short",
      "private-user",
      "private-pass",
      "%252Fprivate",
      "fragment-value",
      "short-path-value",
      "raw-header-short",
      "raw-body-short",
      "text-short",
      "json-password",
      "header-access",
      "header-refresh",
      "html-refresh",
      "HTML-UPPER",
      "HTML-FRAGMENT",
      "UPPER-QUERY",
      "UPPER-FRAGMENT",
      "Mixed-Query",
      "Mixed-Fragment",
      "raw-access",
      "raw-refresh",
      "text-access",
      "text-refresh",
      "structured-access",
      "structured-refresh",
    ])
      expect(output).not.toContain(secret);
    const document = JSON.parse(output) as InboxTapReportDocument;
    expect(document.messages[0]?.links).toEqual([
      "https://app.example.test/verify/redacted?next=redacted&token=redacted#redacted",
      "https://app.example.test/token/redacted",
      "https://app.example.test/reset/redacted?access_token=redacted#redacted",
      "https://app.example.test/path?refresh_token=redacted#redacted",
    ]);
  });

  test("fully replaces malformed URLs instead of leaking short query or fragment values", () => {
    const report = new InboxTapReport();
    report.addMessage(
      message({
        links: ["https://[invalid]?token=short-secret#short-fragment"],
        text: "Open https://[invalid]?access_token=tiny#private-fragment",
      }),
    );

    const output = report.render({ format: "json" });
    expect(output).toContain("[REDACTED URL]");
    for (const secret of ["short-secret", "short-fragment", "tiny", "private-fragment"])
      expect(output).not.toContain(secret);
  });

  test("bounds recursive assertion data without invoking accessors", () => {
    const details: Record<string, unknown> = {};
    details.aSelf = details;
    Object.defineProperty(details, "bAccessor", {
      enumerable: true,
      get() {
        throw new Error("must not invoke report detail accessors");
      },
    });
    let nested: Record<string, unknown> = {};
    details.cNested = nested;
    for (let depth = 0; depth < 12; depth += 1) {
      const next: Record<string, unknown> = {};
      nested.child = next;
      nested = next;
    }
    details.password = "nested-short-secret";

    const report = new InboxTapReport();
    report.addAssertion({
      details: details as never,
      name: "Recursive details",
      passed: false,
    });
    const output = report.render({ format: "json" });

    expect(output).toContain("[CIRCULAR VALUE]");
    expect(output).toContain("[ACCESSOR OMITTED]");
    expect(output).toContain("maximum depth reached");
    expect(output).not.toContain("nested-short-secret");
  });

  test("bounds forged message collections before validating or projecting their tails", () => {
    const links = Array.from({ length: 100_000 }, () => "ordinary tail");
    Object.defineProperty(links, "75", {
      configurable: true,
      get() {
        throw new Error("must not invoke omitted array accessors");
      },
    });
    const headers = Object.fromEntries(
      Array.from({ length: 2_000 }, (_, index) => [`X-Header-${index}`, "ordinary value"]),
    );
    const report = new InboxTapReport();
    report.addMessage(message({ headers, links }));

    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;
    expect(document.messages[0]?.links).toHaveLength(50);
    expect(Object.keys(document.messages[0]?.headers ?? {})).toHaveLength(50);
    expect(document.truncation.fieldsTruncated).toBeGreaterThanOrEqual(2);
    expect(document.truncation.utf8BytesOmitted).toBeGreaterThan(0);
    expect(document.truncation.utf8BytesOmittedExact).toBe(false);
  });

  test("counts inherited and accessor properties against bounded scan budgets", () => {
    const prototype = Object.create(null) as Record<string, unknown>;
    for (let index = 0; index < 2_000; index += 1) {
      Object.defineProperty(prototype, `inherited-${index}`, {
        enumerable: true,
        get() {
          throw new Error("must not invoke inherited report accessors");
        },
      });
    }
    const details = Object.create(prototype) as Record<string, unknown>;
    details.visible = "ordinary value";
    const headers = Object.create(prototype) as Record<string, string>;
    headers["X-Visible"] = "ordinary header";

    expect(sourceValueBytes(details).exact).toBe(false);
    const report = new InboxTapReport();
    report.addAssertion({ details: details as never, name: "Prototype scan", passed: true });
    report.addMessage(message({ headers }));
    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;

    expect(document.truncation.utf8BytesOmittedExact).toBe(false);
    expect(document.assertions[0]?.details).toMatchObject({
      "[TRUNCATED]": "Additional fields omitted",
      visible: "ordinary value",
    });
    expect(document.messages[0]?.headers["X-Visible"]).toBe("ordinary header");
  });

  test("caps projected object keys before JSON and HTML escaping", () => {
    const longName = '"\\\u0001&'.repeat(100_000);
    const report = new InboxTapReport();
    report.addAssertion({
      details: { [longName]: "ordinary value" },
      name: "Long key",
      passed: true,
    });

    const json = report.render({ format: "json" });
    const document = JSON.parse(json) as InboxTapReportDocument;
    const projectedDetails = document.assertions[0]?.details as Record<string, unknown>;
    const projectedName = Object.keys(projectedDetails)[0] ?? "";
    expect(Buffer.byteLength(projectedName)).toBeLessThanOrEqual(256);
    expect(projectedName).toEndWith("[TRUNCATED]");
    expect(document.truncation.utf8BytesOmittedExact).toBe(true);
    expect(Buffer.byteLength(report.render({ format: "html" }))).toBeLessThanOrEqual(
      INBOXTAP_REPORT_LIMITS.maxBytes,
    );
  });

  test("accounts exact UTF-8 bytes for omitted collection and value entries", () => {
    const droppedLink = "😀".repeat(100);
    const messageReport = new InboxTapReport();
    messageReport.addMessage(
      message({
        links: [...Array.from({ length: 50 }, () => "https://app.example.test/safe"), droppedLink],
      }),
    );
    const messageDocument = JSON.parse(
      messageReport.render({ format: "json" }),
    ) as InboxTapReportDocument;
    expect(messageDocument.truncation.utf8BytesOmitted).toBe(Buffer.byteLength(droppedLink));
    expect(messageDocument.truncation.utf8BytesOmittedExact).toBe(true);
    expect(messageReport.render({ format: "html" })).toContain(
      `exactly ${Buffer.byteLength(droppedLink)} UTF-8 byte(s)`,
    );

    const valueReport = new InboxTapReport();
    valueReport.addAssertion({
      details: Array.from({ length: 51 }, () => "🧪") as never,
      name: "Bounded values",
      passed: true,
    });
    const valueDocument = JSON.parse(
      valueReport.render({ format: "json" }),
    ) as InboxTapReportDocument;
    expect(valueDocument.truncation.utf8BytesOmitted).toBe(8);
    expect(valueDocument.truncation.utf8BytesOmittedExact).toBe(true);
  });

  test("reports a measured lower bound without traversing an unbounded value tail", () => {
    const report = new InboxTapReport();
    report.addAssertion({
      details: Array.from({ length: 100_000 }, () => "tail") as never,
      name: "Large bounded tail",
      passed: true,
    });

    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;
    expect(document.truncation.utf8BytesOmitted).toBeGreaterThan(0);
    expect(document.truncation.utf8BytesOmitted).toBeLessThan(400_000);
    expect(document.truncation.utf8BytesOmittedExact).toBe(false);
    const details = document.assertions[0]?.details;
    expect(Array.isArray(details)).toBe(true);
    expect((details as unknown[]).length).toBeLessThan(102);
    expect(report.render({ format: "html" })).toMatch(/at least \d+ UTF-8 byte\(s\)/u);
  });

  test("marks sparse and null-heavy bounded tails as inexact", () => {
    for (const details of [new Array(100_000), new Array(100_000).fill(null)]) {
      const report = new InboxTapReport();
      report.addAssertion({
        details: details as never,
        name: "Sparse bounded tail",
        passed: true,
      });

      const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;
      expect(document.truncation.utf8BytesOmittedExact).toBe(false);
      expect(document.truncation.utf8BytesOmitted).toBeGreaterThanOrEqual(0);
    }
  });

  test("renders captured HTML as inert escaped text", () => {
    const report = new InboxTapReport();
    report.addMessage(
      message({
        html: `</pre><script>alert("x")</script><img src="https://remote.example/pixel">`,
      }),
    );
    const html = report.render({ format: "html" });

    expect(html).toStartWith("<!doctype html>");
    expect(html).toEndWith("</html>\n");
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<a ");
    expect(html).toContain("Review it before sharing");
  });

  test("caps message and assertion counts with explicit truncation", () => {
    const report = new InboxTapReport();
    for (let index = 0; index <= INBOXTAP_REPORT_LIMITS.maxMessages; index += 1)
      report.addMessage(message({ id: `message-source-${index}` }));
    for (let index = 0; index <= INBOXTAP_REPORT_LIMITS.maxAssertions; index += 1)
      report.addAssertion({ name: `assertion ${index}`, passed: index % 2 === 0 });

    const document = JSON.parse(report.render({ format: "json" })) as InboxTapReportDocument;
    expect(document.messages).toHaveLength(100);
    expect(document.assertions).toHaveLength(1_000);
    expect(document.truncation.messagesOmitted).toBe(1);
    expect(document.truncation.assertionsOmitted).toBe(1);
    expect(document.summary.messages).toEqual({ included: 100, omitted: 1 });
    expect(document.summary.assertions.omitted).toBe(1);
  });

  test("keeps expansion-heavy HTML valid and within the exact UTF-8 byte cap", () => {
    const report = new InboxTapReport();
    const expansionHeavy = "&".repeat(20_000);
    for (let index = 0; index < INBOXTAP_REPORT_LIMITS.maxMessages; index += 1) {
      report.addMessage(
        message({
          html: expansionHeavy,
          id: `large-message-${index}`,
          text: expansionHeavy,
        }),
      );
    }

    const html = report.render({ format: "html" });
    expect(Buffer.byteLength(html)).toBeLessThanOrEqual(INBOXTAP_REPORT_LIMITS.maxBytes);
    expect(html).toStartWith("<!doctype html>");
    expect(html).toEndWith("</html>\n");
    expect(html).toContain("Truncated:");
  }, 30_000);

  test("keeps expansion-heavy JSON valid and within the exact UTF-8 byte cap", () => {
    const report = new InboxTapReport();
    const expansionHeavy = '"\\\u0001'.repeat(2_000);
    const headers = Object.fromEntries(
      Array.from({ length: 50 }, (_, index) => [`X-Large-${index}`, expansionHeavy]),
    );
    for (let index = 0; index < INBOXTAP_REPORT_LIMITS.maxMessages; index += 1)
      report.addMessage(message({ headers, id: `json-large-${index}` }));

    const json = report.render({ format: "json" });
    const repeated = report.render({ format: "json" });
    const document = JSON.parse(json) as InboxTapReportDocument;
    expect(Buffer.byteLength(json)).toBeLessThanOrEqual(INBOXTAP_REPORT_LIMITS.maxBytes);
    expect(document.truncation.fieldsTruncated).toBeGreaterThan(0);
    expect(repeated).toBe(json);
    expect(json).toContain("\\u0001");
  }, 30_000);

  test("drops collections during JSON preflight when all strings are short", () => {
    const report = new InboxTapReport();
    const shortValue = '"\\\u0001'.repeat(25);
    const details = Array.from({ length: 49 }, () => shortValue);
    for (let index = 0; index < INBOXTAP_REPORT_LIMITS.maxAssertions; index += 1)
      report.addAssertion({
        details,
        name: `Short values ${index}`,
        passed: true,
      });

    const json = report.render({ format: "json" });
    const document = JSON.parse(json) as InboxTapReportDocument;
    expect(Buffer.byteLength(json)).toBeLessThanOrEqual(INBOXTAP_REPORT_LIMITS.maxBytes);
    expect(document.assertions.length).toBeLessThan(INBOXTAP_REPORT_LIMITS.maxAssertions);
    expect(document.truncation.assertionsOmitted).toBeGreaterThan(0);
  }, 30_000);

  test("preflights escaped assertion-detail keys before rendering HTML", () => {
    const report = new InboxTapReport();
    const details = Object.fromEntries(
      Array.from({ length: 40 }, (_, index) => [`${'"&<>\u0001\\'.repeat(35)}-${index}`, true]),
    );
    for (let index = 0; index < 300; index += 1)
      report.addAssertion({
        details,
        name: `Escaped details ${index}`,
        passed: true,
      });

    const html = report.render({ format: "html" });
    expect(Buffer.byteLength(html)).toBeLessThanOrEqual(INBOXTAP_REPORT_LIMITS.maxBytes);
    expect(html).toStartWith("<!doctype html>");
    expect(html).toEndWith("</html>\n");
    expect(html).toMatch(/Truncated:[^<]*, [1-9]\d* assertion\(s\)\./u);
  }, 30_000);

  test("truncates Unicode only at complete code-point boundaries", () => {
    const report = new InboxTapReport();
    const sourceHtml = "🧪".repeat(10_000);
    const sourceText = "😀".repeat(10_000);
    report.addMessage(
      message({
        html: sourceHtml,
        text: sourceText,
      }),
    );
    const json = report.render({ format: "json" });
    const document = JSON.parse(json) as InboxTapReportDocument;

    expect(json).not.toContain("\uFFFD");
    expect(document.messages[0]?.text).toEndWith("[TRUNCATED]");
    expect(document.messages[0]?.html).toEndWith("[TRUNCATED]");
    const retainedHtml = document.messages[0]?.html.replace(/\[TRUNCATED\]$/u, "") ?? "";
    const retainedText = document.messages[0]?.text.replace(/\[TRUNCATED\]$/u, "") ?? "";
    expect(document.truncation.utf8BytesOmitted).toBe(
      Buffer.byteLength(sourceHtml) -
        Buffer.byteLength(retainedHtml) +
        Buffer.byteLength(sourceText) -
        Buffer.byteLength(retainedText),
    );
  });

  test("writes the same deterministic bytes produced by render", async () => {
    const directory = await mkdtemp(join(tmpdir(), "inboxtap-report-"));
    temporaryDirectories.push(directory);
    const report = new InboxTapReport();
    report.addAssertion({ name: "Completed", passed: true });

    const jsonPath = join(directory, "nested", "report.json");
    await report.write(jsonPath);
    expect(await readFile(jsonPath, "utf8")).toBe(report.render({ format: "json" }));

    const htmlPath = join(directory, "report.html");
    await report.write(htmlPath, { format: "html" });
    expect(await readFile(htmlPath, "utf8")).toBe(report.render({ format: "html" }));
  });

  test("validates options, assertions, messages, formats, and output paths", async () => {
    expect(() => new InboxTapReport({ title: "" })).toThrow("title");
    expect(
      () =>
        new InboxTapReport({
          redaction: { patterns: ["not-a-regexp" as unknown as RegExp] },
        }),
    ).toThrow("regular expressions");
    const report = new InboxTapReport();
    expect(() => report.addAssertion({ name: "", passed: true })).toThrow("non-empty string");
    expect(() => report.addMessage({ id: "invalid" } as CapturedEmail)).toThrow("CapturedEmail");
    expect(() => report.render({ format: "xml" as "json" })).toThrow("format");
    await expect(report.write("report.unknown")).rejects.toThrow("could not be inferred");
  });
});

function message(overrides: Partial<CapturedEmail> = {}): CapturedEmail {
  return {
    codes: [],
    envelope: {
      from: "sender@example.test",
      to: ["reader@example.test"],
    },
    from: "Sender <sender@example.test>",
    headers: {
      From: "Sender <sender@example.test>",
      To: "reader@example.test",
    },
    html: "<p>Hello</p>",
    id: "source-message-id",
    links: [],
    raw: "From: sender@example.test\r\nTo: reader@example.test\r\n\r\nHello",
    receivedAt: "2026-07-23T12:00:00.000Z",
    subject: "Hello",
    text: "Hello",
    to: ["reader@example.test"],
    ...overrides,
  };
}
