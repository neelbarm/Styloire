import "server-only";
import { serverEnv } from "@/lib/env/server";

export function googleOAuthWebConfig() {
  return {
    clientId: serverEnv.GOOGLE_CLIENT_ID,
    clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    redirectUri: serverEnv.GOOGLE_REDIRECT_URI,
  };
}

export function microsoftOAuthWebConfig() {
  return {
    clientId: serverEnv.MICROSOFT_CLIENT_ID,
    clientSecret: serverEnv.MICROSOFT_CLIENT_SECRET,
    tenantId: serverEnv.MICROSOFT_TENANT_ID,
    redirectUri: serverEnv.MICROSOFT_REDIRECT_URI,
  };
}
