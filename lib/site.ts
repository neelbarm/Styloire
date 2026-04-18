import { clientEnv } from "@/lib/env/client";

/** Canonical site URL for metadata, sitemap, and robots. */
export function siteUrl(): string {
  return clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

export function showDataSourceBanner(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DATA_SOURCE === "true";
}
