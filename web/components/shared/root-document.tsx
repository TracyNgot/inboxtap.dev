import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

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

interface RootDocumentProps {
  bootstrapScript?: string;
  children: ReactNode;
  htmlAttributes?: Omit<ComponentPropsWithoutRef<"html">, "children" | "lang"> &
    Partial<Record<`data-${string}`, string>>;
  lang: string;
}

export function RootDocument({
  bootstrapScript,
  children,
  htmlAttributes,
  lang,
}: RootDocumentProps) {
  return (
    <html {...htmlAttributes} lang={lang} suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: This component renders the shared root layout document, where Next.js expects a literal <head>. */}
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: The static theme bootstrap prevents a color-mode flash and contains no user input. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {bootstrapScript ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Callers provide a static, source-controlled bootstrap with no user input.
          <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
        ) : null}
      </head>
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
