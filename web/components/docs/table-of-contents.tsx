"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  label: string;
}

export function TableOfContents({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70%", threshold: 0 },
    );
    for (const item of items) {
      const heading = document.getElementById(item.id);
      if (heading) observer.observe(heading);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="docs-toc">
      <p>On this page</p>
      <nav aria-label="On this page">
        {items.map((item) => (
          <a
            className={active === item.id ? "active" : undefined}
            href={`#${item.id}`}
            key={item.id}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
