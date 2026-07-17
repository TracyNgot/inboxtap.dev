import { expect, test } from "bun:test";
import { Readable } from "node:stream";
import { parseIncomingEmail } from "../src/parser.js";

test("parses multipart mail, decoded links, and verification codes", async () => {
  const email = await parseIncomingEmail(
    Readable.from([
      [
        "From: Product <hello@example.test>",
        "To: person@example.test",
        "Subject: Verify your account",
        "Content-Type: multipart/alternative; boundary=part",
        "",
        "--part",
        "Content-Type: text/plain; charset=utf-8",
        "",
        "Use code 482910 or visit https://app.example.test/verify?token=abc.",
        "--part",
        "Content-Type: text/html; charset=utf-8",
        "",
        '<p>Open <a href="https://app.example.test/verify?token=abc&amp;next=welcome">your link</a>.</p>',
        "--part--",
      ].join("\r\n"),
    ]),
    { from: "sender@example.test", to: ["person@example.test"] },
  );

  expect(email.subject).toBe("Verify your account");
  expect(email.from).toContain("hello@example.test");
  expect(email.links).toContain("https://app.example.test/verify?token=abc&next=welcome");
  expect(email.codes).toEqual(["482910"]);
  expect(email.raw).toContain("multipart/alternative");
});

test("keeps malformed mail inspectable", async () => {
  const email = await parseIncomingEmail(
    Readable.from(["this is not a complete RFC 822 message"]),
    {
      from: null,
      to: ["person@example.test"],
    },
  );

  expect(email.subject).toBe("");
  expect(email.raw).toContain("not a complete");
  expect(email.to).toEqual(["person@example.test"]);
});
