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
