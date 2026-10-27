"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [{ href: "/about", label: "เกี่ยวกับเรา" }];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav aria-label="เมนูหลัก" className="mx-auto flex max-w-5xl gap-6 px-4 py-3">
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
      </nav>
    </header>
  );
}
