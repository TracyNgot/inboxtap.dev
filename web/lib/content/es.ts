import type { ComponentType } from "react";
import { localizedChangelog } from "@/components/docs/changelog-content";
import Alternatives from "@/content/docs/es/alternatives.mdx";
import Configuration from "@/content/docs/es/configuration.mdx";
import BetterAuth from "@/content/docs/es/guides/better-auth.mdx";
import Ci from "@/content/docs/es/guides/ci.mdx";
import Cypress from "@/content/docs/es/guides/cypress.mdx";
import Nodemailer from "@/content/docs/es/guides/nodemailer.mdx";
import Playwright from "@/content/docs/es/guides/playwright.mdx";
import TestRunners from "@/content/docs/es/guides/test-runners.mdx";
import Troubleshooting from "@/content/docs/es/guides/troubleshooting.mdx";
import Installation from "@/content/docs/es/installation.mdx";
import Introduction from "@/content/docs/es/introduction.mdx";
import QuickStart from "@/content/docs/es/quick-start.mdx";
import ClientSdk from "@/content/docs/es/reference/client-sdk.mdx";
import HttpApi from "@/content/docs/es/reference/http-api.mdx";
import Trust from "@/content/docs/es/trust.mdx";
import type { CoreDocKey } from "../docs-config";
import { es } from "../i18n/dictionaries/es";

export const contentEs = {
  "": Introduction,
  alternatives: Alternatives,
  changelog: localizedChangelog({
    full: es.docsChrome.changelogFull,
    release: es.docsChrome.changelogRelease,
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
} satisfies Record<CoreDocKey, ComponentType>;
