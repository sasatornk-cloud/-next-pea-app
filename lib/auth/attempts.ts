import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LoginAttemptStore } from "./login";
import { LOCKOUT_MINUTES, MAX_LOGIN_FAILURES } from "./rules";

// Lock state lives in public.login_attempts, reachable only with the secret
// key. Transitions run inside Postgres so concurrent failures can't undercount.
export function supabaseAttemptStore(): LoginAttemptStore {
  const db = createAdminClient();

  return {
    async isLocked(email) {
      const { data, error } = await db.rpc("is_login_locked", { p_email: email });
      if (error) throw error;
      return data === true;
    },

    async recordFailure(email) {
      const { data, error } = await db.rpc("record_login_failure", {
        p_email: email,
        p_max_failures: MAX_LOGIN_FAILURES,
        p_lockout_minutes: LOCKOUT_MINUTES,
      });
      if (error) throw error;
      return data === true;
    },

    async reset(email) {
      const { error } = await db.from("login_attempts").delete().eq("email", email);
      if (error) throw error;
    },
  };
}
