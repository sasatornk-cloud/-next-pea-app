export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const MIN_PASSWORD_LENGTH = 8;
export const EMPLOYEE_ID_DIGITS = 6;
export const MAX_LOGIN_FAILURES = 5;
export const LOCKOUT_MINUTES = 15;
export const EMPLOYEE_EMAIL_DOMAIN = "pea.co.th";

export const USER_TYPES = ["EMPLOYEE", "PUBLIC"] as const;
export type UserType = (typeof USER_TYPES)[number];

// Placeholder list — waiting on the training center for the official one.
export const AFFILIATIONS = [
  { value: "HQ", label: "สำนักงานใหญ่" },
  { value: "N1", label: "กฟน.1 (เชียงใหม่)" },
  { value: "N2", label: "กฟน.2 (พิษณุโลก)" },
  { value: "N3", label: "กฟน.3 (ลพบุรี)" },
  { value: "NE1", label: "กฟฉ.1 (อุดรธานี)" },
  { value: "NE2", label: "กฟฉ.2 (อุบลราชธานี)" },
  { value: "NE3", label: "กฟฉ.3 (นครราชสีมา)" },
  { value: "C1", label: "กฟก.1 (พระนครศรีอยุธยา)" },
  { value: "C2", label: "กฟก.2 (ชลบุรี)" },
  { value: "C3", label: "กฟก.3 (นครปฐม)" },
  { value: "S1", label: "กฟต.1 (เพชรบุรี)" },
  { value: "S2", label: "กฟต.2 (นครศรีธรรมราช)" },
  { value: "S3", label: "กฟต.3 (ยะลา)" },
] as const;

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "EMAIL_TAKEN"
  | "EMPLOYEE_ID_TAKEN"
  | "EMPLOYEE_EMAIL_REQUIRED"
  | "ACCOUNT_LOCKED";

export const MESSAGES = {
  emailTaken: "อีเมลนี้ถูกใช้แล้ว",
  employeeEmailRequired: `พนักงานต้องใช้อีเมล @${EMPLOYEE_EMAIL_DOMAIN}`,
  employeeIdTaken: "รหัสพนักงานนี้ถูกใช้แล้ว",
  passwordMismatch: "รหัสผ่านไม่ตรงกัน",
  invalidCredentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  accountLocked: "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ภายหลัง",
  userTypeRequired: "กรุณาเลือกประเภทผู้ใช้",
  nameLength: `ชื่อ-นามสกุลต้องยาว ${NAME_MIN_LENGTH}–${NAME_MAX_LENGTH} ตัวอักษร`,
  emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
  passwordTooShort: `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`,
  weakPassword: "รหัสผ่านไม่ผ่านเงื่อนไขความปลอดภัย กรุณาตั้งรหัสผ่านใหม่",
  employeeIdFormat: `รหัสพนักงานต้องเป็นตัวเลข ${EMPLOYEE_ID_DIGITS} หลัก`,
  affiliationRequired: "กรุณาเลือกสังกัด",
  consentRequired: "กรุณายอมรับความยินยอมการเก็บข้อมูลส่วนบุคคล",
  unexpected: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYEE_ID = new RegExp(`^\\d{${EMPLOYEE_ID_DIGITS}}$`);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Counts Unicode code points, so Thai vowels and tone marks count as
// characters ("นิ่ม" is 4). Matches Postgres char_length() in the DB check.
export function nameLength(name: string): number {
  return [...name.trim()].length;
}

export type SignupField =
  | "userType"
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "employeeId"
  | "affiliation"
  | "consent";

export type SignupInput = {
  userType: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  employeeId: string;
  affiliation: string;
  consent: boolean;
};

export type Member =
  | { userType: "PUBLIC"; fullName: string; email: string; password: string }
  | {
      userType: "EMPLOYEE";
      fullName: string;
      email: string;
      password: string;
      employeeId: string;
      affiliation: string;
    };

export type FieldErrors = Partial<Record<SignupField, string>>;

export type SignupValidation =
  | { ok: true; member: Member }
  | { ok: false; code: ErrorCode; errors: FieldErrors };

function isUserType(value: string): value is UserType {
  return (USER_TYPES as readonly string[]).includes(value);
}

function isAffiliation(value: string): boolean {
  return AFFILIATIONS.some((a) => a.value === value);
}

function hasEmployeeDomain(email: string): boolean {
  return email.slice(email.lastIndexOf("@") + 1) === EMPLOYEE_EMAIL_DOMAIN;
}

export function validateSignup(input: SignupInput): SignupValidation {
  const errors: FieldErrors = {};
  let code: ErrorCode = "VALIDATION_FAILED";

  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const employeeId = input.employeeId.trim();

  if (!isUserType(input.userType)) errors.userType = MESSAGES.userTypeRequired;

  const length = nameLength(fullName);
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) {
    errors.fullName = MESSAGES.nameLength;
  }

  if (!EMAIL.test(email)) {
    errors.email = MESSAGES.emailInvalid;
  } else if (input.userType === "EMPLOYEE" && !hasEmployeeDomain(email)) {
    errors.email = MESSAGES.employeeEmailRequired;
    code = "EMPLOYEE_EMAIL_REQUIRED";
  }

  // Passwords are never trimmed: spaces are part of what the user chose.
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = MESSAGES.passwordTooShort;
  }
  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = MESSAGES.passwordMismatch;
  }

  if (input.userType === "EMPLOYEE") {
    if (!EMPLOYEE_ID.test(employeeId)) {
      errors.employeeId = MESSAGES.employeeIdFormat;
    }
    if (!isAffiliation(input.affiliation)) {
      errors.affiliation = MESSAGES.affiliationRequired;
    }
  }

  if (!input.consent) errors.consent = MESSAGES.consentRequired;

  if (Object.keys(errors).length > 0) return { ok: false, code, errors };

  const base = { fullName, email, password: input.password };
  // PUBLIC members never carry employee fields, even if the client sent them.
  const member: Member =
    input.userType === "EMPLOYEE"
      ? { ...base, userType: "EMPLOYEE", employeeId, affiliation: input.affiliation }
      : { ...base, userType: "PUBLIC" };
  return { ok: true, member };
}

// Only same-site paths are allowed; anything that could leave the site
// (absolute URLs, "//host", "/\host", "javascript:") falls back to "/".
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.includes("\\")) return "/";
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/";
  return next;
}
