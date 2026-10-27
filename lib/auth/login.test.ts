import { describe, expect, it } from "vitest";
import { login, type LoginAttemptStore, type PasswordCheck } from "./login";

const MEMBER = { email: "somchai@example.com", password: "abc12345" };

// Lock after 3 failures; the real thresholds live in the Postgres function.
function fakeStore(maxFailures = 3) {
  const failures = new Map<string, number>();
  const locked = new Set<string>();
  const store: LoginAttemptStore = {
    async isLocked(email) {
      return locked.has(email);
    },
    async recordFailure(email) {
      const count = (failures.get(email) ?? 0) + 1;
      failures.set(email, count);
      if (count >= maxFailures) locked.add(email);
      return locked.has(email);
    },
    async reset(email) {
      failures.delete(email);
    },
  };
  return { store, failures, locked };
}

function deps(store: LoginAttemptStore) {
  const checked: string[] = [];
  return {
    checked,
    deps: {
      attempts: store,
      async checkPassword(email: string, password: string): Promise<PasswordCheck> {
        checked.push(email);
        return email === MEMBER.email && password === MEMBER.password
          ? "OK"
          : "INVALID_CREDENTIALS";
      },
    },
  };
}

describe("login", () => {
  it("signs in with a normalized email", async () => {
    const { store } = fakeStore();
    const { deps: d, checked } = deps(store);
    expect(await login("  SomChai@Example.com ", MEMBER.password, d)).toBe("OK");
    expect(checked).toEqual([MEMBER.email]);
  });

  it("AS-10 gives the same result for an unknown email and a wrong password", async () => {
    const { store } = fakeStore();
    const { deps: d } = deps(store);
    expect(await login("nobody@example.com", "whatever1", d)).toBe("INVALID_CREDENTIALS");
    expect(await login(MEMBER.email, "wrong-pass", d)).toBe("INVALID_CREDENTIALS");
  });

  it("reports the lock on the failure that triggers it", async () => {
    const { store } = fakeStore(3);
    const { deps: d } = deps(store);
    expect(await login(MEMBER.email, "wrong", d)).toBe("INVALID_CREDENTIALS");
    expect(await login(MEMBER.email, "wrong", d)).toBe("INVALID_CREDENTIALS");
    expect(await login(MEMBER.email, "wrong", d)).toBe("ACCOUNT_LOCKED");
  });

  it("AS-11 refuses a correct password while locked, without checking it", async () => {
    const { store, locked } = fakeStore();
    locked.add(MEMBER.email);
    const { deps: d, checked } = deps(store);
    expect(await login(MEMBER.email, MEMBER.password, d)).toBe("ACCOUNT_LOCKED");
    expect(checked).toEqual([]);
  });

  it("AS-12 resets the failure count after a successful login", async () => {
    const { store, failures } = fakeStore();
    const { deps: d } = deps(store);
    await login(MEMBER.email, "wrong", d);
    await login(MEMBER.email, "wrong", d);
    expect(await login(MEMBER.email, MEMBER.password, d)).toBe("OK");
    expect(failures.has(MEMBER.email)).toBe(false);
  });

  it("does not count failures that aren't wrong credentials", async () => {
    const { store, failures } = fakeStore();
    const result = await login(MEMBER.email, MEMBER.password, {
      attempts: store,
      checkPassword: async () => "ERROR",
    });
    expect(result).toBe("ERROR");
    expect(failures.size).toBe(0);
  });
});
