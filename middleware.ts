import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function apexHost(host: string): string {
  const lower = host.toLowerCase();
  return lower.startsWith("www.") ? lower.slice(4) : lower;
}

/**
 * Redirect www ↔ apex so every URL matches NEXT_PUBLIC_SITE_URL (fixes duplicate URLs in Search Console).
 */
export function middleware(request: NextRequest) {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!raw) return NextResponse.next();

  let canonical: URL;
  try {
    canonical = new URL(raw);
  } catch {
    return NextResponse.next();
  }

  const requestHost = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!requestHost) return NextResponse.next();

  const canonicalHost = canonical.hostname.toLowerCase();

  if (requestHost === canonicalHost) {
    return NextResponse.next();
  }

  // Only redirect alternate hostname variants (www vs non-www), never unrelated hosts (preview deployments).
  if (apexHost(requestHost) !== apexHost(canonicalHost)) {
    return NextResponse.next();
  }

  const pathWithSearch = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const dest = new URL(`${canonical.origin}${pathWithSearch}`);

  return NextResponse.redirect(dest, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
