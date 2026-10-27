import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { ABOUT } from "@/lib/about/content";
import { formatNumber, formatThaiDate } from "@/lib/about/format";
import { COURSES, type Course } from "@/lib/courses/mock";
import {
  formatDuration,
  registrationStatus,
  thaiToday,
  totalSeconds,
  type RegistrationStatus,
} from "@/lib/courses/status";

export const metadata: Metadata = {
  title: "ศูนย์อบรมออนไลน์ กฟภ.",
  description: ABOUT.hero.description,
};

const sectionClass = "mx-auto max-w-6xl px-4 py-14";
const headingClass =
  "text-2xl font-bold text-blue-900 dark:text-sky-300 sm:text-3xl";

const STEPS = [
  { title: "สมัครสมาชิก", detail: "พนักงาน กฟภ. ใช้อีเมล @pea.co.th หรือสมัครเป็นบุคคลภายนอก" },
  { title: "ส่งคำขอลงทะเบียน", detail: "เลือกหลักสูตรที่เปิดรับสมัคร ส่งคำขอได้ไม่เกิน 5 หลักสูตรพร้อมกัน" },
  { title: "รอการอนุมัติ", detail: "เจ้าหน้าที่ศูนย์อบรมพิจารณาและแจ้งผลทางอีเมล" },
  { title: "เรียนวิดีโอ", detail: "เรียนต่อจากจุดที่ค้างไว้ได้ ภายใน 60 วันหลังได้รับอนุมัติ" },
  { title: "ทำแบบทดสอบ", detail: "ผ่านเกณฑ์ 70% ทำได้สูงสุด 3 ครั้ง" },
  { title: "รับใบประกาศ", detail: "ใบประกาศมีรหัสและ QR code ให้หน่วยงานภายนอกตรวจสอบได้" },
];

const STEP_COLORS = [
  "bg-sky-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-pink-600",
  "bg-amber-500",
];

function StatusBadge({ status }: { status: RegistrationStatus }) {
  switch (status.kind) {
    case "OPEN":
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
          เปิดรับสมัคร
        </span>
      );
    case "NOT_OPEN":
      return (
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-900/50 dark:text-sky-200">
          {`เปิดรับสมัคร ${formatThaiDate(status.openDate)}`}
        </span>
      );
    case "FULL":
      return (
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
          เต็ม
        </span>
      );
    case "CLOSED":
      return (
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          ปิดรับสมัครแล้ว
        </span>
      );
  }
}

function seatsText(status: RegistrationStatus): string | null {
  if (status.kind !== "OPEN") return null;
  const seats =
    status.seatsLeft === null
      ? "ที่นั่งไม่จำกัด"
      : `เหลือ ${formatNumber(status.seatsLeft)} ที่`;
  return `${seats} · ถึง ${formatThaiDate(status.closeDate)}`;
}

function CourseCard({ course, today }: { course: Course; today: string }) {
  const status = registrationStatus(course, today);
  const seats = seatsText(status);

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:ring-white/10">
      <div className="h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {course.code}
          </span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            {course.category}
          </span>
          {course.audience === "EMPLOYEE_ONLY" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              เฉพาะพนักงาน
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Link
            href={`/courses/${course.code}`}
            className="hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {`${course.lessonSeconds.length} บทเรียน · ${formatDuration(totalSeconds(course))}`}
        </p>
        {course.prerequisite && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {`ต้องผ่าน ${course.prerequisite} ก่อน`}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <StatusBadge status={status} />
          {seats && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {seats}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default async function Home() {
  "use cache";
  cacheLife("hours");

  const today = thaiToday(new Date());
  const published = COURSES.filter((c) => c.isPublished);

  const categories = Array.from(
    published.reduce(
      (counts, c) => counts.set(c.category, (counts.get(c.category) ?? 0) + 1),
      new Map<string, number>(),
    ),
  );

  const stats = [
    { label: "หลักสูตร", value: formatNumber(ABOUT.stats.courses) },
    { label: "ผู้เรียน", value: formatNumber(ABOUT.stats.learners) },
    { label: "ใบประกาศที่ออก", value: formatNumber(ABOUT.stats.certificates) },
  ];

  return (
    <main className="flex-1 bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-amber-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-pink-500/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold tracking-wide text-amber-300">
            เรียนฟรี · เรียนออนไลน์ · ได้ใบประกาศ
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            {ABOUT.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sky-100">
            {ABOUT.hero.description}
          </p>

          <form action="/courses" role="search" className="mt-9 flex max-w-xl gap-2">
            <label htmlFor="course-search" className="sr-only">
              ค้นหาหลักสูตร
            </label>
            <input
              id="course-search"
              name="q"
              type="search"
              maxLength={100}
              placeholder="ค้นหาชื่อหรือรหัสหลักสูตร เช่น SAF-101"
              className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-300"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-amber-400 px-6 py-3 font-semibold text-blue-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300"
            >
              ค้นหา
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-white/15 px-5 py-2.5 font-medium ring-1 ring-white/40 transition hover:bg-white/25"
            >
              สมัครสมาชิก
            </Link>
            <Link
              href="/courses"
              className="rounded-full px-5 py-2.5 font-medium underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-amber-200"
            >
              ดูหลักสูตรทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="ผลการดำเนินงาน" className="mx-auto -mt-8 max-w-6xl px-4">
        <dl className="relative grid grid-cols-3 gap-3 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10 sm:p-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                {item.label}
              </dt>
              <dd className="mt-1 text-xl font-extrabold text-indigo-700 sm:text-3xl dark:text-indigo-300">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="courses-heading" className={sectionClass}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="courses-heading" className={headingClass}>
            หลักสูตรแนะนำ
          </h2>
          <Link
            href="/courses"
            className="font-medium text-indigo-700 underline decoration-amber-400 decoration-2 underline-offset-4 dark:text-amber-300"
          >
            ดูทั้งหมด
          </Link>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((course) => (
            <CourseCard key={course.code} course={course} today={today} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="category-heading" className={sectionClass}>
        <h2 id="category-heading" className={`${headingClass} mb-8`}>
          หมวดหลักสูตร
        </h2>
        <ul className="flex flex-wrap gap-3">
          {categories.map(([category, count]) => (
            <li key={category}>
              <Link
                href={`/courses?category=${encodeURIComponent(category)}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-slate-800 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 hover:ring-sky-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                {category}
                <span className="rounded-full bg-sky-100 px-2 text-xs font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className={sectionClass}>
        <h2 id="steps-heading" className={`${headingClass} mb-8`}>
          เรียนจบได้ใบประกาศใน 6 ขั้นตอน
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10"
            >
              <span
                aria-hidden
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${STEP_COLORS[i]}`}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="audience-heading" className={`${sectionClass} pb-20`}>
        <h2 id="audience-heading" className={`${headingClass} mb-8`}>
          เปิดให้ทั้งพนักงานและบุคคลทั่วไป
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold">พนักงาน กฟภ.</h3>
            <p className="mt-3 text-indigo-100">
              สมัครด้วยอีเมล @pea.co.th และรหัสพนักงาน
              เข้าถึงได้ทั้งหลักสูตรทั่วไปและหลักสูตรเฉพาะพนักงาน
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold">บุคคลภายนอก</h3>
            <p className="mt-3 text-emerald-50">
              สมัครด้วยอีเมลใดก็ได้ เรียนหลักสูตรทั่วไปได้ฟรี
              และรับใบประกาศที่ตรวจสอบได้เหมือนกัน
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
