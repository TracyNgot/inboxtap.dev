import { createRequire } from "node:module";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rootPackage from "../package.json";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  env: {
    INBOXTAP_VERSION: rootPackage.version,
  },
  experimental: { globalNotFound: true },
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  trailingSlash: true,
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    rehypePlugins: [
      require.resolve("rehype-slug"),
      [
        require.resolve("@shikijs/rehype"),
        {
          defaultColor: false,
          themes: {
            dark: "github-dark",
            light: "github-light",
          },
        },
      ],
    ],
    remarkPlugins: [require.resolve("remark-gfm")],
  },
});

export default withMDX(nextConfig);
