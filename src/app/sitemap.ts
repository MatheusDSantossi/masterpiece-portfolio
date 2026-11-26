import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/site";

const latest = projects.map((project) => project.updatedAt).sort().at(-1);

// Next.js reads the sitemap from the default export.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: latest, priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: latest, priority: 0.9 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      priority: 0.7,
    })),
  ];
}
