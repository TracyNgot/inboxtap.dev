import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { docGroups } from "@/lib/docs-config";
import { getDictionary, getDocsDictionary, getLocalizedDocs } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { DocsSidebar, type SidebarGroup } from "./docs-sidebar";

export function DocsShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const docsDictionary = getDocsDictionary(locale);
  const docs = getLocalizedDocs(locale);

  const groups: SidebarGroup[] = docGroups.map((group) => ({
    items: docs
      .filter((doc) => doc.group === group)
      .map((doc) => ({ path: doc.path, title: doc.title })),
    label: docsDictionary.groups[group],
  }));

  return (
    <>
      <SiteHeader locale={locale} t={dictionary.chrome} />
      <div className="docs-shell">
        <DocsSidebar
          groups={groups}
          labels={{
            browse: dictionary.docsChrome.browse,
            closeAria: dictionary.docsChrome.closeAria,
            closeOverlayAria: dictionary.docsChrome.closeOverlayAria,
            heading: dictionary.docsChrome.heading,
            navAria: dictionary.docsChrome.navAria,
          }}
        />
        <main className="docs-main">{children}</main>
      </div>
      <SiteFooter t={dictionary.chrome} />
    </>
  );
}
