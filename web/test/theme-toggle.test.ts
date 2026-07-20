import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeToggle } from "@/components/shared/theme-toggle";

test("theme toggle renders hydration-stable markup before the browser theme is available", () => {
  const html = renderToStaticMarkup(createElement(ThemeToggle));

  expect(html).toContain('aria-label="Toggle color theme"');
  expect(html).not.toContain("Switch to light theme");
  expect(html).not.toContain("Switch to dark theme");
});
