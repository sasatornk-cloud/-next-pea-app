"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { buttonClass, inputClass, labelClass } from "@/components/form-styles";
import { safeNextPath } from "@/lib/auth/rules";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { email: "" };

export function LoginForm() {
  const next = safeNextPath(useSearchParams().get("next"));
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} className="space-y-5" data-testid="login-form">
      {state.message && (
        <p
          role="alert"
          data-testid="login-error"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
        >
          {state.message}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={labelClass}>
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        ยังไม่มีบัญชี?{" "}
        <Link href={signupHref} className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-sky-300">
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}
