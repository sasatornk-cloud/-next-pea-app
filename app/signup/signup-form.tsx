"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, type ReactNode } from "react";
import {
  buttonClass,
  errorClass,
  inputClass,
  labelClass,
} from "@/components/form-styles";
import {
  AFFILIATIONS,
  EMPLOYEE_EMAIL_DOMAIN,
  EMPLOYEE_ID_DIGITS,
  MIN_PASSWORD_LENGTH,
  safeNextPath,
  type SignupField,
} from "@/lib/auth/rules";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {
  values: {
    userType: "",
    fullName: "",
    email: "",
    employeeId: "",
    affiliation: "",
    consent: false,
  },
  errors: {},
};

const USER_TYPE_OPTIONS = [
  { value: "EMPLOYEE", label: "พนักงาน กฟภ." },
  { value: "PUBLIC", label: "บุคคลภายนอก" },
];

function Field({
  name,
  label,
  error,
  children,
}: {
  name: SignupField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className={errorClass} data-testid={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function errorProps(name: SignupField, error?: string) {
  return error
    ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
    : {};
}

export function SignupForm() {
  const next = safeNextPath(useSearchParams().get("next"));
  const [state, formAction, pending] = useActionState(signup, initialState);
  const [userType, setUserType] = useState(state.values.userType);
  const { values, errors } = state;
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} noValidate className="space-y-5" data-testid="signup-form">
      {state.message && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
        >
          {state.message}
        </p>
      )}
      <input type="hidden" name="next" value={next} />

      <fieldset>
        <legend className={labelClass}>ประเภทผู้ใช้</legend>
        <div className="grid grid-cols-2 gap-3">
          {USER_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-checked:border-blue-600 has-checked:bg-blue-50 dark:border-slate-700 dark:has-checked:border-sky-500 dark:has-checked:bg-sky-950/40"
            >
              <input
                type="radio"
                name="userType"
                value={option.value}
                defaultChecked={values.userType === option.value}
                onChange={() => setUserType(option.value)}
                data-testid={`userType-${option.value}`}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.userType && <p className={errorClass}>{errors.userType}</p>}
      </fieldset>

      <Field name="fullName" label="ชื่อ-นามสกุล" error={errors.fullName}>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={values.fullName}
          className={inputClass}
          {...errorProps("fullName", errors.fullName)}
        />
      </Field>

      <Field name="email" label="อีเมล" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={userType === "EMPLOYEE" ? `ชื่อ@${EMPLOYEE_EMAIL_DOMAIN}` : undefined}
          defaultValue={values.email}
          className={inputClass}
          {...errorProps("email", errors.email)}
        />
      </Field>

      {userType === "EMPLOYEE" && (
        <>
          <Field name="employeeId" label="รหัสพนักงาน" error={errors.employeeId}>
            <input
              id="employeeId"
              name="employeeId"
              inputMode="numeric"
              maxLength={EMPLOYEE_ID_DIGITS}
              placeholder={`ตัวเลข ${EMPLOYEE_ID_DIGITS} หลัก`}
              defaultValue={values.employeeId}
              className={inputClass}
              {...errorProps("employeeId", errors.employeeId)}
            />
          </Field>

          <Field name="affiliation" label="สังกัด (การไฟฟ้าเขต/สำนักงาน)" error={errors.affiliation}>
            <select
              id="affiliation"
              name="affiliation"
              defaultValue={values.affiliation}
              className={inputClass}
              {...errorProps("affiliation", errors.affiliation)}
            >
              <option value="">— เลือกสังกัด —</option>
              {AFFILIATIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}

      <Field name="password" label="รหัสผ่าน" error={errors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`}
          className={inputClass}
          {...errorProps("password", errors.password)}
        />
      </Field>

      <Field name="confirmPassword" label="ยืนยันรหัสผ่าน" error={errors.confirmPassword}>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...errorProps("confirmPassword", errors.confirmPassword)}
        />
      </Field>

      <div>
        {/* Placeholder wording — pending legal sign-off on the PDPA notice */}
        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            name="consent"
            defaultChecked={values.consent}
            className="mt-1"
            data-testid="consent"
            {...errorProps("consent", errors.consent)}
          />
          ข้าพเจ้ายินยอมให้ศูนย์อบรมออนไลน์ กฟภ. เก็บและใช้ข้อมูลส่วนบุคคลของข้าพเจ้า
          เพื่อการจัดการอบรมและออกใบประกาศนียบัตรเท่านั้น
        </label>
        {errors.consent && (
          <p id="consent-error" className={errorClass}>
            {errors.consent}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "กำลังสมัครสมาชิก…" : "สมัครสมาชิก"}
      </button>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href={loginHref} className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-sky-300">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
