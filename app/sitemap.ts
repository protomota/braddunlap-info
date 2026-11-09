import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

// The site is one page. The resume files are linked from it, so crawlers find
// them without a sitemap entry competing with the page itself.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${SITE}/og-image.jpg`, `${SITE}/img/brad.jpg`],
    },
  ];
}
