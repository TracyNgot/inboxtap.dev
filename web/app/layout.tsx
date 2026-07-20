import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://inboxtap.dev"),
  title: {
    default: "InboxTap — deterministic email-flow tests",
    template: "%s · InboxTap",
  },
  description:
    "A local-only SMTP capture server and test SDK for verification links, OTPs, and email-flow tests.",
  alternates: { canonical: "/" },
  openGraph: {
    description:
      "Capture local SMTP messages and await verification links, codes, and matches directly from your tests.",
    siteName: "InboxTap",
    title: "InboxTap — deterministic email-flow tests",
    type: "website",
    url: "https://inboxtap.dev",
  },
  twitter: {
    card: "summary_large_image",
    description: "Local SMTP capture for deterministic email-flow tests.",
    title: "InboxTap",
  },
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("inboxtap-theme");
    const theme = stored === "light" || stored === "dark"
      ? stored
      : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: The static theme bootstrap prevents a color-mode flash and contains no user input. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
