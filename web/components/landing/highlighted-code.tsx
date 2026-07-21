import { codeToHtml } from "shiki";

export async function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const html = await codeToHtml(code, {
    defaultColor: false,
    lang,
    themes: { dark: "github-dark", light: "github-light" },
  });

  return (
    <div
      className="code-highlight"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Build-time Shiki output rendered from local string constants.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
