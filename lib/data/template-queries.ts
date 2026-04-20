import "server-only";

import { listTemplates as listMockTemplates } from "@/lib/styloire/mock-data";
import type { Template } from "@/lib/styloire/types";
import { createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase/service";
import { getCurrentUserId } from "@/lib/supabase/server";

export async function listTemplatesResolved(): Promise<Template[]> {
  const userId = await getCurrentUserId();
  const mockRows = listMockTemplates();

  if (!userId || !isSupabaseConfigured()) {
    return mockRows;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return mockRows;
  }

  const { data, error } = await supabase
    .from("templates")
    .select("id,user_id,name,body,is_default,created_at")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockRows;
  }

  return (data as Template[]).sort((a, b) => {
    if (a.user_id === null && b.user_id !== null) return -1;
    if (a.user_id !== null && b.user_id === null) return 1;
    return a.name.localeCompare(b.name);
  });
}
