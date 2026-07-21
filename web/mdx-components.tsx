import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/docs/code-block";
import { FlowDiagram } from "@/components/docs/flow-diagram";
import { Callout, Endpoint } from "@/components/docs/mdx-elements";
import { Version } from "@/components/docs/version";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    Endpoint,
    FlowDiagram,
    Version,
    pre: CodeBlock,
    ...components,
  };
}
