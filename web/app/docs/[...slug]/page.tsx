import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/doc-page";
import { docs, getDocBySegments } from "@/lib/docs-config";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.filter((doc) => doc.slug).map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = getDocBySegments((await params).slug);
  if (!doc) return {};
  return {
    alternates: { canonical: doc.path },
    description: doc.description,
    openGraph: { description: doc.description, title: doc.title, url: doc.path },
    title: doc.title,
  };
}

export default async function DocumentationDetailPage({ params }: PageProps) {
  const doc = getDocBySegments((await params).slug);
  if (!doc?.slug) notFound();
  return <DocPage slug={doc.slug} />;
}
