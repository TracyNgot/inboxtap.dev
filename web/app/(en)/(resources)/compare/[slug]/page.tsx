import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourcePage } from "@/components/resources/resource-page";
import { getLocalizedResources, getResourceBySegments } from "@/lib/resources";
import { resourceMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalizedResources("en")
    .filter((resource) => resource.kind === "compare")
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resource = getResourceBySegments("en", "compare", (await params).slug);
  return resource ? resourceMetadata("en", resource.key) : {};
}

export default async function EnglishComparisonPage({ params }: PageProps) {
  const resource = getResourceBySegments("en", "compare", (await params).slug);
  if (!resource) notFound();
  return <ResourcePage locale="en" resourceKey={resource.key} />;
}
