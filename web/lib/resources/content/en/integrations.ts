import {
  betterAuthCallbackSnippet,
  cypressTaskSnippet,
  nodemailerFixtureSnippet,
  playwrightFixtureSnippet,
  supabaseMagicLinkSnippet,
  vitestFixtureSnippet,
} from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const integrationsEn = {
  "integrations/playwright": {
    cta: {
      description:
        "See the complete browser-flow recipe, including fixed-port service startup, OTP entry, parallel workers, and troubleshooting.",
      label: "Read the Playwright guide",
      title: "Build the complete Playwright flow",
    },
    description:
      "Start InboxTap in a Playwright worker fixture, give every test a unique inbox, and test verification links, OTPs, and password resets in parallel.",
    eyebrow: "Playwright integration",
    intro:
      "InboxTap connects Playwright's browser actions to the email produced by the real application. Its adapter owns one local SMTP/API server per worker and injects a new recipient into every test, so parallel email flows remain deterministic without a shared hosted mailbox.",
    kind: "integrations",
    relatedDocKey: "guides/playwright",
    section: "integrations",
    sections: [
      {
        id: "match-the-fixture-to-the-lifecycle",
        title: "Match the fixture to Playwright's lifecycle",
        paragraphs: [
          "Import the adapter from inboxtap/fixtures/playwright and extend your existing Playwright test. The injected inboxTap value has worker scope, while inbox has test scope. Playwright therefore starts the local service once for a worker but still gives every test a distinct SMTP envelope recipient.",
          "This follows Playwright's native dependency model: a fixture is prepared only when a test or another fixture needs it, and a dependency is started before its consumer and torn down after that consumer. InboxTap uses that ordering to close its verified Nodemailer transport and listeners even when a test fails.",
        ],
        links: [
          {
            href: "https://playwright.dev/docs/test-fixtures",
            label: "Playwright fixture documentation",
          },
        ],
      },
      {
        code: {
          filename: "tests/fixtures.ts",
          language: "typescript",
          source: playwrightFixtureSnippet,
        },
        id: "start-the-application-after-inboxtap",
        title: "Start the application after InboxTap",
        paragraphs: [
          "When the application needs an automatically selected SMTP port, start it as a worker fixture that depends on inboxTap. Read inboxTap.smtp while creating the process or mail transport; it contains the assigned host and port plus secure: false and ignoreTLS: true.",
          "Playwright's webServer configuration starts before test fixtures exist. An application launched there cannot consume a port selected later by the InboxTap fixture. Use dependent fixtures for dynamic ports, or deliberately use fixed ports and start both services through webServer.",
        ],
      },
      {
        id: "drive-the-real-email-flow",
        title: "Drive the real email flow",
        paragraphs: [
          "Fill the application's form with inbox.address, submit it through the browser, and wait from the Node-side test for the expected link, code, or complete message. The browser never needs mailbox credentials and does not import the InboxTap SDK.",
          "Use waitForLink() for verification, magic-link, and reset URLs; waitForCode() for numeric codes; and waitForMessage() when the assertion needs headers, HTML, or envelope recipients. Validate a captured URL's expected origin and path before asking the page to open it.",
        ],
        bullets: [
          "Create the recipient inside each test or consume the injected inbox fixture.",
          "Set InboxTap's timeout below Playwright's test timeout so the useful email error appears first.",
          "Filter messages by a stable subject or link path when a template contains several URLs.",
        ],
      },
      {
        id: "keep-parallel-workers-isolated",
        title: "Keep parallel workers isolated",
        paragraphs: [
          "Isolation comes from the SMTP envelope recipient, not from clearing a global mailbox. Every injected inbox has a generated address, and all of its SDK calls filter on that address. Concurrent tests can therefore share a worker service without claiming one another's messages.",
          "Do not create one module-level TestInbox for an entire suite. Also avoid global clearing while other tests are active: deleting shared server state can remove a message that another recipient is still waiting for.",
        ],
      },
      {
        id: "assert-delivery-without-leaking-secrets",
        title: "Assert delivery without leaking secrets",
        paragraphs: [
          "The Playwright matcher adapter returns an extended expect object. Use it for toHaveDeliveredOnce(), toHaveRecipient(), and toContainLink() when a concise assertion is clearer than inspecting fields manually.",
          "toHaveDeliveredOnce() observes the current mailbox snapshot; it does not wait for the first message. Await the application delivery or call waitForMessage() first when email is dispatched in the background. Matcher failures intentionally omit message bodies, recipient values, and token-bearing links.",
        ],
      },
      {
        id: "know-what-the-integration-does-not-own",
        title: "Keep application behavior in the application test",
        paragraphs: [
          "InboxTap proves what reached the local SMTP boundary and helps extract the value needed by the browser. Your Playwright test still owns the product assertions: whether a token is single-use, whether an expired link is rejected, whether a retry creates duplicate business records, and whether the final session has the expected permissions.",
        ],
      },
    ],
    slug: "playwright",
    title: "Email testing with Playwright and InboxTap",
  },
  "integrations/cypress": {
    cta: {
      description:
        "Follow the full Cypress setup with link and OTP tasks, timeout coordination, parallel isolation, and direct HTTP alternatives.",
      label: "Read the Cypress guide",
      title: "Connect the tasks to a browser flow",
    },
    description:
      "Run InboxTap's Node SDK through cy.task(), keep task payloads JSON-safe, and test email links and OTPs with a fresh address per test.",
    eyebrow: "Cypress integration",
    intro:
      "Cypress spec code runs in a browser context, while InboxTap's SDK performs local HTTP requests from Node. A small set of cy.task() handlers provides a deliberate bridge between those environments without bundling server-only code into the application under test.",
    kind: "integrations",
    relatedDocKey: "guides/cypress",
    section: "integrations",
    sections: [
      {
        id: "respect-the-browser-node-boundary",
        title: "Respect the browser and Node boundary",
        paragraphs: [
          "Create the InboxTapClient in cypress.config.ts inside Cypress's Node process. Register tasks in setupNodeEvents, then call those tasks from the spec to create a recipient and wait for a captured value.",
          "Do not import inboxtap/client directly into a browser spec. Keeping network access in the task process also means the local API does not need CORS support or exposure to the tested page.",
        ],
      },
      {
        code: {
          filename: "cypress.config.ts",
          language: "typescript",
          source: cypressTaskSnippet,
        },
        id: "register-small-serializable-tasks",
        title: "Register small, serializable tasks",
        paragraphs: [
          "Return plain strings such as the generated address, captured URL, or OTP. Cypress serializes every task argument and result, so pass subject filters and regular-expression patterns as strings rather than RegExp objects, functions, or class instances.",
          "A task handler must return a value or a promise that resolves to a value. Cypress treats undefined as an unhandled task; return null explicitly for a command that has no result.",
        ],
        links: [
          {
            href: "https://docs.cypress.io/api/commands/task",
            label: "Cypress cy.task() documentation",
          },
        ],
      },
      {
        id: "create-one-address-per-test",
        title: "Create one address per test",
        paragraphs: [
          "Call the createInbox task inside the individual test, then enter that exact address into the application. Subsequent wait tasks reconstruct a TestInbox from the address and apply recipient filtering on the server.",
          "A fresh recipient is more reliable than clearing a shared mailbox in beforeEach. It preserves evidence for debugging and prevents parallel specs from deleting or reading one another's messages.",
        ],
      },
      {
        id: "coordinate-two-timeouts",
        title: "Coordinate the task and command timeouts",
        paragraphs: [
          "InboxTap's wait helper has its own timeoutMs, while cy.task() has a Cypress command timeout. Give the outer Cypress timeout a little more time than the InboxTap wait. If delivery fails, the task then rejects with the email-specific context instead of Cypress replacing it with a generic command timeout.",
          "Keep both waits bounded. A slow test should fail with enough context to identify whether the application skipped sending, used the wrong SMTP port, or sent to a different recipient.",
        ],
      },
      {
        id: "choose-the-sdk-or-direct-http",
        title: "Choose the SDK or direct HTTP",
        paragraphs: [
          "cy.request() can reach InboxTap's loopback HTTP API through Cypress's Node-side proxy and is adequate for a small endpoint assertion. The SDK tasks are usually preferable because TestInbox scans existing and newly arriving messages, filters by recipient, and extracts links or codes.",
          "Whichever approach you choose, keep InboxTap bound to loopback and start it alongside the application before Cypress begins. The integration is for local and CI processes on the same runner, not for exposing an unauthenticated mailbox service.",
        ],
      },
    ],
    slug: "cypress",
    title: "Email testing with Cypress and InboxTap",
  },
  "integrations/vitest": {
    cta: {
      description:
        "See every runner adapter, matcher behavior, fault controller, reporting workflow, and cleanup guarantee in one guide.",
      label: "Read the test-runner guide",
      title: "Use the rest of the Vitest toolkit",
    },
    description:
      "Use a file-scoped InboxTap server, a test-scoped inbox, native matchers, and automatic cleanup in concurrent Vitest email tests.",
    eyebrow: "Vitest integration",
    intro:
      "InboxTap's Vitest adapter maps the expensive service lifecycle to file scope and recipient isolation to test scope. Tests receive a verified Nodemailer transport, dynamic connection settings, and a new inbox address without maintaining custom beforeAll and afterAll hooks.",
    kind: "integrations",
    relatedDocKey: "guides/test-runners",
    section: "integrations",
    sections: [
      {
        id: "use-the-official-adapter",
        title: "Use the official Vitest adapter",
        paragraphs: [
          "Install InboxTap, Nodemailer 9, and Vitest, then extend the base test from inboxtap/fixtures/vitest. The adapter starts SMTP and HTTP listeners on operating-system-assigned ports, verifies its transport before yielding, and closes partial or complete startup state when the file scope ends.",
          "The package keeps Vitest behind an optional subpath. Importing the InboxTap root or client SDK does not load Vitest or Nodemailer into projects that do not use this fixture.",
        ],
        links: [
          {
            href: "https://vitest.dev/guide/test-context.html",
            label: "Vitest fixture and test-context documentation",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: vitestFixtureSnippet,
        },
        id: "combine-fixtures-and-native-matchers",
        title: "Combine fixtures and native matchers",
        paragraphs: [
          "The injected inboxTap fixture is shared only by tests in one file. Its transport is useful for testing a mail template directly, while inboxTap.smtp can configure an application instance that should exercise the full integration boundary.",
          "Register the matcher adapter with Vitest's expect object. Await toHaveDeliveredOnce() because it can observe a bounded quiet window; message-level recipient and link matchers remain synchronous.",
        ],
      },
      {
        id: "wait-before-taking-a-snapshot",
        title: "Wait before taking a delivery snapshot",
        paragraphs: [
          "toHaveDeliveredOnce() checks messages that already exist. Sending through the provided transport resolves after InboxTap accepts and stores the transaction, so the immediate snapshot in the example is valid. When the application queues email and returns earlier, first await inbox.waitForMessage(), then assert the delivery count.",
          "quietMs can detect an extra delivery during that explicit observation window, but it cannot prove that a later retry will never occur. Longer-term idempotency remains an application-level assertion.",
        ],
      },
      {
        id: "run-concurrent-tests-safely",
        title: "Run concurrent tests safely",
        paragraphs: [
          "Every test receives a generated address even when test.concurrent cases share the same file-scoped server. Recipient filtering keeps mailbox reads independent, so there is no need to serialize tests or clear global state between them.",
          "Target SMTP fault rules to inbox.address when concurrent tests share a fixture. An untargeted next-transaction rule can legitimately be consumed by whichever delivery reaches DATA first.",
        ],
      },
      {
        id: "exercise-failure-paths",
        title: "Exercise failure paths at the SMTP boundary",
        paragraphs: [
          "Use inboxTap.server.faults to return a transient 451, a permanent 550, a bounded delay, a pause gate, or a chunk-granular disconnect. Failed and disconnected transactions do not create partial captured messages.",
          "InboxTap controls delivery behavior rather than your persistence layer. Tests should still verify the application's retry limit, backoff, deduplication, user-visible state, and business records.",
        ],
      },
      {
        id: "scope-report-recorders-carefully",
        title: "Scope report recorders carefully",
        paragraphs: [
          "The Vitest matcher adapter extends an expect object in place. Do not attach different per-test report collectors to one shared expect while concurrent tests are running. Use the test-bound expect supplied by Vitest, record messages explicitly, or intentionally build one suite-level report.",
        ],
      },
    ],
    slug: "vitest",
    title: "Email testing with Vitest and InboxTap",
  },
  "integrations/better-auth": {
    cta: {
      description:
        "Follow the complete Next.js and Playwright setup for verification, magic-link sign-in, OTP delivery, and resend behavior.",
      label: "Read the Better Auth guide",
      title: "Run the authentication flows end to end",
    },
    description:
      "Route Better Auth verification, magic-link, OTP, and password-reset callbacks into InboxTap, then test the real authentication flow with isolated inboxes.",
    eyebrow: "Better Auth integration",
    intro:
      "Better Auth gives the application callbacks for producing authentication email; it does not choose an SMTP transport for you. Point the sender used by those callbacks at InboxTap, then drive the real signup, sign-in, verification, and reset endpoints from a browser or integration test.",
    kind: "integrations",
    relatedDocKey: "guides/better-auth",
    section: "integrations",
    sections: [
      {
        id: "map-each-email-callback",
        title: "Map each email callback",
        paragraphs: [
          "Email verification uses emailVerification.sendVerificationEmail, password reset uses emailAndPassword.sendResetPassword, and the magic-link and email-OTP plugins expose sendMagicLink and sendVerificationOTP. Route each callback through the same local sender so the test observes the template your application actually constructs.",
          "Keep the generated URL or OTP unchanged. Rebuilding an authentication URL inside the test can hide configuration errors in callback URLs, redirect allowlists, token encoding, and templates.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email",
            label: "Better Auth email documentation",
          },
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Better Auth magic-link documentation",
          },
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Better Auth email-OTP documentation",
          },
        ],
      },
      {
        code: {
          filename: "lib/auth.ts",
          language: "typescript",
          source: betterAuthCallbackSnippet,
        },
        id: "send-through-the-local-transport",
        title: "Send through the local transport",
        paragraphs: [
          "Implement sendLocalEmail with a Nodemailer transport configured for InboxTap: localhost, the selected SMTP port, secure: false, ignoreTLS: true, and no auth field. In a fixture-based test, inject inboxTap.smtp rather than copying a dynamic port.",
          "The snippet returns the delivery promise to make failures deterministic in a local example. Better Auth recommends background dispatch to reduce timing side channels in production. If you follow that production pattern, use the platform's supported background-task mechanism and let InboxTap's bounded wait observe completion.",
        ],
      },
      {
        id: "test-links-as-secrets",
        title: "Test links as secrets",
        paragraphs: [
          "Create a new InboxTap recipient for the test, trigger the Better Auth operation, and wait for a link using a stable subject or path filter. Before navigating, parse the URL and assert the expected origin and callback path without printing its token.",
          "A magic link may create a user by default. Set disableSignUp when the product must allow sign-in only for existing users, and cover both the permitted and rejected cases explicitly.",
        ],
      },
      {
        id: "match-the-otp-configuration",
        title: "Match the OTP configuration",
        paragraphs: [
          "Better Auth's email-OTP plugin defaults to six digits, which matches InboxTap's default waitForCode() pattern. If otpLength or generateOTP changes the format, pass a project-specific pattern instead of assuming every provider emits six digits.",
          "For resend tests, wait for the second complete message with afterId set to the first message ID, then extract the new code from that returned message. This distinguishes deliveries and lets the application test prove whether the earlier code was invalidated.",
        ],
      },
      {
        id: "cover-the-product-contract",
        title: "Cover the product contract",
        paragraphs: [
          "Capturing the email is only the midpoint. Continue the flow and assert verified state, session creation, redirect destination, invalid or expired token handling, attempt limits, and password replacement according to the application's configuration.",
          "Avoid asserting secrets in test titles, logs, snapshots, or screenshots. InboxTap's matchers suppress token-bearing values, and its report redaction is best-effort rather than permission to publish unreviewed authentication artifacts.",
        ],
      },
    ],
    slug: "better-auth",
    title: "Test Better Auth emails with InboxTap",
  },
  "integrations/supabase": {
    cta: {
      description:
        "Use the client reference to select the correct link, code, message, and custom-pattern helper once SMTP connectivity is established.",
      label: "Explore the client SDK",
      title: "Automate the captured message",
    },
    description:
      "Learn where InboxTap fits alongside Supabase Auth's built-in Mailpit, when local SMTP connectivity is possible, and what hosted projects cannot do with loopback.",
    eyebrow: "Supabase integration",
    intro:
      "Supabase already supplies a visual mail catcher for its local Auth stack. InboxTap is useful when a test needs a typed recipient-scoped SDK, deterministic extraction, fault injection, or a redacted artifact—but only when the Auth process can actually reach the local SMTP listener.",
    kind: "integrations",
    relatedDocKey: "reference/client-sdk",
    section: "integrations",
    sections: [
      {
        id: "choose-mailpit-or-inboxtap",
        title: "Choose Mailpit or InboxTap for the job",
        paragraphs: [
          "The Supabase CLI includes Mailpit and exposes its web interface at localhost:54324 by default. Keep that default when a developer mainly needs to inspect local Auth templates by eye.",
          "Choose InboxTap when automated tests benefit from a unique address per case, waitForLink() or waitForCode(), content-safe matchers, deterministic fault rules, or bounded HTML and JSON evidence. This is a testing-workflow choice, not a claim that Supabase lacks local email capture.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/local-development/cli/testing-and-linting",
            label: "Supabase local Auth email testing",
          },
        ],
      },
      {
        id: "solve-the-network-topology-first",
        title: "Solve the network topology first",
        paragraphs: [
          "InboxTap binds to the host loopback addresses by default. A Supabase Auth process running inside a container has its own loopback interface, so localhost inside that container is not the InboxTap process on the host.",
          "Configure custom SMTP only in a topology where Auth can reach the listener without broadly exposing an unauthenticated capture service. Do not copy a 0.0.0.0 bind into a shared workstation or CI network. A hosted Supabase project likewise cannot connect to a developer laptop's loopback address.",
        ],
      },
      {
        code: {
          filename: "auth-email.test.ts",
          language: "typescript",
          source: supabaseMagicLinkSnippet,
        },
        id: "test-the-message-after-smtp-is-connected",
        title: "Test the message after SMTP is connected",
        paragraphs: [
          "Once the chosen local or self-hosted Auth topology can reach InboxTap, create a recipient and trigger signInWithOtp() through the real Supabase client. Despite its name, this method sends a magic link by default; the email template decides whether the user receives a confirmation URL or a code.",
          "Supabase creates a user by default when the address is unknown. Set shouldCreateUser to false when the product permits passwordless sign-in only for an existing account, and seed that account before requesting its message.",
          "The default confirmation link normally contains the Auth verification path shown in the snippet. If the project uses a custom PKCE template or callback endpoint, filter and validate the URL required by that template instead of hard-coding the default.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Supabase passwordless email documentation",
          },
        ],
      },
      {
        id: "respect-template-and-otp-settings",
        title: "Respect template and OTP settings",
        paragraphs: [
          "Using the Token variable in a Supabase email template produces an OTP flow, while the confirmation URL produces a link flow. Test the rendered contract rather than inferring it from the client method name.",
          "Supabase allows an email OTP length from six through ten digits. InboxTap's waitForCode() defaults to exactly six digits, so supply a pattern for a configured length. The parsed CapturedEmail.codes convenience array is limited to four through eight digits; a custom waitForCode() pattern scans the body and is the appropriate choice for nine- or ten-digit codes.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-templates",
            label: "Supabase Auth email-template documentation",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config",
            label: "Supabase CLI Auth configuration",
          },
        ],
      },
      {
        id: "separate-local-and-hosted-testing",
        title: "Separate local and hosted testing",
        paragraphs: [
          "Supabase's hosted default mail service restricts recipients and rate limits delivery, while hosted custom SMTP expects a network-reachable server with credentials. InboxTap deliberately provides neither public reachability nor SMTP authentication, so it is not a hosted-project SMTP provider.",
          "Use InboxTap for a local or isolated CI environment whose network boundary you control. Use an appropriate authenticated testing or delivery provider when a hosted Supabase project must send over the public network.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-smtp",
            label: "Supabase custom SMTP documentation",
          },
        ],
      },
    ],
    slug: "supabase",
    title: "Test Supabase Auth emails with InboxTap",
  },
  "integrations/nodemailer": {
    cta: {
      description:
        "Continue with a runnable Express and Vitest workflow that tests links, custom tokens, OTPs, recipients, and headers.",
      label: "Read the Nodemailer guide",
      title: "Connect a real application sender",
    },
    description:
      "Point Nodemailer at a verified local InboxTap transport, send real SMTP messages, and assert on recipients, links, codes, and headers.",
    eyebrow: "Nodemailer integration",
    intro:
      "InboxTap accepts the same SMTP message that a Nodemailer application sends to a delivery provider, but captures it in bounded local memory instead of relaying it. The official fixture supplies a ready transport and dynamic SMTP settings so tests can exercise real message construction without fixed ports.",
    kind: "integrations",
    relatedDocKey: "guides/nodemailer",
    section: "integrations",
    sections: [
      {
        id: "configure-plain-local-smtp",
        title: "Configure plain local SMTP correctly",
        paragraphs: [
          "A manual Nodemailer transport for InboxTap uses the local host and port, secure: false, ignoreTLS: true, and no auth object. secure: false means that TLS is not active at connection time; by itself, it does not stop Nodemailer from attempting a later STARTTLS upgrade.",
          "InboxTap disables authentication and STARTTLS because it is a loopback-only capture server. Keep those development settings separate from the authenticated, encrypted transport used for production delivery.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp",
            label: "Nodemailer SMTP transport documentation",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: nodemailerFixtureSnippet,
        },
        id: "prefer-the-verified-fixture",
        title: "Prefer the verified fixture",
        paragraphs: [
          "startInboxTapFixture() selects free SMTP and API ports, starts the server, creates a Nodemailer transport, calls verify(), and checks the InboxTap health endpoint before returning. Its close() method is idempotent and cleans up both the transport and listeners.",
          "The fixture transport is convenient for template-level integration tests. To test the application-owned mailer, configure that mailer with inboxTap.smtp and send through the application API instead.",
        ],
      },
      {
        id: "understand-what-verify-proves",
        title: "Understand what transport verification proves",
        paragraphs: [
          "Nodemailer's verify() checks DNS resolution, the TCP connection, any TLS upgrade, and authentication without sending a message. It does not prove that a server will accept a particular envelope sender or message.",
          "Keep at least one real sendMail() transaction in the test. InboxTap stores the message only after SMTP DATA completes successfully, so the resulting CapturedEmail represents an accepted delivery rather than transport readiness alone.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp#verifying-the-configuration",
            label: "Nodemailer transport verification",
          },
        ],
      },
      {
        id: "assert-the-envelope-and-content",
        title: "Assert the envelope and content",
        paragraphs: [
          "Use toHaveRecipient() when delivery routing matters because it compares the SMTP envelope rather than a display address parsed from the message header. Use toContainLink() for extracted HTTP or HTTPS URLs and waitForCode() for a numeric value.",
          "Reach for waitForMessage() when the test needs the subject, normalized headers, text, HTML, raw source, or every extracted link. Avoid printing the body or token-bearing URLs in routine diagnostics.",
        ],
      },
      {
        id: "close-every-owner",
        title: "Close every resource owner",
        paragraphs: [
          "Place fixture.close() in a finally block when managing the explicit lifecycle. If the application creates its own Nodemailer transport, the application fixture must close that transport before InboxTap shuts down.",
          "Runner-native adapters automate this ordering for Bun, Vitest, and Playwright. Keeping ownership explicit prevents open sockets from holding the test process alive after a failure.",
        ],
      },
    ],
    slug: "nodemailer",
    title: "Test Nodemailer email with InboxTap",
  },
} satisfies Partial<ResourceContentDictionary>;
