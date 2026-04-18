import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = [
    "",
    "/how-it-works",
    "/faqs",
    "/contact",
    "/dashboard",
    "/requests/new",
    "/clients",
    "/templates",
    "/settings",
    "/demo"
  ];
  const now = new Date().toISOString();
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/dashboard") ? 0.8 : 0.6
  }));
}
