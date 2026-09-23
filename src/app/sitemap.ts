import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const agencies = await prisma.agency.findMany({
    select: {
      slug: true,
      updatedAt: true,
      properties: { select: { slug: true, updatedAt: true } },
    },
  });

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
  ];

  for (const agency of agencies) {
    entries.push({
      url: `${base}/${agency.slug}`,
      lastModified: agency.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    });

    for (const property of agency.properties) {
      entries.push({
        url: `${base}/${agency.slug}/propiedades/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}