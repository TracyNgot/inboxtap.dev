"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface SidebarGroup {
  label: string;
  items: readonly { title: string; path: string }[];
}

export interface SidebarLabels {
  browse: string;
  heading: string;
  navAria: string;
  closeOverlayAria: string;
  closeAria: string;
}

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function DocsSidebar({
  groups,
  labels,
}: {
  groups: readonly SidebarGroup[];
  labels: SidebarLabels;
}) {
  const pathname = normalizePath(usePathname());
  const [open, setOpen] = useState(false);

  const navigation = (
    <nav aria-label={labels.navAria}>
      {groups.map((group) => (
        <div className="docs-nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.items.map((item) => (
            <Link
              aria-current={pathname === item.path ? "page" : undefined}
              className={pathname === item.path ? "active" : undefined}
              href={item.path}
              key={item.path}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button className="docs-menu-button" onClick={() => setOpen(true)} type="button">
        {labels.browse} <span aria-hidden="true">→</span>
      </button>
      <button
        aria-label={labels.closeOverlayAria}
        className={`docs-drawer-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
        type="button"
      />
      <aside className={`docs-sidebar ${open ? "open" : ""}`}>
        <div className="docs-drawer-heading">
          <strong>{labels.heading}</strong>
          <button aria-label={labels.closeAria} onClick={() => setOpen(false)} type="button">
            ×
          </button>
        </div>
        {navigation}
      </aside>
    </>
  );
}
