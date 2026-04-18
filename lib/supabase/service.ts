import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";

export function isSupabaseConfigured(): boolean {
  return Boolean(serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY);
}

export function createServiceRoleClient(): SupabaseClient | null {
  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
