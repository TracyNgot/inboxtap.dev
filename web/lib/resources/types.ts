import type { DocKey } from "../docs-config";

export const resourcePageKeys = [
  "integrations/playwright",
  "integrations/cypress",
  "integrations/vitest",
  "integrations/better-auth",
  "integrations/supabase",
  "integrations/nodemailer",
  "guides/test-magic-links",
  "guides/test-email-otp",
  "guides/test-password-reset-emails",
  "compare/mailhog",
  "compare/mailpit",
  "compare/mailtrap",
] as const;

export type ResourcePageKey = (typeof resourcePageKeys)[number];
export type ResourceKind = "compare" | "guides" | "integrations";

export interface ResourceCode {
  filename: string;
  language: "bash" | "typescript";
  source: string;
}

export interface ResourceLink {
  href: string;
  label: string;
}

export interface ResourceTable {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface ResourceSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  code?: ResourceCode;
  links?: readonly ResourceLink[];
  table?: ResourceTable;
}

export interface ResourcePageContent {
  cta: {
    description: string;
    label: string;
    title: string;
  };
  description: string;
  eyebrow: string;
  intro: string;
  kind: ResourceKind;
  relatedDocKey: DocKey;
  section: string;
  sections: readonly ResourceSection[];
  slug: string;
  title: string;
}

export type ResourceContentDictionary = Record<ResourcePageKey, ResourcePageContent>;
