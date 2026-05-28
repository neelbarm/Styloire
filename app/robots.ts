import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/login",
          "/onboarding",
          "/settings",
          "/requests/",
          "/roster",
          "/clients",
          "/templates",
          "/reset-password"
        ]
      }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
