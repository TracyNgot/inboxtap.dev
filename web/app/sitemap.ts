import type { MetadataRoute } from "next";
import { docs } from "@/lib/docs-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date("2026-07-17T00:00:00.000Z");
  return [
    {
      changeFrequency: "monthly",
      lastModified: updatedAt,
      priority: 1,
      url: "https://inboxtap.dev",
    },
    ...docs.map((doc) => ({
      changeFrequency: "monthly" as const,
      lastModified: updatedAt,
      priority: doc.slug ? 0.7 : 0.9,
      url: `https://inboxtap.dev${doc.path}`,
    })),
  ];
}
