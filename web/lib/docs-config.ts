export const docGroups = [
  { key: "getting-started", label: "Getting started" },
  { key: "reference", label: "Reference" },
  { key: "guides", label: "Guides" },
] as const;

export type DocGroup = (typeof docGroups)[number]["key"];

interface TableOfContentsItem {
  id: string;
  label: string;
}

export interface DocDefinition {
  description: string;
  group: DocGroup;
  path: `/docs${string}`;
  slug: string;
  title: string;
  toc: readonly TableOfContentsItem[];
}

export const docs = [
  {
    description: "What InboxTap captures, why it exists, and where it is safe to run.",
    group: "getting-started",
    path: "/docs",
    slug: "",
    title: "Introduction",
    toc: [
      { id: "why-inboxtap", label: "Why InboxTap?" },
      { id: "how-it-works", label: "How it works" },
      { id: "safety-and-scope", label: "Safety and scope" },
    ],
  },
  {
    description: "Run the InboxTap CLI and add the test SDK to a Bun or Node project.",
    group: "getting-started",
    path: "/docs/installation",
    slug: "installation",
    title: "Installation",
    toc: [
      { id: "requirements", label: "Requirements" },
      { id: "run-the-server", label: "Run the server" },
      { id: "install-the-sdk", label: "Install the SDK" },
      { id: "point-your-app-at-inboxtap", label: "Configure your app" },
    ],
  },
  {
    description: "Capture a sign-up email and follow its verification link from a test.",
    group: "getting-started",
    path: "/docs/quick-start",
    slug: "quick-start",
    title: "Quick start",
    toc: [
      { id: "start-inboxtap", label: "Start InboxTap" },
      { id: "create-an-isolated-inbox", label: "Create an inbox" },
      { id: "trigger-the-email", label: "Trigger the email" },
      { id: "await-the-result", label: "Await the result" },
    ],
  },
  {
    description: "Configure local hosts, ports, recipient domains, and resource limits.",
    group: "getting-started",
    path: "/docs/configuration",
    slug: "configuration",
    title: "Configuration",
    toc: [
      { id: "defaults", label: "Defaults" },
      { id: "cli-options", label: "CLI options" },
      { id: "run-multiple-instances", label: "Multiple instances" },
      { id: "programmatic-server", label: "Programmatic server" },
    ],
  },
  {
    description: "How InboxTap compares to Mailpit, MailHog, smtp4dev, and hosted mail testing.",
    group: "getting-started",
    path: "/docs/alternatives",
    slug: "alternatives",
    title: "Alternatives",
    toc: [
      { id: "at-a-glance", label: "At a glance" },
      { id: "mailpit-and-mailhog", label: "Mailpit and MailHog" },
      { id: "smtp4dev", label: "smtp4dev" },
      { id: "hosted-services", label: "Hosted services" },
      { id: "when-not-to-use-inboxtap", label: "When not to use InboxTap" },
    ],
  },
  {
    description: "Complete local HTTP API reference, including filters and response shapes.",
    group: "reference",
    path: "/docs/reference/http-api",
    slug: "reference/http-api",
    title: "HTTP API",
    toc: [
      { id: "request-conventions", label: "Request conventions" },
      { id: "health", label: "Health" },
      { id: "list-emails", label: "List emails" },
      { id: "latest-email", label: "Latest email" },
      { id: "wait-for-email", label: "Wait for email" },
      { id: "get-email-by-id", label: "Get by ID" },
      { id: "clear-emails", label: "Clear emails" },
    ],
  },
  {
    description: "Reference for InboxTapClient, TestInbox, filters, and captured messages.",
    group: "reference",
    path: "/docs/reference/client-sdk",
    slug: "reference/client-sdk",
    title: "Client SDK",
    toc: [
      { id: "create-a-client", label: "Create a client" },
      { id: "create-an-inbox", label: "Create an inbox" },
      { id: "testinbox-methods", label: "TestInbox methods" },
      { id: "low-level-client-methods", label: "Low-level methods" },
      { id: "capturedemail", label: "CapturedEmail" },
      { id: "errors", label: "Errors" },
    ],
  },
  {
    description: "Use an isolated InboxTap address in a Playwright browser test.",
    group: "guides",
    path: "/docs/guides/playwright",
    slug: "guides/playwright",
    title: "Playwright",
    toc: [
      { id: "start-the-services", label: "Start the services" },
      { id: "write-the-test", label: "Write the test" },
      { id: "parallel-workers", label: "Parallel workers" },
    ],
  },
  {
    description: "Drive email verification flows from Cypress specs with cy.task and the SDK.",
    group: "guides",
    path: "/docs/guides/cypress",
    slug: "guides/cypress",
    title: "Cypress",
    toc: [
      { id: "start-the-services", label: "Start the services" },
      { id: "register-the-tasks", label: "Register the tasks" },
      { id: "write-the-test", label: "Write the test" },
      { id: "parallel-isolation", label: "Parallel isolation" },
      { id: "direct-http-access", label: "Direct HTTP access" },
    ],
  },
  {
    description: "Run InboxTap programmatically with Bun test, Vitest, Jest, or another runner.",
    group: "guides",
    path: "/docs/guides/test-runners",
    slug: "guides/test-runners",
    title: "Bun, Vitest, and Jest",
    toc: [
      { id: "runner-agnostic-setup", label: "Runner-agnostic setup" },
      { id: "start-and-stop-in-tests", label: "Test lifecycle" },
      { id: "choose-the-right-helper", label: "Choose a helper" },
    ],
  },
  {
    description: "Verify Better Auth sign-up emails in a Next.js app with Playwright.",
    group: "guides",
    path: "/docs/guides/better-auth",
    slug: "guides/better-auth",
    title: "Better Auth",
    toc: [
      { id: "wire-better-auth-to-inboxtap", label: "Wire Better Auth" },
      { id: "drive-the-flows-with-playwright", label: "Drive the flows" },
      { id: "run-the-example", label: "Run the example" },
    ],
  },
  {
    description: "Test Nodemailer delivery from an Express API with Vitest.",
    group: "guides",
    path: "/docs/guides/nodemailer",
    slug: "guides/nodemailer",
    title: "Nodemailer",
    toc: [
      { id: "point-nodemailer-at-inboxtap", label: "Point Nodemailer at InboxTap" },
      { id: "test-with-vitest", label: "Test with Vitest" },
      { id: "run-the-example", label: "Run the example" },
    ],
  },
  {
    description:
      "Run InboxTap in CI with a health-checked background step or a programmatic server.",
    group: "guides",
    path: "/docs/guides/ci",
    slug: "guides/ci",
    title: "CI and GitHub Actions",
    toc: [
      { id: "two-ways-to-run-it", label: "Two ways to run it" },
      { id: "wait-for-health", label: "Wait for health" },
      { id: "github-actions-workflow", label: "GitHub Actions workflow" },
      { id: "ports-and-other-providers", label: "Ports and other providers" },
    ],
  },
  {
    description:
      "Diagnose connection failures, missing emails, wait timeouts, and cross-test reads.",
    group: "guides",
    path: "/docs/guides/troubleshooting",
    slug: "guides/troubleshooting",
    title: "Troubleshooting",
    toc: [
      { id: "connection-refused", label: "Connection refused" },
      { id: "port-already-in-use", label: "Port already in use" },
      { id: "the-email-never-arrives", label: "The email never arrives" },
      { id: "waits-time-out", label: "Waits time out" },
      { id: "tests-read-each-others-messages", label: "Cross-test reads" },
      { id: "messages-disappear", label: "Messages disappear" },
      { id: "message-rejected-as-too-large", label: "Message too large" },
    ],
  },
  {
    description: "Release history for every InboxTap version, with links to pull requests.",
    group: "reference",
    path: "/docs/changelog",
    slug: "changelog",
    title: "Changelog",
    // Version anchors come from CHANGELOG.md at build time, so this page has
    // no static table of contents.
    toc: [],
  },
] as const satisfies readonly DocDefinition[];

export type DocSlug = (typeof docs)[number]["slug"];

export function getDocGroup(group: DocGroup) {
  const definition = docGroups.find((candidate) => candidate.key === group);
  if (!definition) throw new Error(`Unknown documentation group: ${group}`);
  return definition;
}

export function getDocBySlug(slug: string): (typeof docs)[number] | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function getDocBySegments(segments: readonly string[] = []) {
  return getDocBySlug(segments.join("/"));
}

export function getAdjacentDocs(slug: DocSlug) {
  const index = docs.findIndex((doc) => doc.slug === slug);
  return {
    next: docs[index + 1],
    previous: docs[index - 1],
  };
}
