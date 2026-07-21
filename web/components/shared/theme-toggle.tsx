"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export interface ThemeToggleLabels {
  toggle: string;
  toLight: string;
  toDark: string;
}

const defaultLabels: ThemeToggleLabels = {
  toDark: "Switch to dark theme",
  toggle: "Toggle color theme",
  toLight: "Switch to light theme",
};

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle({ labels = defaultLabels }: { labels?: ThemeToggleLabels }) {
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
      aria-label={theme ? (theme === "dark" ? labels.toLight : labels.toDark) : labels.toggle}
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
