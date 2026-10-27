import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ศูนย์อบรมออนไลน์ กฟภ.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-start justify-center bg-gradient-to-b from-sky-50 to-white px-4 py-14 dark:from-slate-950 dark:to-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10">
        <h1 className="mb-6 text-2xl font-bold text-blue-900 dark:text-sky-300">
          เข้าสู่ระบบ
        </h1>
        {/* The form reads ?next=, which is only known at request time */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
