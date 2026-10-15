import type { MetadataRoute } from "next";
import { getProjects, getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";

// Regenerates with the public pages (revalidatePublic() covers this route too).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjects(),
  ]);

  return [
    {
      url: base,
      lastModified: settings.updated_at,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/projects`,
      lastModified: projects[0]?.updated_at ?? settings.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/book`,
      lastModified: settings.updated_at,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projects
      .filter((p) => !p.noindex)
      .map((p) => ({
        url: `${base}/projects/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
