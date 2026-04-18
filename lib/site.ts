/** Canonical site URL for metadata, sitemap, and robots. Override in production with NEXT_PUBLIC_SITE_URL. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://styloire.co";
}

export function showDataSourceBanner(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DATA_SOURCE === "true";
}
