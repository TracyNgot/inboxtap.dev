import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout, Endpoint } from "@/components/docs/mdx-elements";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    Endpoint,
    pre: CodeBlock,
    ...components,
  };
}
