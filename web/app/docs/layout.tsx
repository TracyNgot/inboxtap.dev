import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { SiteHeader } from "@/components/shared/site-header";

export const metadata: Metadata = {
  title: { default: "Documentation", template: "%s · InboxTap Docs" },
};

export default function DocsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <div className="docs-shell">
        <DocsSidebar />
        <main className="docs-main">{children}</main>
      </div>
    </>
  );
}
