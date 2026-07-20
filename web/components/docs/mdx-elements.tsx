import type { ReactNode } from "react";

export function Callout({ children, title = "Note" }: { children: ReactNode; title?: string }) {
  return (
    <aside className="docs-callout">
      <span aria-hidden="true">i</span>
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </aside>
  );
}

export function Endpoint({
  children,
  method,
  path,
}: {
  children: ReactNode;
  method: string;
  path: string;
}) {
  return (
    <section className="endpoint-card">
      <div className="endpoint-heading">
        <span>{method}</span>
        <code>{path}</code>
      </div>
      <div>{children}</div>
    </section>
  );
}
