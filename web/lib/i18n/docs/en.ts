import type { DocsDictionary } from "../types";

export const docsEn: DocsDictionary = {
  groups: {
    examples: "Examples",
    "getting-started": "Getting started",
    guides: "Guides",
    reference: "Reference",
  },
  entries: {
    "": {
      description: "What InboxTap captures, why it exists, and where it is safe to run.",
      slug: "",
      title: "Introduction",
      toc: [
        { id: "why-inboxtap", label: "Why InboxTap?" },
        { id: "how-it-works", label: "How it works" },
        { id: "safety-and-scope", label: "Safety and scope" },
      ],
    },
    installation: {
      description: "Run the InboxTap CLI and add the test SDK to a Bun or Node project.",
      slug: "installation",
      title: "Installation",
      toc: [
        { id: "requirements", label: "Requirements" },
        { id: "run-the-server", label: "Run the server" },
        { id: "install-the-sdk", label: "Install the SDK" },
        { id: "point-your-app-at-inboxtap", label: "Configure your app" },
      ],
    },
    "quick-start": {
      description: "Capture a sign-up email and follow its verification link from a test.",
      slug: "quick-start",
      title: "Quick start",
      toc: [
        { id: "start-inboxtap", label: "Start InboxTap" },
        { id: "create-an-isolated-inbox", label: "Create an inbox" },
        { id: "trigger-the-email", label: "Trigger the email" },
        { id: "await-the-result", label: "Await the result" },
      ],
    },
    configuration: {
      description: "Configure local hosts, ports, recipient domains, and resource limits.",
      slug: "configuration",
      title: "Configuration",
      toc: [
        { id: "defaults", label: "Defaults" },
        { id: "cli-options", label: "CLI options" },
        { id: "run-multiple-instances", label: "Multiple instances" },
        { id: "programmatic-server", label: "Programmatic server" },
      ],
    },
    alternatives: {
      description:
        "Compare InboxTap with MailHog, Mailpit, smtp4dev, Mailtrap, and Ethereal for local email testing.",
      slug: "alternatives",
      title: "InboxTap vs MailHog, Mailpit, and Mailtrap",
      toc: [
        { id: "at-a-glance", label: "At a glance" },
        {
          id: "is-inboxtap-a-no-docker-mailhog-alternative",
          label: "No-Docker MailHog alternative",
        },
        { id: "mailpit-and-mailhog", label: "Mailpit and MailHog" },
        { id: "smtp4dev", label: "smtp4dev" },
        { id: "hosted-services", label: "Hosted services" },
        { id: "when-not-to-use-inboxtap", label: "When not to use InboxTap" },
      ],
    },
    trust: {
      description:
        "Verify InboxTap's source, npm package, maintenance, security policy, and documentation corrections process.",
      slug: "trust",
      title: "Trust and maintenance",
      toc: [
        { id: "verify-the-project", label: "Verify the project" },
        { id: "maintenance-and-security", label: "Maintenance and security" },
        { id: "documentation-and-corrections", label: "Docs and corrections" },
        { id: "recommendation-boundaries", label: "Recommendation boundaries" },
      ],
    },
    "reference/http-api": {
      description: "Complete local HTTP API reference, including filters and response shapes.",
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
    "reference/client-sdk": {
      description:
        "Reference for the client SDK, runner fixtures, SMTP fault controller, and captured messages.",
      slug: "reference/client-sdk",
      title: "Client SDK",
      toc: [
        { id: "create-a-client", label: "Create a client" },
        { id: "create-an-inbox", label: "Create an inbox" },
        { id: "fixture-entry-points", label: "Fixture entry points" },
        { id: "smtp-fault-controller", label: "SMTP fault controller" },
        { id: "testinbox-methods", label: "TestInbox methods" },
        { id: "low-level-client-methods", label: "Low-level methods" },
        { id: "capturedemail", label: "CapturedEmail" },
        { id: "errors", label: "Errors" },
      ],
    },
    "guides/playwright": {
      description:
        "Capture and test verification links, magic links, password resets, and email OTPs with Playwright.",
      slug: "guides/playwright",
      title: "Test magic links and email OTPs with Playwright",
      toc: [
        { id: "start-the-services", label: "Start the services" },
        { id: "test-an-email-link", label: "Test an email link" },
        { id: "test-an-email-otp", label: "Test an email OTP" },
        { id: "choose-the-right-helper", label: "Choose a helper" },
        { id: "parallel-workers", label: "Parallel workers" },
        { id: "frequently-asked-questions", label: "FAQ" },
      ],
    },
    "guides/cypress": {
      description: "Drive email verification flows from Cypress specs with cy.task and the SDK.",
      slug: "guides/cypress",
      title: "Test verification emails with Cypress",
      toc: [
        { id: "start-the-services", label: "Start the services" },
        { id: "register-the-tasks", label: "Register the tasks" },
        { id: "write-the-test", label: "Write the test" },
        { id: "parallel-isolation", label: "Parallel isolation" },
        { id: "direct-http-access", label: "Direct HTTP access" },
      ],
    },
    "guides/test-runners": {
      description:
        "Use lifecycle fixtures and SMTP fault injection with Bun test, Vitest, and Playwright.",
      slug: "guides/test-runners",
      title: "Test emails with Bun, Vitest, and Playwright",
      toc: [
        { id: "install-optional-peers", label: "Install optional peers" },
        { id: "shared-fixture", label: "Shared fixture" },
        { id: "bun-test", label: "Bun test" },
        { id: "vitest", label: "Vitest" },
        { id: "playwright", label: "Playwright" },
        { id: "isolation-and-cleanup", label: "Isolation and cleanup" },
        { id: "exercise-failure-paths", label: "Exercise failure paths" },
        { id: "choose-the-right-helper", label: "Choose a helper" },
      ],
    },
    "guides/better-auth": {
      description: "Verify Better Auth sign-up emails in a Next.js app with Playwright.",
      slug: "guides/better-auth",
      title: "Test Better Auth verification emails",
      toc: [
        { id: "wire-better-auth-to-inboxtap", label: "Wire Better Auth" },
        { id: "drive-the-flows-with-playwright", label: "Drive the flows" },
        { id: "run-the-example", label: "Run the example" },
      ],
    },
    "guides/nodemailer": {
      description: "Test Nodemailer delivery from an Express API with Vitest.",
      slug: "guides/nodemailer",
      title: "Test Nodemailer emails with Vitest",
      toc: [
        { id: "point-nodemailer-at-inboxtap", label: "Point Nodemailer at InboxTap" },
        { id: "test-with-vitest", label: "Test with Vitest" },
        { id: "run-the-example", label: "Run the example" },
      ],
    },
    "guides/ci": {
      description:
        "Run InboxTap in CI with a health-checked background step or a programmatic server.",
      slug: "guides/ci",
      title: "CI and GitHub Actions",
      toc: [
        { id: "two-ways-to-run-it", label: "Two ways to run it" },
        { id: "wait-for-health", label: "Wait for health" },
        { id: "github-actions-workflow", label: "GitHub Actions workflow" },
        { id: "ports-and-other-providers", label: "Ports and other providers" },
      ],
    },
    "guides/troubleshooting": {
      description:
        "Diagnose connection failures, missing emails, wait timeouts, and cross-test reads.",
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
    changelog: {
      description: "Release history for every InboxTap version, with links to pull requests.",
      slug: "changelog",
      title: "Changelog",
      // Version anchors come from CHANGELOG.md at build time, so this page has
      // no static table of contents.
      toc: [],
    },
  },
};
