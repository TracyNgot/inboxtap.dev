"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { docGroups, docs } from "@/lib/docs-config";

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function DocsSidebar() {
  const pathname = normalizePath(usePathname());
  const [open, setOpen] = useState(false);

  const navigation = (
    <nav aria-label="Documentation navigation">
      {docGroups.map((group) => (
        <div className="docs-nav-group" key={group.key}>
          <p>{group.label}</p>
          {docs
            .filter((doc) => doc.group === group.key)
            .map((doc) => (
              <Link
                aria-current={pathname === doc.path ? "page" : undefined}
                className={pathname === doc.path ? "active" : undefined}
                href={doc.path}
                key={doc.path}
                onClick={() => setOpen(false)}
              >
                {doc.title}
              </Link>
            ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button className="docs-menu-button" onClick={() => setOpen(true)} type="button">
        Browse documentation <span aria-hidden="true">→</span>
      </button>
      <button
        aria-label="Close documentation navigation"
        className={`docs-drawer-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
        type="button"
      />
      <aside className={`docs-sidebar ${open ? "open" : ""}`}>
        <div className="docs-drawer-heading">
          <strong>Documentation</strong>
          <button aria-label="Close navigation" onClick={() => setOpen(false)} type="button">
            ×
          </button>
        </div>
        {navigation}
      </aside>
    </>
  );
}
