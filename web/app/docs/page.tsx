import type { Metadata } from "next";
import { DocPage } from "@/components/docs/doc-page";
import { docs } from "@/lib/docs-config";

const doc = docs[0];

export const metadata: Metadata = {
  alternates: { canonical: doc.path },
  description: doc.description,
  title: doc.title,
};

export default function DocumentationPage() {
  return <DocPage slug="" />;
}
