import type { ComponentType } from "react";
import { localizedChangelog } from "@/components/docs/changelog-content";
import Alternatives from "@/content/docs/en/alternatives.mdx";
import Configuration from "@/content/docs/en/configuration.mdx";
import BetterAuth from "@/content/docs/en/guides/better-auth.mdx";
import Ci from "@/content/docs/en/guides/ci.mdx";
import Cypress from "@/content/docs/en/guides/cypress.mdx";
import Nodemailer from "@/content/docs/en/guides/nodemailer.mdx";
import Playwright from "@/content/docs/en/guides/playwright.mdx";
import TestRunners from "@/content/docs/en/guides/test-runners.mdx";
import Troubleshooting from "@/content/docs/en/guides/troubleshooting.mdx";
import Installation from "@/content/docs/en/installation.mdx";
import Introduction from "@/content/docs/en/introduction.mdx";
import QuickStart from "@/content/docs/en/quick-start.mdx";
import ClientSdk from "@/content/docs/en/reference/client-sdk.mdx";
import HttpApi from "@/content/docs/en/reference/http-api.mdx";
import Trust from "@/content/docs/en/trust.mdx";
import type { DocKey } from "../docs-config";
import { en } from "../i18n/dictionaries/en";

export const contentEn = {
  "": Introduction,
  alternatives: Alternatives,
  changelog: localizedChangelog({
    full: en.docsChrome.changelogFull,
    release: en.docsChrome.changelogRelease,
  }),
  configuration: Configuration,
  "guides/better-auth": BetterAuth,
  "guides/ci": Ci,
  "guides/cypress": Cypress,
  "guides/nodemailer": Nodemailer,
  "guides/playwright": Playwright,
  "guides/test-runners": TestRunners,
  "guides/troubleshooting": Troubleshooting,
  installation: Installation,
  "quick-start": QuickStart,
  "reference/client-sdk": ClientSdk,
  "reference/http-api": HttpApi,
  trust: Trust,
} satisfies Record<DocKey, ComponentType>;
