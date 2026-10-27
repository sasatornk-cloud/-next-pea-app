"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  MESSAGES,
  safeNextPath,
  validateSignup,
  type FieldErrors,
  type Member,
} from "@/lib/auth/rules";

// Everything the form sends back except the passwords, which are always
// cleared after a failed submit (US-01 AC6).
export type SignupValues = {
  userType: string;
  fullName: string;
  email: string;
  employeeId: string;
  affiliation: string;
  consent: boolean;
};

export type SignupState = {
  values: SignupValues;
  errors: FieldErrors;
  message?: string;
};

type CreateResult = "OK" | "EMAIL_TAKEN" | "EMPLOYEE_ID_TAKEN" | "WEAK_PASSWORD" | "ERROR";

// Accounts are created with the secret key so every rule above is enforced
// server-side; public sign-ups should be disabled in the Supabase dashboard.
async function createMember(member: Member): Promise<CreateResult> {
  const admin = createAdminClient();

  if (member.userType === "EMPLOYEE") {
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("employee_id", member.employeeId)
      .maybeSingle();
    if (error) return "ERROR";
    if (data) return "EMPLOYEE_ID_TAKEN";
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: member.email,
    password: member.password,
    email_confirm: true,
  });
  if (error) {
    if (error.code === "email_exists") return "EMAIL_TAKEN";
    if (error.code === "weak_password") return "WEAK_PASSWORD";
    return "ERROR";
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    user_type: member.userType,
    full_name: member.fullName,
    employee_id: member.userType === "EMPLOYEE" ? member.employeeId : null,
    affiliation: member.userType === "EMPLOYEE" ? member.affiliation : null,
    pdpa_consented_at: new Date().toISOString(),
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    // unique_violation: another sign-up took the employee ID in the meantime
    return profileError.code === "23505" ? "EMPLOYEE_ID_TAKEN" : "ERROR";
  }

  return "OK";
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const values: SignupValues = {
    userType: field(formData, "userType"),
    fullName: field(formData, "fullName"),
    email: field(formData, "email"),
    employeeId: field(formData, "employeeId"),
    affiliation: field(formData, "affiliation"),
    consent: formData.get("consent") === "on",
  };

  const validation = validateSignup({
    ...values,
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });
  if (!validation.ok) return { values, errors: validation.errors };

  const { member } = validation;
  let result: CreateResult;
  try {
    result = await createMember(member);
  } catch {
    result = "ERROR";
  }

  switch (result) {
    case "EMAIL_TAKEN":
      return { values, errors: { email: MESSAGES.emailTaken } };
    case "EMPLOYEE_ID_TAKEN":
      return { values, errors: { employeeId: MESSAGES.employeeIdTaken } };
    case "WEAK_PASSWORD":
      return { values, errors: { password: MESSAGES.weakPassword } };
    case "ERROR":
      return { values, errors: {}, message: MESSAGES.unexpected };
  }

  // Signed in straight after sign-up; if that fails the account still exists,
  // so send the member to the login page instead of showing an error.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: member.email,
    password: member.password,
  });
  const next = safeNextPath(field(formData, "next"));
  if (error) redirect(`/login?next=${encodeURIComponent(next)}`);
  redirect(next);
}
