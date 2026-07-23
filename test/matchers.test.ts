import { describe, expect, test } from "bun:test";
import {
  createInboxTapMatchers,
  type InboxTapMatcherObservation,
  inboxTapMatchers,
} from "../src/matchers/index.js";
import type { CapturedEmail } from "../src/types.js";

const positive = { isNot: false };
const negative = { isNot: true };

describe("toHaveDeliveredOnce", () => {
  test("asserts zero, one, and multiple-message snapshots", async () => {
    expect((await delivered(inbox([]))).pass).toBe(false);
    expect((await delivered(inbox([email()]))).pass).toBe(true);
    expect((await delivered(inbox([email(), email({ id: "message-2" })]))).pass).toBe(false);
  });

  test("filters subjects by case-insensitive substring and cloned regular expressions", async () => {
    const messages = [
      email({ id: "welcome", subject: "Welcome aboard" }),
      email({ id: "verify", subject: "VERIFY your account" }),
    ];
    expect((await delivered(inbox(messages), { subject: "verify YOUR" })).pass).toBe(true);

    const pattern = /verify/gi;
    pattern.lastIndex = 4;
    expect((await delivered(inbox(messages), { subject: pattern })).pass).toBe(true);
    expect(pattern.lastIndex).toBe(4);
  });

  test("observes a quiet window, forwards its cursor, and resnapshots after delivery", async () => {
    const first = email({ id: "first", subject: "Receipt" });
    const second = email({ id: "second", subject: "Receipt" });
    const calls: unknown[] = [];
    const received = changingInbox([[first], [first, second]], async (options) => {
      calls.push(options);
      return second;
    });

    const result = await delivered(received, { quietMs: 25, subject: "receipt" });
    expect(result.pass).toBe(false);
    expect(calls).toEqual([{ afterId: "first", timeoutMs: 25, subject: "receipt" }]);
  });

  test("handles an HTTP 408 as quiet and still resnapshots to close boundary races", async () => {
    const first = email({ id: "first" });
    const timeout = Object.assign(new Error("wait timed out"), { status: 408 });
    const quiet = changingInbox([[first], [first]], async () => {
      throw timeout;
    });
    expect((await delivered(quiet, { quietMs: 10 })).pass).toBe(true);

    const raced = changingInbox([[first], [first, email({ id: "raced" })]], async () => {
      throw timeout;
    });
    expect((await delivered(raced, { quietMs: 10 })).pass).toBe(false);

    const replaced = changingInbox([[first], [email({ id: "replacement" })]], async () => {
      throw timeout;
    });
    expect((await delivered(replaced, { quietMs: 10 })).pass).toBe(false);
  });

  test("fails when a newly observed delivery replaces the original before the final snapshot", async () => {
    const first = email({ id: "evicted" });
    const replacement = email({ id: "replacement" });
    const received = changingInbox([[first], [replacement]], async () => replacement);

    expect((await delivered(received, { quietMs: 10 })).pass).toBe(false);
  });

  test("does not open a quiet wait unless the initial snapshot has exactly one match", async () => {
    let waits = 0;
    const received = changingInbox([[]], async () => {
      waits += 1;
      return email();
    });
    expect((await delivered(received, { quietMs: 10 })).pass).toBe(false);
    expect(waits).toBe(0);
  });

  test("propagates non-timeout wait errors without recording an assertion", async () => {
    const observations: InboxTapMatcherObservation[] = [];
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const failure = new Error("connection failed");
    const received = changingInbox([[email()]], async () => {
      throw failure;
    });

    await expect(
      matchers.toHaveDeliveredOnce.call(positive, received, { quietMs: 10 }),
    ).rejects.toBe(failure);
    expect(observations).toEqual([]);
  });

  test("validates the subject and bounded integer quiet window", async () => {
    const received = inbox([email()]);
    const invalid = [
      null,
      [],
      { quietMs: -1 },
      { quietMs: 60_001 },
      { quietMs: 1.5 },
      { quietMs: Number.NaN },
      { subject: 42 },
    ];

    for (const options of invalid) {
      await expect(
        inboxTapMatchers.toHaveDeliveredOnce.call(
          positive,
          received,
          options as { quietMs?: number },
        ),
      ).rejects.toThrow("InboxTap matcher options are invalid.");
    }
    expect((await delivered(received, { quietMs: 60_000 })).pass).toBe(true);
  });

  test("keeps the positive predicate independent of negation", async () => {
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const observations: InboxTapMatcherObservation[] = [];
    const result = await matchers.toHaveDeliveredOnce.call(negative, inbox([email()]));

    expect(result.pass).toBe(true);
    expect(result.message()).toBe("Expected inbox not to contain exactly one matching delivery.");
    expect(observations[0]).toMatchObject({
      matcher: "toHaveDeliveredOnce",
      negated: true,
      predicatePassed: true,
      assertionPassed: false,
    });
  });
});

