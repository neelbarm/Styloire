import crypto from "crypto";

const COOKIE_MAX_AGE_SEC = 600;

export function createOAuthState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export const oauthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE_SEC,
};

export function googleStateCookieName(): string {
  return "styloire_oauth_google_state";
}

export function microsoftStateCookieName(): string {
  return "styloire_oauth_microsoft_state";
}
