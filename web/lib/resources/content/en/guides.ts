import { magicLinkSnippet, otpResendSnippet, passwordResetSnippet } from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const guidesEn = {
  "guides/test-magic-links": {
    cta: {
      description:
        "Put the link into a real browser flow with isolated recipients, parallel workers, bounded waits, and runner-owned cleanup.",
      label: "Read the Playwright guide",
      title: "Drive the link through the browser",
    },
    description:
      "Capture each magic-link email locally, validate its trusted destination, open it in the browser, and test single-use behavior without exposing tokens.",
    eyebrow: "Authentication testing guide",
    intro:
      "A complete magic-link test proves more than delivery. It verifies that the application generated a link for the intended recipient, that the URL points to an allowed destination, and that redeeming the secret creates exactly the session and redirect the product promises.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guides",
    sections: [
      {
        id: "define-the-contract-before-the-test",
        title: "Define the contract before the test",
        paragraphs: [
          "Record the expected sender, subject family, callback origin, callback path, expiry, signup behavior, and post-login destination. A provider may call several passwordless mechanisms a magic link, but the application remains responsible for the exact URL and account policy.",
          "Decide whether an unknown address may create an account. Better Auth's magic-link plugin, for example, permits signup by default unless disableSignUp is enabled. The test should encode the product decision rather than inherit a provider default accidentally.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Better Auth magic-link behavior",
          },
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Supabase passwordless email behavior",
          },
        ],
      },
      {
        id: "use-a-new-recipient-for-every-case",
        title: "Use a new recipient for every case",
        paragraphs: [
          "Create the InboxTap inbox inside the test and enter inbox.address into the real sign-in form or API request. The generated recipient lets concurrent tests share one capture server while every read remains filtered to its own SMTP envelope.",
          "Avoid a suite-wide mailbox and avoid clearing all messages in beforeEach. Global cleanup creates races, while a unique address preserves the evidence needed to diagnose a failed redirect or duplicate delivery.",
        ],
      },
      {
        code: {
          filename: "magic-link.spec.ts",
          language: "typescript",
          source: magicLinkSnippet,
        },
        id: "extract-and-validate-before-navigation",
        title: "Extract and validate before navigation",
        paragraphs: [
          "waitForLink() searches captured text and HTML for HTTP or HTTPS links and can require a stable path fragment. Templates often contain support, privacy, logo, and unsubscribe URLs, so a contains filter prevents the test from following the first unrelated link.",
          "Treat the returned value as a credential. Parse it with URL, compare the complete expected origin, and compare the callback path before navigation. Do not use a loose hostname suffix check, print the query string, or place the token in the test title.",
        ],
      },
      {
        id: "assert-the-session-not-only-the-page",
        title: "Assert the session, not only the page",
        paragraphs: [
          "After opening the link, verify the final URL and a server-backed indication of the authenticated identity. A visible success message alone can pass while the session cookie, user identity, or authorization state is wrong.",
          "Also check the intended redirect and whether the email address became verified when the authentication provider combines ownership proof with verification. Those outcomes belong to the application assertion, while InboxTap only proves what crossed SMTP.",
        ],
      },
      {
        id: "cover-replay-expiry-and-wrong-recipient",
        title: "Cover replay, expiry, and recipient failures",
        paragraphs: [
          "Redeem the same URL a second time and assert the configured single-use behavior. Exercise expiry with the provider's supported clock or short test configuration rather than an unbounded sleep. A malformed or modified token should fail without creating a session.",
          "If the product binds a link to an email or pending transaction, prove that it cannot authenticate a different account. Do not attempt to test this by swapping InboxTap addresses alone; make the assertion against the application's session and stored identity.",
        ],
        bullets: [
          "A valid link establishes only the expected account and redirect.",
          "A replayed, expired, or modified token is rejected.",
          "Failure pages and logs do not echo the secret value.",
        ],
      },
      {
        id: "keep-evidence-token-safe",
        title: "Keep evidence token-safe",
        paragraphs: [
          "InboxTap matcher diagnostics do not include bodies or token-bearing URL values. Redacted reports remove common secret surfaces and pseudonymize addresses, but redaction is best-effort. Review an artifact before sharing it outside the test environment.",
          "Prefer assertions on URL origin, path, parameter presence, and final application state. Avoid snapshots of the raw email, browser address bar, or full captured link when a smaller structural assertion proves the same behavior.",
        ],
      },
    ],
    slug: "test-magic-links",
    title: "How to test magic links end to end",
  },
  "guides/test-email-otp": {
    cta: {
      description:
        "Use the SDK reference to choose the right wait pattern, distinguish successive messages, inspect captured content, and add safe matcher diagnostics.",
      label: "Explore the client SDK",
      title: "Adapt the recipe to your OTP format",
    },
    description:
      "Capture email OTPs as strings, submit them through the real application flow, and test expiry, retries, and resend behavior deterministically.",
    eyebrow: "Authentication testing guide",
    intro:
      "An email OTP test should preserve the code exactly as delivered, submit it through the same endpoint or form a user would use, and verify the provider's expiry, attempt, and resend rules. InboxTap supplies the isolated recipient and bounded wait; the application test proves the authentication outcome.",
    kind: "guides",
    relatedDocKey: "reference/client-sdk",
    section: "guides",
    sections: [
      {
        id: "write-down-the-otp-contract",
        title: "Write down the OTP contract",
        paragraphs: [
          "Confirm the code length and alphabet, validity period, maximum attempts, resend strategy, and whether requesting a second code invalidates the first. Do not label six digits as a universal OTP standard: Better Auth defaults to six but allows configuration, and Supabase accepts lengths from six through ten digits.",
          "Keep the value as a string throughout the test. Numeric conversion drops leading zeroes and can make a valid code impossible to enter exactly as the user received it.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Better Auth email-OTP options",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config#authemailotp_length",
            label: "Supabase email OTP length",
          },
        ],
      },
      {
        id: "capture-the-first-code",
        title: "Capture the first code",
        paragraphs: [
          "Create an inbox for the test, trigger the application's send-code action, and call waitForCode() with a subject filter. Its default expression matches a six-digit value in the captured text or HTML; provide a regular expression or string pattern when the application uses another format.",
          "Submit the returned string through the real verification form or endpoint, then assert the authenticated identity and session. A test that only finds digits in an email does not prove that the backend accepts the intended code.",
        ],
      },
      {
        code: {
          filename: "email-otp.test.ts",
          language: "typescript",
          source: otpResendSnippet,
        },
        id: "distinguish-a-resent-message",
        title: "Distinguish a resent message",
        paragraphs: [
          "Capture the first complete message and retain its ID. After requesting another code, waitForMessage() with afterId returns a later delivery; extract the new code from that specific message as shown.",
          "Do not use waitForCode({ afterId }) for this assertion. The helper first scans existing messages for a matching value, so it can return the earlier code before its long-poll request applies afterId. Waiting for the second message makes the delivery boundary explicit.",
        ],
      },
      {
        id: "test-rotation-and-attempt-limits",
        title: "Test rotation and attempt limits",
        paragraphs: [
          "When the configured resend strategy rotates codes, prove that the first code fails and the second succeeds. If the provider deliberately reuses an unexpired code, assert that behavior instead. Avoid making a product guarantee from whichever default happened to be installed.",
          "Submit invalid values up to the configured limit and confirm that the next attempt is rejected as documented. Use application responses and stored session state for this assertion; InboxTap does not implement or observe the provider's verification counter.",
        ],
      },
      {
        id: "handle-longer-and-custom-codes",
        title: "Handle longer and custom codes",
        paragraphs: [
          "CapturedEmail.codes is a parser convenience for unique four- through eight-digit sequences. A custom waitForCode() pattern scans the message body directly, so use it for a nine- or ten-digit Supabase code or an application-specific alphanumeric format.",
          "Make the regular expression narrow enough to avoid dates, support numbers, and unrelated identifiers in the template. A stable subject plus a format-specific boundary is safer than selecting the first sequence of digits.",
        ],
      },
      {
        id: "test-expiry-with-a-controlled-clock",
        title: "Test expiry with a controlled clock",
        paragraphs: [
          "Prefer a provider-supported virtual clock, injected time source, or short test-only expiry. Sleeping for the complete production lifetime makes the suite slow and still leaves timing races around the boundary.",
          "The expired code should fail without creating or extending a session. Requesting a fresh code after expiry should follow the documented resend policy and produce a distinguishable delivery.",
        ],
      },
      {
        id: "avoid-secret-output",
        title: "Avoid secret output",
        paragraphs: [
          "Do not include the OTP in test names, assertion messages, screenshots, or routine logs. Assert its shape and the resulting application state instead of snapshotting the complete email body.",
          "If a CI artifact is necessary, use InboxTap's bounded report collector with project-specific redaction patterns and review the result. Best-effort token detection cannot guarantee that every custom personal or secret value was found.",
        ],
      },
    ],
    slug: "test-email-otp",
    title: "How to test email OTP flows",
  },
  "guides/test-password-reset-emails": {
    cta: {
      description:
        "Use the Playwright guide to connect the isolated reset recipient, captured URL, browser form, and final session assertions.",
      label: "Read the Playwright guide",
      title: "Exercise the reset in a real browser",
    },
    description:
      "Test the complete password-reset flow locally: safe public responses, trusted reset links, password replacement, token replay, and session behavior.",
    eyebrow: "Authentication testing guide",
    intro:
      "Password-reset email is a privileged account-recovery channel. A useful test covers the public request response, the message sent to the real known user, the trust boundary of the reset URL, the password change, and the fate of the token and existing sessions.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guides",
    sections: [
      {
        id: "start-with-two-public-request-cases",
        title: "Start with two public request cases",
        paragraphs: [
          "Create a known user whose address is a fresh InboxTap recipient, then submit a reset request for that account. Submit the same public form with a separate unknown address and compare the status and user-facing response.",
          "The endpoint should not reveal whether an account exists. Avoid exact elapsed-time equality in a browser suite because scheduler and database noise make that assertion brittle; use the provider's security guidance and focused lower-level tests for timing mitigations.",
        ],
        links: [
          {
            href: "https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html",
            label: "OWASP Forgot Password Cheat Sheet",
          },
        ],
      },
      {
        code: {
          filename: "password-reset.spec.ts",
          language: "typescript",
          source: passwordResetSnippet,
        },
        id: "validate-the-reset-destination",
        title: "Validate the reset destination",
        paragraphs: [
          "Wait for a URL containing the application's reset path, then parse it before navigation. Compare the exact expected origin and pathname so a malformed base URL, untrusted host, or incorrect callback cannot be hidden by a browser redirect.",
          "Treat the full URL as a bearer credential. Do not print it, interpolate it into the test title, or attach an unredacted browser screenshot that exposes the address bar.",
        ],
      },
      {
        id: "prove-the-password-was-replaced",
        title: "Prove the password was replaced",
        paragraphs: [
          "Complete the real reset form using a password that meets the application's current policy. Then sign out or create a clean browser context, confirm that the old password fails, and confirm that the new password authenticates the same account.",
          "Check server-backed identity or session state rather than relying only on a success banner. Also assert validation for a weak or mismatched new password when that logic is part of the reset page.",
        ],
      },
      {
        id: "reject-replay-expiry-and-tampering",
        title: "Reject replay, expiry, and tampering",
        paragraphs: [
          "Attempt to reuse the successfully redeemed URL and verify that it cannot change the password again. Exercise an expired token with a controlled clock or test-specific lifetime, and alter the token to prove that malformed input is rejected.",
          "Failure should not expose the token, password policy internals, or account details in the page or routine server logs. The user may receive a safe path to request a new reset instead.",
        ],
      },
      {
        id: "assert-the-session-policy",
        title: "Assert the session policy",
        paragraphs: [
          "Decide whether a password reset revokes existing sessions, only other sessions, or none. Better Auth, for example, exposes revokeSessionsOnPasswordReset rather than imposing one result for every application.",
          "Create the relevant pre-reset sessions and inspect them after the change. InboxTap cannot infer this policy from the email; it must be asserted against the authentication system.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email#password-reset-email",
            label: "Better Auth password-reset email documentation",
          },
        ],
      },
      {
        id: "separate-delivery-from-business-deduplication",
        title: "Separate delivery from business deduplication",
        paragraphs: [
          "Use toHaveDeliveredOnce() after the first reset message is known to exist when the product promises one delivery for one request. Its optional quiet window can observe an immediate retry but does not prove that no later job will run.",
          "Queue persistence, idempotency keys, rate limiting, and deduplication belong to application tests. InboxTap can inject a 451 or disconnect to trigger those paths and can show which SMTP attempts completed, but it does not own the job system.",
        ],
      },
      {
        id: "produce-minimal-safe-evidence",
        title: "Produce minimal, safe evidence",
        paragraphs: [
          "Prefer evidence that records the assertion result, pseudonymized participants, URL shape, and final application outcome without retaining the reusable secret. Exclude raw RFC source unless a specific debugging need outweighs the disclosure risk.",
          "InboxTap reports redact common token and address surfaces, escape captured markup, and remain bounded, but redaction is explicitly best-effort. Add project-specific patterns and review the artifact before sharing it.",
        ],
      },
    ],
    slug: "test-password-reset-emails",
    title: "How to test password reset emails end to end",
  },
} satisfies Partial<ResourceContentDictionary>;