describe("captured-email matchers", () => {
  test("matches a trimmed, case-insensitive envelope recipient and ignores display recipients", () => {
    const captured = email({
      envelope: { from: "sender@example.test", to: [" Receiver@Example.Test "] },
      to: ["display-only@example.test"],
    });
    expect(
      inboxTapMatchers.toHaveRecipient.call(positive, captured, " receiver@example.test "),
    ).toMatchObject({ pass: true });
    expect(
      inboxTapMatchers.toHaveRecipient.call(positive, captured, "display-only@example.test"),
    ).toMatchObject({ pass: false });
  });

  test("searches every envelope recipient and fails when the address is absent", () => {
    const captured = email({
      envelope: {
        from: "sender@example.test",
        to: ["first@example.test", "second@example.test"],
      },
    });

    expect(
      inboxTapMatchers.toHaveRecipient.call(positive, captured, "SECOND@example.test").pass,
    ).toBe(true);
    expect(
      inboxTapMatchers.toHaveRecipient.call(positive, captured, "absent@example.test").pass,
    ).toBe(false);
  });

  test("matches link strings as substrings and regular expressions without mutating state", () => {
    const captured = email({
      links: [
        "https://app.example.test/help",
        "https://app.example.test/verify?token=super-secret",
      ],
    });
    expect(inboxTapMatchers.toContainLink.call(positive, captured, "/verify?")).toMatchObject({
      pass: true,
    });

    const pattern = /verify\?token=/g;
    pattern.lastIndex = 7;
    expect(inboxTapMatchers.toContainLink.call(positive, captured, pattern)).toMatchObject({
      pass: true,
    });
    expect(pattern.lastIndex).toBe(7);
  });

  test("parses case-varied and folded raw unsubscribe headers", () => {
    const captured = email({
      raw: [
        "Subject: Newsletter",
        "lIsT-uNsUbScRiBe: <mailto:leave@example.test>,",
        "\t<https://lists.example.test/unsubscribe?id=super-secret>",
        "LIST-UNSUBSCRIBE-POST:",
        " List-Unsubscribe=One-Click",
        "",
        "Body",
      ].join("\r\n"),
    });

    expect(inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, captured)).toMatchObject({
      pass: true,
    });
    expect(
      inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, captured, { oneClick: true }),
    ).toMatchObject({ pass: true });
  });

  test("parses duplicate unsubscribe headers with LF-only folding", () => {
    const captured = email({
      raw: [
        "List-Unsubscribe: <mailto:leave@example.test>",
        "list-unsubscribe:",
        " <https://lists.example.test/unsubscribe>",
        "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
        "",
        "Body",
      ].join("\n"),
    });

    expect(
      inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, captured, { oneClick: true }).pass,
    ).toBe(true);
  });

  test("enforces the complete one-click header pair and a valid bracketed HTTPS target", () => {
    const cases: CapturedEmail[] = [
      email({
        raw: [
          "List-Unsubscribe: <mailto:leave@example.test>",
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
          "",
          "Body",
        ].join("\r\n"),
      }),
      email({
        raw: [
          "List-Unsubscribe: <https://lists.example.test/leave>",
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click; mode=extra",
          "",
          "Body",
        ].join("\r\n"),
      }),
      email({
        raw: [
          "List-Unsubscribe: https://lists.example.test/not-bracketed",
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
          "",
          "Body",
        ].join("\r\n"),
      }),
      email({
        raw: [
          "List-Unsubscribe: <http://lists.example.test/not-secure>",
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
          "",
          "Body",
        ].join("\r\n"),
      }),
      email({
        raw: [
          "List-Unsubscribe: <https://not a url>",
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
          "",
          "Body",
        ].join("\r\n"),
      }),
    ];

    for (const captured of cases) {
      expect(
        inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, captured, { oneClick: true }).pass,
      ).toBe(false);
    }
  });

  test("reads only the raw top header block", () => {
    const captured = email({
      headers: { "list-unsubscribe": "<https://normalized.example.test/leave>" },
      raw: [
        "Subject: Body spoof",
        "",
        "List-Unsubscribe: <https://body.example.test/leave>",
        "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
      ].join("\r\n"),
    });

    expect(inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, captured).pass).toBe(false);
  });

  test("keeps predicate results positive under negation", () => {
    const captured = email();
    const recipient = inboxTapMatchers.toHaveRecipient.call(
      negative,
      captured,
      "receiver@example.test",
    );
    expect(recipient.pass).toBe(true);
    expect(recipient.message()).toBe(
      "Expected captured email envelope not to include the recipient; inspected 1 envelope recipient(s).",
    );
  });

  test("reports positive link and unsubscribe predicates independently under negation", () => {
    const observations: InboxTapMatcherObservation[] = [];
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const captured = email({
      links: ["https://example.test/verify"],
      raw: "List-Unsubscribe: <mailto:leave@example.test>\r\n\r\nBody",
    });

    expect(matchers.toContainLink.call(negative, captured, "verify").pass).toBe(true);
    expect(matchers.toHaveUnsubscribeHeader.call(negative, captured).pass).toBe(true);
    expect(observations).toMatchObject([
      {
        matcher: "toContainLink",
        predicatePassed: true,
        negated: true,
        assertionPassed: false,
      },
      {
        matcher: "toHaveUnsubscribeHeader",
        predicatePassed: true,
        negated: true,
        assertionPassed: false,
      },
    ]);
  });
});

