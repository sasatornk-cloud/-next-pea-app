import Logo from "./logo";

const NAV_LINKS = [
  { label: "หน้าแรก", href: "#top" },
  { label: "หลักสูตร", href: "#courses" },
  { label: "ตารางอบรม", href: "#schedule" },
  { label: "ทำไมต้องเรา", href: "#why-us" },
  { label: "รีวิวผู้เรียน", href: "#reviews" },
  { label: "ติดต่อเรา", href: "#contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="hidden bg-blue-950 text-xs text-blue-100 sm:block">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-2">
          <span>☀️ รอบอบรมเดือนพฤศจิกายนเปิดรับสมัครแล้ว ลด 15% ถึง 30 พ.ย.</span>
          <span>โทร 02-123-4567 · LINE @solarskill</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Logo />
        <nav className="hidden lg:block">
          <ul className="flex gap-7 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-amber-600">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#courses"
            className="hidden rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 sm:block"
          >
            สมัครเรียน
          </a>
          <details className="group relative lg:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">เมนู</span>
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <ul className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-lg px-3 py-2 hover:bg-amber-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </header>
  );
}
