import { createClient } from "@supabase/supabase-js";

// Service-role client for admin-only operations (looking up a user's email
// by id, or finding a user by email to add as a member). Never expose this
// to the browser — SUPABASE_SECRET_KEY bypasses RLS and Auth entirely.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