describe("validation, diagnostics, and observations", () => {
  test("uses constant receiver TypeErrors without inspecting secret input", async () => {
    const secret = { body: "private-body", token: "super-secret" };
    await expect(inboxTapMatchers.toHaveDeliveredOnce.call(positive, secret)).rejects.toThrow(
      "toHaveDeliveredOnce() expects an InboxTap TestInbox as the received value.",
    );

    const calls = [
      () => inboxTapMatchers.toHaveRecipient.call(positive, secret, "person@example.test"),
      () => inboxTapMatchers.toContainLink.call(positive, secret, "token"),
      () => inboxTapMatchers.toHaveUnsubscribeHeader.call(positive, secret),
    ];
    for (const call of calls) {
      expect(call).toThrow("This InboxTap matcher expects a CapturedEmail as the received value.");
    }
  });

  test("rejects empty matcher inputs before recording", () => {
    const observations: InboxTapMatcherObservation[] = [];
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const captured = email();

    expect(() => matchers.toHaveRecipient.call(positive, captured, " \t")).toThrow(
      "toHaveRecipient() expects a non-empty address string.",
    );
    expect(() => matchers.toContainLink.call(positive, captured, "  ")).toThrow(
      "toContainLink() expects a string or RegExp.",
    );
    expect(() =>
      matchers.toHaveUnsubscribeHeader.call(positive, captured, {
        oneClick: "yes" as unknown as boolean,
      }),
    ).toThrow("InboxTap matcher options are invalid.");
    expect(observations).toEqual([]);
  });

  test("records exactly once and exposes only bounded, non-sensitive diagnostics", async () => {
    const observations: InboxTapMatcherObservation[] = [];
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const captured = email({
      envelope: { from: "sender@example.test", to: ["private-person@example.test"] },
      html: "<p>private-body super-secret</p>",
      links: ["https://app.example.test/verify?token=super-secret"],
      raw: "Subject: Private\r\n\r\nprivate-body super-secret",
      text: "private-body super-secret",
    });

    const recipient = matchers.toHaveRecipient.call(
      positive,
      captured,
      "missing-person@example.test",
    );
    const link = matchers.toContainLink.call(positive, captured, "missing-token");
    const unsubscribe = matchers.toHaveUnsubscribeHeader.call(positive, captured, {
      oneClick: true,
    });
    const once = await matchers.toHaveDeliveredOnce.call(positive, inbox([captured, email()]));
    recipient.message();
    recipient.message();

    expect(observations).toHaveLength(4);
    expect(Object.keys(recipient).sort()).toEqual(["message", "pass"]);
    const publicOutput = JSON.stringify({
      messages: [recipient.message(), link.message(), unsubscribe.message(), once.message()],
      observations,
    });
    for (const sensitive of [
      "private-body",
      "super-secret",
      "private-person@example.test",
      "missing-person@example.test",
      "missing-token",
      "https://app.example.test",
    ]) {
      expect(publicOutput).not.toContain(sensitive);
    }
    expect(publicOutput).not.toContain('"actual"');
    expect(publicOutput).not.toContain('"expected"');
  });

  test("records safe matcher-specific observation fields and final assertion outcomes", () => {
    const observations: InboxTapMatcherObservation[] = [];
    const matchers = createInboxTapMatchers({
      recorder: { recordMatcherObservation: (item) => observations.push(item) },
    });
    const captured = email({
      links: ["https://example.test/one"],
      raw: "List-Unsubscribe: <mailto:leave@example.test>\r\n\r\nBody",
    });

    matchers.toHaveRecipient.call(negative, captured, "missing@example.test");
    matchers.toContainLink.call(positive, captured, /missing/);
    matchers.toHaveUnsubscribeHeader.call(positive, captured);

    expect(observations).toEqual([
      {
        schemaVersion: 1,
        kind: "matcher",
        matcher: "toHaveRecipient",
        negated: true,
        predicatePassed: false,
        assertionPassed: true,
        messageId: "message-1",
        details: { envelopeRecipientCount: 1 },
      },
      {
        schemaVersion: 1,
        kind: "matcher",
        matcher: "toContainLink",
        negated: false,
        predicatePassed: false,
        assertionPassed: false,
        messageId: "message-1",
        details: { patternKind: "regexp", linkCount: 1 },
      },
      {
        schemaVersion: 1,
        kind: "matcher",
        matcher: "toHaveUnsubscribeHeader",
        negated: false,
        predicatePassed: true,
        assertionPassed: true,
        messageId: "message-1",
        details: {
          oneClickRequired: false,
          hasListUnsubscribe: true,
          hasHttpsTarget: false,
          hasOneClickPost: false,
        },
      },
    ]);
  });

  test("propagates recorder exceptions for synchronous and asynchronous matchers", async () => {
    const failure = new Error("report collector failed");
    const matchers = createInboxTapMatchers({
      recorder: {
        recordMatcherObservation: () => {
          throw failure;
        },
      },
    });

    expect(() => matchers.toHaveRecipient.call(positive, email(), "receiver@example.test")).toThrow(
      failure,
    );
    await expect(matchers.toHaveDeliveredOnce.call(positive, inbox([email()]))).rejects.toBe(
      failure,
    );
  });
});

