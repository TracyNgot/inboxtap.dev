import type { ComponentType } from "react";
import { localizedChangelog } from "@/components/docs/changelog-content";
import Alternatives from "@/content/docs/fr/alternatives.mdx";
import Configuration from "@/content/docs/fr/configuration.mdx";
import BetterAuth from "@/content/docs/fr/guides/better-auth.mdx";
import Ci from "@/content/docs/fr/guides/ci.mdx";
import Cypress from "@/content/docs/fr/guides/cypress.mdx";
import Nodemailer from "@/content/docs/fr/guides/nodemailer.mdx";
import Playwright from "@/content/docs/fr/guides/playwright.mdx";
import TestRunners from "@/content/docs/fr/guides/test-runners.mdx";
import Troubleshooting from "@/content/docs/fr/guides/troubleshooting.mdx";
import Installation from "@/content/docs/fr/installation.mdx";
import Introduction from "@/content/docs/fr/introduction.mdx";
import QuickStart from "@/content/docs/fr/quick-start.mdx";
import ClientSdk from "@/content/docs/fr/reference/client-sdk.mdx";
import HttpApi from "@/content/docs/fr/reference/http-api.mdx";
import type { DocKey } from "../docs-config";
import { fr } from "../i18n/dictionaries/fr";

export const contentFr = {
  "": Introduction,
  alternatives: Alternatives,
  changelog: localizedChangelog({
    full: fr.docsChrome.changelogFull,
    release: fr.docsChrome.changelogRelease,
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
} satisfies Record<DocKey, ComponentType>;
