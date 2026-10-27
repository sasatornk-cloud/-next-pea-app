"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAttemptStore } from "@/lib/auth/attempts";
import { login, type LoginResult } from "@/lib/auth/login";
import { MESSAGES, safeNextPath } from "@/lib/auth/rules";

export type LoginState = { email: string; message?: string };

const FAILURE_MESSAGES: Record<Exclude<LoginResult, "OK">, string> = {
  INVALID_CREDENTIALS: MESSAGES.invalidCredentials,
  ACCOUNT_LOCKED: MESSAGES.accountLocked,
  ERROR: MESSAGES.unexpected,
};

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = field(formData, "email");
  const supabase = await createClient();

  let result: LoginResult;
  try {
    result = await login(email, field(formData, "password"), {
      attempts: supabaseAttemptStore(),
      async checkPassword(normalizedEmail, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!error) return "OK";
        return error.code === "invalid_credentials" ? "INVALID_CREDENTIALS" : "ERROR";
      },
    });
  } catch {
    result = "ERROR";
  }

  if (result !== "OK") return { email, message: FAILURE_MESSAGES[result] };
  redirect(safeNextPath(field(formData, "next")));
}
