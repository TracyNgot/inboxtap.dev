import type { ComponentType } from "react";
import Alternatives from "@/content/docs/alternatives.mdx";
import Configuration from "@/content/docs/configuration.mdx";
import BetterAuth from "@/content/docs/guides/better-auth.mdx";
import Ci from "@/content/docs/guides/ci.mdx";
import Cypress from "@/content/docs/guides/cypress.mdx";
import Nodemailer from "@/content/docs/guides/nodemailer.mdx";
import Playwright from "@/content/docs/guides/playwright.mdx";
import TestRunners from "@/content/docs/guides/test-runners.mdx";
import Troubleshooting from "@/content/docs/guides/troubleshooting.mdx";
import Installation from "@/content/docs/installation.mdx";
import Introduction from "@/content/docs/introduction.mdx";
import QuickStart from "@/content/docs/quick-start.mdx";
import ClientSdk from "@/content/docs/reference/client-sdk.mdx";
import HttpApi from "@/content/docs/reference/http-api.mdx";
import type { DocSlug } from "./docs-config";

const contentBySlug = {
  "": Introduction,
  alternatives: Alternatives,
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
} satisfies Record<DocSlug, ComponentType>;

export function getDocContent(slug: DocSlug): ComponentType {
  return contentBySlug[slug];
}
