import "server-only";
import { serverEnv } from "@/lib/env/server";

export function publicSiteOrigin(request: Request): string {
  const configured = serverEnv.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}
