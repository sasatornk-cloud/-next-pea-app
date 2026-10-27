import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged client using the secret key — bypasses RLS. Server-only: never
 * import this from a Client Component or expose the key via NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
