import { describe, expect, it } from "vitest";
import { MESSAGES, safeNextPath, validateSignup, type SignupInput } from "./rules";

const PUBLIC_INPUT: SignupInput = {
  userType: "PUBLIC",
  fullName: "สมชาย ใจดี",
  email: "somchai@gmail.com",
  password: "abc12345",
  confirmPassword: "abc12345",
  employeeId: "",
  affiliation: "",
  consent: true,
};

const EMPLOYEE_INPUT: SignupInput = {
  ...PUBLIC_INPUT,
  userType: "EMPLOYEE",
  email: "somchai@pea.co.th",
  employeeId: "123456",
  affiliation: "HQ",
};

function errorsFor(patch: Partial<SignupInput>, base = PUBLIC_INPUT) {
  const result = validateSignup({ ...base, ...patch });
  return result.ok ? {} : result.errors;
}

describe("validateSignup", () => {
  it("AS-01 accepts a valid employee and a valid public member", () => {
    expect(validateSignup(EMPLOYEE_INPUT)).toMatchObject({
      ok: true,
      member: { userType: "EMPLOYEE", employeeId: "123456", affiliation: "HQ" },
    });
    expect(validateSignup(PUBLIC_INPUT)).toMatchObject({
      ok: true,
      member: { userType: "PUBLIC" },
    });
  });

  it("rejects a missing or unknown user type", () => {
    expect(errorsFor({ userType: "" }).userType).toBe(MESSAGES.userTypeRequired);
    expect(errorsFor({ userType: "ADMIN" }).userType).toBe(MESSAGES.userTypeRequired);
  });

  it.each([
    ["ก", false],
    ["กข", true],
    ["  ก  ", false],
    ["ก".repeat(100), true],
    ["ก".repeat(101), false],
  ])("AS-02 name %j passes: %s", (fullName, passes) => {
    expect(errorsFor({ fullName }).fullName === undefined).toBe(passes);
  });

  it("trims the name before saving", () => {
    const result = validateSignup({ ...PUBLIC_INPUT, fullName: "  สมชาย  " });
    expect(result.ok && result.member.fullName).toBe("สมชาย");
  });

  it("AS-03 normalizes the email so duplicates compare equal", () => {
    const result = validateSignup({ ...PUBLIC_INPUT, email: " somchai@EXAMPLE.com " });
    expect(result.ok && result.member.email).toBe("somchai@example.com");
  });

  it("rejects a malformed email", () => {
    expect(errorsFor({ email: "somchai@" }).email).toBe(MESSAGES.emailInvalid);
  });

  it.each([
    ["abc1234", "abc1234", "password"],
    ["abc12345", "abc12345", null],
    ["abc12345", "abc12346", "confirmPassword"],
    [" abc1234", " abc1234", null],
  ])("AS-04 password %j / %j fails on: %s", (password, confirmPassword, field) => {
    const errors = errorsFor({ password, confirmPassword });
    expect(Object.keys(errors)).toEqual(field ? [field] : []);
  });

  it("AS-04 reports the mismatch message", () => {
    expect(errorsFor({ confirmPassword: "abc12346" }).confirmPassword).toBe(
      MESSAGES.passwordMismatch,
    );
  });

  it("does not trim the password", () => {
    const result = validateSignup({ ...PUBLIC_INPUT, password: " abc1234 ", confirmPassword: " abc1234 " });
    expect(result.ok && result.member.password).toBe(" abc1234 ");
  });

  it.each([
    ["123456", true],
    ["12345", false],
    ["1234567", false],
    ["12345A", false],
    ["", false],
  ])("AS-05 employee ID %j passes: %s", (employeeId, passes) => {
    expect(errorsFor({ employeeId }, EMPLOYEE_INPUT).employeeId === undefined).toBe(passes);
  });

  it("requires an affiliation from the list for employees", () => {
    expect(errorsFor({ affiliation: "" }, EMPLOYEE_INPUT).affiliation).toBeDefined();
    expect(errorsFor({ affiliation: "MARS" }, EMPLOYEE_INPUT).affiliation).toBeDefined();
  });

  it("AS-06 drops employee fields sent for a public member", () => {
    const result = validateSignup({ ...PUBLIC_INPUT, employeeId: "123456", affiliation: "HQ" });
    expect(result.ok).toBe(true);
    expect(result.ok && result.member).not.toHaveProperty("employeeId");
    expect(result.ok && result.member).not.toHaveProperty("affiliation");
  });

  it.each([
    ["somchai@pea.co.th", true],
    ["Somchai@PEA.CO.TH", true],
    ["somchai@gmail.com", false],
    ["somchai@mail.pea.co.th", false],
    ["somchai@pea.co.th.example.com", false],
  ])("AS-07 employee email %j passes: %s", (email, passes) => {
    const result = validateSignup({ ...EMPLOYEE_INPUT, email });
    expect(result.ok).toBe(passes);
    if (!result.ok) {
      expect(result.code).toBe("EMPLOYEE_EMAIL_REQUIRED");
      expect(result.errors.email).toBe(MESSAGES.employeeEmailRequired);
    }
  });

  it("AS-08 requires consent", () => {
    expect(errorsFor({ consent: false }).consent).toBe(MESSAGES.consentRequired);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/courses/SAF-101", "/courses/SAF-101"],
    ["/courses?q=saf&page=2", "/courses?q=saf&page=2"],
    [null, "/"],
    ["", "/"],
    ["https://example.com", "/"],
    ["//example.com", "/"],
    ["/\\example.com", "/"],
    ["javascript:alert(1)", "/"],
    ["/\texample.com", "/"],
  ])("AS-13 %j → %j", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });
});
