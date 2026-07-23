import type { TestInbox } from "../../src/client/index.js";
import type { InboxTapFixture } from "../../src/fixtures/index.js";
import type { CapturedEmail } from "../../src/types.js";

export const SENSITIVE_BODY = "private body marker";
export const SENSITIVE_TOKEN = "runner-secret-token";

export async function captureMatcherEmail(
  inboxTap: InboxTapFixture,
  inbox: TestInbox,
): Promise<CapturedEmail> {
  await inboxTap.transport.sendMail({
    from: "sender@example.test",
    headers: {
      "List-Unsubscribe": `<https://example.test/unsubscribe?token=${SENSITIVE_TOKEN}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `<p>${SENSITIVE_BODY}</p><a href="https://example.test/verify?token=${SENSITIVE_TOKEN}">Verify</a>`,
    subject: "Matcher delivery",
    text: `${SENSITIVE_BODY} https://example.test/verify?token=${SENSITIVE_TOKEN}`,
    to: inbox.address,
  });

  return inbox.waitForMessage({ subject: "Matcher delivery", timeoutMs: 2_000 });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
