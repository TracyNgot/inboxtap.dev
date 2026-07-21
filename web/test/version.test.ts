import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import rootPackage from "../../package.json";
import { Version } from "@/components/docs/version";
import nextConfig from "../next.config";

const versionedDocs = [
  "en/introduction.mdx",
  "en/configuration.mdx",
  "en/guides/troubleshooting.mdx",
  "fr/introduction.mdx",
  "fr/configuration.mdx",
  "fr/guides/troubleshooting.mdx",
  "es/introduction.mdx",
  "es/configuration.mdx",
  "es/guides/troubleshooting.mdx",
] as const;

describe("documentation version", () => {
  test("injects the root package version at build time", () => {
    expect(nextConfig.env?.INBOXTAP_VERSION).toBe(rootPackage.version);
  });

  test("renders the injected version", () => {
    const previousVersion = process.env.INBOXTAP_VERSION;

    try {
      process.env.INBOXTAP_VERSION = rootPackage.version;
      expect(renderToStaticMarkup(createElement(Version))).toBe(
        `<span>${rootPackage.version}</span>`,
      );
    } finally {
      if (previousVersion === undefined) {
        delete process.env.INBOXTAP_VERSION;
      } else {
        process.env.INBOXTAP_VERSION = previousVersion;
      }
    }
  });

  test("uses the shared component in every versioned document", () => {
    const contentRoot = join(import.meta.dir, "..", "content", "docs");

    for (const file of versionedDocs) {
      expect(readFileSync(join(contentRoot, file), "utf8"), file).toContain("<Version />");
    }
  });
});
