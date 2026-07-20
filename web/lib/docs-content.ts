import type { ComponentType } from "react";
import Configuration from "@/content/docs/configuration.mdx";
import Playwright from "@/content/docs/guides/playwright.mdx";
import TestRunners from "@/content/docs/guides/test-runners.mdx";
import Installation from "@/content/docs/installation.mdx";
import Introduction from "@/content/docs/introduction.mdx";
import QuickStart from "@/content/docs/quick-start.mdx";
import ClientSdk from "@/content/docs/reference/client-sdk.mdx";
import HttpApi from "@/content/docs/reference/http-api.mdx";
import type { DocSlug } from "./docs-config";

const contentBySlug = {
  "": Introduction,
  configuration: Configuration,
  "guides/playwright": Playwright,
  "guides/test-runners": TestRunners,
  installation: Installation,
  "quick-start": QuickStart,
  "reference/client-sdk": ClientSdk,
  "reference/http-api": HttpApi,
} satisfies Record<DocSlug, ComponentType>;

export function getDocContent(slug: DocSlug): ComponentType {
  return contentBySlug[slug];
}
