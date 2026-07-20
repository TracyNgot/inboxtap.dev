"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useRef, useState } from "react";

export function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const { style, ...preProps } = props;

  async function copyCode() {
    const value = codeRef.current?.innerText ?? "";
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(value);
      else copyWithSelection(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_600);
    } catch {
      try {
        copyWithSelection(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1_600);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <div className="docs-code-block">
      <button aria-label="Copy code" onClick={copyCode} type="button">
        {copied ? "Copied" : "Copy"}
      </button>
      <pre {...preProps} ref={codeRef} style={{ ...style, background: "transparent" }} />
    </div>
  );
}

function copyWithSelection(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was rejected");
}
