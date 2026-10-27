"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับเรา" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-bold text-blue-900 dark:text-sky-300">
          ศูนย์อบรมออนไลน์ กฟภ.
        </Link>
        <nav aria-label="เมนูหลัก" className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="font-medium underline-offset-4 hover:underline aria-[current=page]:underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-full bg-blue-800 px-4 py-1.5 font-medium text-white transition hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            เข้าสู่ระบบ
          </Link>
        </nav>
      </div>
    </header>
  );
}
