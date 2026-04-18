import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env/server";
import { createServiceRoleClient } from "./service";

export function createUserServerClient() {
  const cookieStore = cookies();
  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; session refresh is skipped here.
        }
      }
    }
  });
}

export async function getCurrentUser() {
  const supabase = createUserServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function getAuthedServiceRoleClient() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const client = createServiceRoleClient();
  if (!client) return null;
  return { client, userId };
}
