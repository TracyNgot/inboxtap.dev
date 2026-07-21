import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  trailingSlash: true,
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      "rehype-slug",
      [
        "@shikijs/rehype",
        {
          defaultColor: false,
          themes: {
            dark: "github-dark",
            light: "github-light",
          },
        },
      ],
    ],
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
