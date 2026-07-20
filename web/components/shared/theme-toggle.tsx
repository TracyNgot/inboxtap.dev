"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => setTheme(currentTheme()), []);

  function toggleTheme() {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("inboxtap-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      aria-label={
        theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle color theme"
      }
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="theme-icon">
        <span />
      </span>
    </button>
  );
}