function delivered(
  received: unknown,
  options: { subject?: string | RegExp; quietMs?: number } = {},
) {
  return inboxTapMatchers.toHaveDeliveredOnce.call(positive, received, options);
}

function inbox(messages: CapturedEmail[]) {
  return {
    address: "fixture@example.test",
    messages: async () => messages,
    waitForMessage: async () => {
      throw Object.assign(new Error("wait timed out"), { status: 408 });
    },
  };
}

function changingInbox(
  snapshots: CapturedEmail[][],
  waitForMessage: (options: unknown) => Promise<CapturedEmail>,
) {
  let index = 0;
  return {
    address: "fixture@example.test",
    messages: async () => snapshots[Math.min(index++, snapshots.length - 1)] ?? [],
    waitForMessage,
  };
}

function email(overrides: Partial<CapturedEmail> = {}): CapturedEmail {
  return {
    id: "message-1",
    receivedAt: "2026-07-23T12:00:00.000Z",
    envelope: { from: "sender@example.test", to: ["receiver@example.test"] },
    from: "Sender <sender@example.test>",
    to: ["Receiver <receiver@example.test>"],
    subject: "Welcome",
    headers: {},
    text: "Hello",
    html: "<p>Hello</p>",
    links: [],
    codes: [],
    raw: "Subject: Welcome\r\n\r\nHello",
    ...overrides,
  };
}
