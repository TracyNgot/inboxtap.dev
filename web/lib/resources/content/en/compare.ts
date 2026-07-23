import type { ResourceContentDictionary } from "../../types";

type EnglishComparisonKey = "compare/mailhog" | "compare/mailpit" | "compare/mailtrap";

export const compareResourcesEn = {
  "compare/mailhog": {
    cta: {
      description:
        "See where InboxTap, browser-based mail catchers, and hosted sandboxes fit across local development and automated testing.",
      label: "Explore email testing alternatives",
      title: "Compare the wider set of alternatives",
    },
    description:
      "Compare InboxTap and MailHog for local SMTP capture, automated tests, visual inspection, failure simulation, storage, and CI.",
    eyebrow: "Comparison guide",
    intro:
      "InboxTap and MailHog both capture SMTP mail locally, but they optimize different workflows. InboxTap makes the test suite the primary interface. MailHog makes a browser inbox and HTTP API the primary interface.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "compare",
    sections: [
      {
        id: "short-answer",
        title: "Short answer",
        paragraphs: [
          "Choose InboxTap when an automated TypeScript, Bun, or Node test should start the server, create an isolated recipient, wait for a link or code, inject a precise SMTP failure, and write redacted CI evidence. Its official fixtures cover Bun test, Vitest, and Playwright.",
          "Choose MailHog when people need a browser inbox, MIME-part inspection, persistent storage options, release through a real SMTP server, or its process-level Jim chaos model. MailHog also has a JSON API, so it should not be described as a manual-only tool.",
        ],
      },
      {
        id: "feature-comparison",
        title: "InboxTap and MailHog compared",
        paragraphs: [
          "The important distinction is not whether either product can capture an email. It is whether the test code or a shared visual mailbox should own the workflow.",
        ],
        table: {
          headers: ["Dimension", "InboxTap", "MailHog"],
          rows: [
            [
              "Primary workflow",
              "Code-driven automated tests for email-dependent application flows.",
              "Interactive local email capture through a web UI, with an HTTP API for automation.",
            ],
            [
              "Runtime and distribution",
              "npm CLI and TypeScript package; runs with Node 20 or Bun and does not require Docker.",
              "Go binary, Homebrew package, or Docker image.",
            ],
            [
              "Web interface",
              "No captured-message dashboard; the website is documentation only.",
              "Browser inbox for plain text, HTML, source, and MIME-part inspection.",
            ],
            [
              "Automation",
              "Typed client, long-polling helpers, runner-native fixtures, matchers, and HTML or JSON report collection.",
              "JSON API plus community client libraries listed by the project.",
            ],
            [
              "Isolation in parallel tests",
              "Creates a unique recipient address for each test and filters the store by SMTP envelope recipient.",
              "Uses a shared message store; test suites must partition or filter their own messages.",
            ],
            [
              "Failure-path testing",
              "Queues a bounded rule for the next matching DATA transaction: fail, delay, pause and release, or disconnect.",
              "Jim applies configured probabilities to connections, link speed, authentication, senders, and recipients.",
            ],
            [
              "Storage",
              "Bounded in-memory FIFO storage only; 100 messages by default.",
              "In-memory by default, with documented MongoDB and Maildir persistence options.",
            ],
            [
              "Message inspection",
              "Parsed text, HTML, headers, raw source, envelope recipients, HTTP links, and 4–8 digit codes; no attachment API.",
              "Plain text, HTML, source, multipart MIME, and downloadable MIME parts in the web UI.",
            ],
            [
              "Outbound behavior",
              "Never relays or forwards captured messages.",
              "Can release a stored message through a configured external SMTP server.",
            ],
            [
              "Network defaults",
              "Binds IPv4 and IPv6 loopback addresses by default.",
              "The documented SMTP, API, and UI defaults bind to 0.0.0.0; HTTP Basic authentication is available for the UI and API.",
            ],
            ["License", "MIT.", "MIT."],
            [
              "Official release signal",
              "Published and versioned through npm.",
              "The official releases page still marks 1.0.1 from August 2020 as latest; the newest visible default-branch commits are from August 2022.",
            ],
          ],
        },
      },
      {
        id: "failure-path-testing",
        title: "Deterministic faults and broad chaos are different",
        paragraphs: [
          "MailHog's Jim is a real failure-testing feature. It can reject connections, authentication, senders, or recipients, disconnect sessions, and constrain connection speed. Its settings are process-level probabilities. A probability can be configured to make a behavior consistent, but Jim is not a per-test queue for the next transaction addressed to one isolated recipient.",
          "InboxTap registers faults directly in the test. A recipient filter matches the SMTP envelope case-insensitively, and the next matching transaction that reaches DATA consumes one rule. Failed or disconnected deliveries do not enter the store; delayed or paused mail appears only after successful completion.",
          "That makes Jim useful for broad chaos experiments and InboxTap useful for surgical retry, deduplication, latency, and concurrent-submission assertions. Neither model is universally better; they answer different testing questions.",
        ],
      },
      {
        id: "which-tool",
        title: "Which tool should you choose?",
        paragraphs: [
          "A team can also use both: MailHog for visual development feedback and InboxTap inside the automated suite.",
        ],
        bullets: [
          "Choose InboxTap when the test runner should own startup, cleanup, recipient isolation, assertions, and failure controls.",
          "Choose InboxTap when sending any captured message externally must remain outside the product's scope.",
          "Choose MailHog when a browser inbox is the main way developers inspect messages.",
          "Choose MailHog when an existing workflow depends on MongoDB or Maildir storage, MIME-part downloads, or message release.",
          "If maintenance cadence matters to your organization, evaluate MailHog's published release and commit dates against your own policy rather than relying on labels such as “dead” or “abandoned.”",
        ],
      },
      {
        id: "verified-sources",
        title: "Sources verified on 23 July 2026",
        paragraphs: [
          "This comparison uses the products' own repositories and documentation. Capabilities and release status can change after the review date.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "InboxTap README and public feature scope",
          },
          {
            href: "https://github.com/mailhog/MailHog",
            label: "MailHog README and feature list",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/JIM.md",
            label: "MailHog Jim chaos documentation",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/CONFIG.md",
            label: "MailHog configuration and bind defaults",
          },
          {
            href: "https://github.com/mailhog/MailHog/releases",
            label: "MailHog official releases",
          },
          {
            href: "https://github.com/mailhog/MailHog/commits/master/",
            label: "MailHog default-branch commit history",
          },
        ],
      },
    ],
    slug: "mailhog",
    title: "InboxTap vs MailHog: which local email testing tool fits your tests?",
  },
  "compare/mailpit": {
    cta: {
      description:
        "Compare focused test SDKs, visual local mail servers, and hosted sandboxes before choosing a workflow.",
      label: "Explore email testing alternatives",
      title: "See the complete alternatives guide",
    },
    description:
      "Compare InboxTap and Mailpit for automated email tests, web inspection, SMTP failures, storage, CI evidence, and local development.",
    eyebrow: "Comparison guide",
    intro:
      "Mailpit is a broad, actively maintained email-testing server with a rich web interface and API. InboxTap is a narrower npm-native SMTP capture server and test SDK. Both automate email tests and simulate SMTP failures, but at different layers.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "compare",
    sections: [
      {
        id: "short-answer",
        title: "Short answer",
        paragraphs: [
          "Choose Mailpit for a feature-rich visual sandbox with attachments, advanced search, HTML and link checks, optional spam analysis, screenshots, persistence options, POP3, relaying, forwarding, and webhooks.",
          "Choose InboxTap when test code should own server lifecycle, a fresh recipient per test, typed assertions, deterministic next-delivery faults, and redacted CI evidence. Mailpit also has a REST API and Chaos support, so it is neither manual-only nor limited to successful delivery paths.",
        ],
      },
      {
        id: "feature-comparison",
        title: "InboxTap and Mailpit compared",
        paragraphs: [
          "Mailpit covers more operational and visual email-testing use cases. InboxTap deliberately keeps a smaller surface around deterministic application tests.",
        ],
        table: {
          headers: ["Dimension", "InboxTap", "Mailpit"],
          rows: [
            [
              "Primary workflow",
              "Email-dependent integration and end-to-end tests driven from TypeScript.",
              "Visual email inspection plus API-driven integration testing.",
            ],
            [
              "Runtime and distribution",
              "npm CLI and TypeScript package for Node 20 or Bun; Docker is not required or provided.",
              "Single static binary or multi-architecture Docker image.",
            ],
            [
              "Web interface",
              "No captured-message UI.",
              "Modern UI with message search, HTML and source views, attachments, tags, screenshots, and live updates.",
            ],
            [
              "Automation",
              "Typed SDK, bounded long-polling, Bun, Vitest, and Playwright fixtures, runner matchers, and report collector.",
              "REST API, rendered message endpoints, and documented integration-testing options, including a Cypress package.",
            ],
            [
              "Isolation in parallel tests",
              "A unique generated envelope recipient per test, without server-side registration.",
              "A shared instance and store; use filters, tags, tenant configuration, or separate instances to partition work.",
            ],
            [
              "Failure-path testing",
              "One queued rule applies to the next matching DATA transaction and can fail, delay, pause, or disconnect it.",
              "Chaos applies configurable 400–599 errors by probability at sender, recipient, or authentication stages.",
            ],
            [
              "Storage",
              "Bounded in-memory FIFO only, keeping 100 messages by default.",
              "Temporary SQLite by default, with persistent SQLite or rqlite options and automatic pruning to 500 messages by default.",
            ],
            [
              "Message inspection",
              "Parsed text, HTML, headers, raw source, links, and short numeric codes; attachments are outside scope.",
              "Attachments, HTML compatibility, link checking, optional SpamAssassin analysis, screenshots, and List-Unsubscribe validation.",
            ],
            [
              "Outbound behavior",
              "No relay, forwarding, webhook, or external link checking.",
              "Optional SMTP relay, forwarding, webhook, POP3, and link-check HTTP requests.",
            ],
            [
              "Network and transport",
              "Loopback by default; SMTP authentication and STARTTLS are intentionally disabled.",
              "HTTP and SMTP bind to 0.0.0.0 by default, with configurable authentication, HTTPS, STARTTLS, and TLS.",
            ],
            [
              "CI evidence",
              "Deterministic, self-contained HTML or versioned JSON reports with bounded best-effort redaction.",
              "UI screenshots and API results; the reviewed public docs do not describe an equivalent redacted artifact collector.",
            ],
            ["License", "MIT.", "MIT."],
          ],
        },
      },
      {
        id: "failure-path-testing",
        title: "How the two failure models differ",
        paragraphs: [
          "Mailpit Chaos can return a chosen SMTP error code from 400 through 599 at the sender, recipient, or authentication stage. Its triggers are probability-based, but a probability of 100% can make a stage fail consistently. Once Mailpit starts with Chaos enabled, the web UI and API can update those triggers at runtime.",
          "InboxTap claims one bounded rule when the next matching transaction reaches DATA. The rule can target the unique envelope recipient created for a test and can inject a failure, artificial delay, isolated pause gate, or connection drop. Reset and shutdown abort active waits.",
          "Mailpit's model is well suited to changing the behavior of a running sandbox and testing SMTP-stage errors. InboxTap's model is designed for one test to arrange one precise transaction before triggering application code. Describing Mailpit as unable to test retries, or describing its Chaos feature as always random, would be inaccurate.",
        ],
      },
      {
        id: "which-tool",
        title: "Which tool should you choose?",
        paragraphs: [
          "The products can complement each other. A team may use Mailpit as its visual development inbox and InboxTap for focused automated tests that need typed lifecycle and assertion support.",
        ],
        bullets: [
          "Choose InboxTap when a TypeScript test runner should start and stop the SMTP service on dynamic ports.",
          "Choose InboxTap for deterministic, recipient-targeted delay, pause, disconnect, and next-delivery failure scenarios.",
          "Choose Mailpit when developers need a polished inbox, attachment inspection, HTML compatibility checks, link checks, screenshots, or spam analysis.",
          "Choose Mailpit when persistent storage, POP3, relaying, forwarding, webhooks, authentication, or TLS are requirements.",
          "When running Mailpit on a shared network, review its bind, authentication, and TLS settings rather than assuming a loopback-only default.",
        ],
      },
      {
        id: "verified-sources",
        title: "Sources verified on 23 July 2026",
        paragraphs: [
          "The latest official Mailpit release during this review was v1.30.5, published on 20 July 2026. Version numbers and feature details should be checked again when this page is materially updated.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "InboxTap README and public feature scope",
          },
          {
            href: "https://mailpit.axllent.org/docs/",
            label: "Mailpit official feature documentation",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/",
            label: "Mailpit integration-testing documentation",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/chaos/",
            label: "Mailpit Chaos documentation",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/email-storage/",
            label: "Mailpit storage documentation",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/runtime-options/",
            label: "Mailpit current runtime options and bind defaults",
          },
          {
            href: "https://github.com/axllent/mailpit/releases/latest",
            label: "Mailpit latest official release",
          },
        ],
      },
    ],
    slug: "mailpit",
    title: "InboxTap vs Mailpit: test SDK or full email sandbox?",
  },
  "compare/mailtrap": {
    cta: {
      description:
        "Compare local test SDKs, visual mail catchers, and hosted collaboration tools across the full alternatives guide.",
      label: "Explore email testing alternatives",
      title: "Choose the workflow, not just the brand",
    },
    description:
      "Compare InboxTap with Mailtrap Local and hosted Email Sandbox for automation, visual inspection, collaboration, failure tests, privacy, and cost.",
    eyebrow: "Comparison guide",
    intro:
      "Mailtrap is no longer cloud-only. Mailtrap Local is an MIT-licensed localhost sandbox with an embedded web interface and REST API, while Mailtrap Email Sandbox remains the hosted collaborative service. InboxTap is the narrower npm-native test SDK.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "compare",
    sections: [
      {
        id: "three-products",
        title: "Three products for three primary workflows",
        paragraphs: [
          "Choose InboxTap when automated test code needs to own SMTP lifecycle, isolated recipients, assertions, deterministic faults, and redacted artifacts.",
          "Choose Mailtrap Local when an individual developer wants offline visual inspection, attachment support, HTML compatibility checks, SQLite storage, and a local REST API.",
          "Choose hosted Mailtrap Email Sandbox when a team needs shared projects and sandboxes, roles, remote staging access, forwarding, hosted analysis, and plan-backed collaboration.",
        ],
      },
      {
        id: "feature-comparison",
        title: "InboxTap, Mailtrap Local, and Email Sandbox compared",
        paragraphs: [
          "Separating Mailtrap Local from the hosted product avoids the stale claim that every Mailtrap workflow sends test data to a cloud service.",
        ],
        table: {
          headers: ["Dimension", "InboxTap", "Mailtrap Local", "Hosted Email Sandbox"],
          rows: [
            [
              "Primary workflow",
              "Deterministic automated integration and end-to-end tests.",
              "Individual local visual development and message inspection.",
              "Shared development, QA, staging, and team collaboration.",
            ],
            [
              "Runtime and distribution",
              "npm CLI and TypeScript package for Node 20 or Bun.",
              "Homebrew, Docker, or a single macOS or Linux binary; Windows is not yet supported in the reviewed README.",
              "Hosted SMTP and API service accessed with sandbox credentials.",
            ],
            [
              "Web interface",
              "No captured-message dashboard.",
              "Embedded React inbox with search, HTML, text, raw source, headers, and attachments.",
              "Hosted inbox with previews, HTML Check, headers, attachments, and plan-dependent Bcc information.",
            ],
            [
              "Automation",
              "Typed SDK, explicit and runner-native fixtures, matchers, programmatic faults, and report collection.",
              "JSON REST API with an OpenAPI specification.",
              "Authenticated Sandbox API for messages, content, projects, sandboxes, users, forwarding, and test automation.",
            ],
            [
              "Isolation and collaboration",
              "One generated envelope recipient per test; no user accounts or shared dashboard.",
              "One single-user local sandbox with categories; explicitly no accounts, authentication, multi-tenancy, shared sandboxes, or roles.",
              "Projects and sandboxes with users, permissions, and plan-dependent sharing and single sign-on.",
            ],
            [
              "Failure-path testing",
              "Recipient-targeted next-delivery failure, delay, pause and release, or disconnect at DATA.",
              "The reviewed public README and OpenAPI do not document an equivalent SMTP fault-control surface.",
              "SMTP Bounce Emulator returns a requested bounce code and response when mail is sent to a specially constructed recipient address.",
            ],
            [
              "Storage",
              "Bounded in-memory FIFO storage only.",
              "Local SQLite with configurable message retention.",
              "Hosted storage, monthly usage, rate, message-size, and per-sandbox limits vary by plan; full sandboxes use FIFO cleanup.",
            ],
            [
              "Message inspection",
              "Parsed text, HTML, headers, raw source, envelope recipients, links, and 4–8 digit codes; no attachments.",
              "Attachments, inline content, raw source, headers, and HTML email-client compatibility checks.",
              "HTML and raw inspection, HTML Check, attachments, headers, spam analysis, and other plan-dependent testing tools.",
            ],
            [
              "Outbound behavior",
              "Never relays or forwards mail.",
              "Can release through a generic SMTP relay, copy to Mailtrap cloud, and send signed webhooks.",
              "Supports manual and automatic forwarding within plan limits.",
            ],
            [
              "Network and data location",
              "IPv4 and IPv6 loopback by default; wider binding requires an explicit option.",
              "SMTP on 127.0.0.1:3535 and UI/API on 127.0.0.1:3550 by default.",
              "Remote hosted service using authenticated SMTP or HTTPS.",
            ],
            [
              "License and cost",
              "MIT-licensed open source.",
              "MIT-licensed open source.",
              "Hosted service with free and paid plans; prices and quotas can change.",
            ],
          ],
        },
      },
      {
        id: "failure-path-testing",
        title: "Failure testing is not an all-or-nothing comparison",
        paragraphs: [
          "InboxTap lets a test queue the next failure for one generated envelope recipient. It can return a 4xx or 5xx response, add bounded latency, pause a transaction until the test releases it, or disconnect during DATA. Failed and disconnected messages are not captured.",
          "Hosted Email Sandbox has a genuine SMTP Bounce Emulator. The recipient address encodes the desired response, and Sandbox SMTP returns that bounce to the application. It works through SMTP rather than the sending API. This can test rejection handling, but it is a different contract from delaying, gating, or disconnecting the next delivery to the application's normal test recipient.",
          "As of the review date, Mailtrap Local's public README and OpenAPI describe capture, inspection, release, cloud copying, and webhooks, but do not list an equivalent fault-injection API. That is a dated documentation observation, not a promise about future releases.",
        ],
      },
      {
        id: "mailtrap-local-status",
        title: "Mailtrap Local is new and should be evaluated on its own",
        paragraphs: [
          "Mailtrap Local's changelog records its initial public release on 3 July 2026 and v0.2.0 on 22 July 2026. The project describes itself as a complement to the hosted Mailtrap product, not a replacement for team features.",
          "Its local defaults are deliberately narrow: loopback listeners, SQLite, no authentication, and no multi-user model. It nevertheless has a broader visual and workflow surface than InboxTap, including attachments, an HTML compatibility check, message categories, release, webhooks, and sendmail-replacement mode.",
          "Teams should avoid treating the shared Mailtrap brand as one product. Local inspection, hosted collaboration, and code-first deterministic testing are separate purchase or architecture decisions.",
        ],
      },
      {
        id: "which-tool",
        title: "Which option should you choose?",
        paragraphs: [
          "A mixed workflow is reasonable: InboxTap in automated test suites, Mailtrap Local for visual template work, and hosted Email Sandbox for shared staging or QA.",
        ],
        bullets: [
          "Choose InboxTap for npm-native lifecycle, per-test recipient isolation, runner matchers, deterministic delay and disconnect scenarios, and redacted CI reports.",
          "Choose Mailtrap Local for a localhost-only visual inbox, attachments, HTML checks, SQLite history, release, or webhooks without using a hosted mailbox.",
          "Choose hosted Email Sandbox for remote environments, shared projects, access control, forwarding, deliverability tools, and team workflows.",
          "Do not hard-code a Mailtrap price comparison. Hosted plan prices, quotas, forwarding allowances, and collaboration features are subject to change.",
        ],
      },
      {
        id: "verified-sources",
        title: "Sources verified on 23 July 2026",
        paragraphs: [
          "The review distinguishes Mailtrap Local v0.2.0 from hosted Email Sandbox and relies on Mailtrap's current repository, help center, and pricing page. Recheck the product split and plan details when this page is updated.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "InboxTap README and public feature scope",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local",
            label: "Mailtrap Local official README",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/CHANGELOG.md",
            label: "Mailtrap Local changelog",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/releases/tag/v0.2.0",
            label: "Mailtrap Local v0.2.0 release",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/docs/api/openapi.yaml",
            label: "Mailtrap Local OpenAPI specification",
          },
          {
            href: "https://docs.mailtrap.io/getting-started/email-sandbox",
            label: "Hosted Email Sandbox overview",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/setup/sandbox-api-integration",
            label: "Hosted Sandbox API capabilities",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/testing/bounce-rate",
            label: "Mailtrap SMTP Bounce Emulator",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/help/features-and-limits",
            label: "Hosted Sandbox features and plan-dependent limits",
          },
          {
            href: "https://mailtrap.io/pricing/",
            label: "Current Mailtrap pricing and plan matrix",
          },
        ],
      },
    ],
    slug: "mailtrap",
    title: "InboxTap vs Mailtrap: local test SDK, visual sandbox, or hosted service?",
  },
} as const satisfies Pick<ResourceContentDictionary, EnglishComparisonKey>;
