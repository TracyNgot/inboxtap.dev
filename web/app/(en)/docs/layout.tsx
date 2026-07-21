import type { ReactNode } from "react";
import { DocsShell } from "@/components/docs/docs-shell";
import { docsLayoutMetadata } from "@/lib/seo/metadata";

export const metadata = docsLayoutMetadata("en");

export default function DocsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DocsShell locale="en">{children}</DocsShell>;
}
