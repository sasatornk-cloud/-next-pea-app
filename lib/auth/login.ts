import { normalizeEmail } from "./rules";

export interface LoginAttemptStore {
  isLocked(email: string): Promise<boolean>;
  /** Records a failed attempt; resolves true if this failure locked the account. */
  recordFailure(email: string): Promise<boolean>;
  reset(email: string): Promise<void>;
}

export type PasswordCheck = "OK" | "INVALID_CREDENTIALS" | "ERROR";

export type LoginResult = "OK" | "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" | "ERROR";

export type LoginDeps = {
  attempts: LoginAttemptStore;
  checkPassword(email: string, password: string): Promise<PasswordCheck>;
};

// Attempts are tracked per email whether or not an account exists, so the
// lock message can't be used to probe which emails are members.
export async function login(
  rawEmail: string,
  password: string,
  deps: LoginDeps,
): Promise<LoginResult> {
  const email = normalizeEmail(rawEmail);
  if (email === "" || password === "") return "INVALID_CREDENTIALS";

  if (await deps.attempts.isLocked(email)) return "ACCOUNT_LOCKED";

  const check = await deps.checkPassword(email, password);
  if (check === "OK") {
    await deps.attempts.reset(email);
    return "OK";
  }
  if (check === "ERROR") return "ERROR";

  const locked = await deps.attempts.recordFailure(email);
  return locked ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS";
}
