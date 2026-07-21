import type { ReactNode } from "react";
import { RootDocument } from "@/components/shared/root-document";
import { rootMetadata, siteViewport } from "@/lib/seo/metadata";

export const metadata = rootMetadata("en");
export const viewport = siteViewport;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
