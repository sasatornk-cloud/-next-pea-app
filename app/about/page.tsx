import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { ABOUT } from "@/lib/about/content";
import {
  formatNumber,
  formatPhone,
  formatThaiDate,
  yearsSinceFounding,
} from "@/lib/about/format";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | ศูนย์อบรมออนไลน์ กฟภ.",
  description: ABOUT.hero.description,
};

const sectionClass = "mx-auto max-w-5xl px-4 py-14";
const headingClass =
  "mb-8 text-2xl font-bold text-blue-900 dark:text-sky-300 sm:text-3xl";

const BENEFIT_ACCENTS = [
  {
    bar: "from-rose-500 to-pink-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
  },
  {
    bar: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  },
  {
    bar: "from-emerald-500 to-teal-500",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  },
];

const STAT_TILES = [
  "bg-gradient-to-br from-indigo-600 to-violet-700",
  "bg-gradient-to-br from-sky-600 to-blue-700",
  "bg-gradient-to-br from-emerald-600 to-teal-700",
  "bg-gradient-to-br from-rose-600 to-pink-700",
];

export default async function AboutPage() {
  "use cache";
  cacheLife("days");

  const years = yearsSinceFounding(ABOUT.stats.foundedYearBE, new Date());
  const { contact, stats } = ABOUT;

  const statItems = [
    { label: "ปีที่ดำเนินงาน", value: `${years} ปี` },
    { label: "จำนวนหลักสูตร", value: formatNumber(stats.courses) },
    { label: "ผู้เรียน", value: formatNumber(stats.learners) },
    { label: "ใบประกาศที่ออก", value: formatNumber(stats.certificates) },
  ];

  return (
    <main className="flex-1 bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-amber-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-pink-500/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            {ABOUT.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sky-100">
            {ABOUT.hero.description}
          </p>
          <Link
            href="/courses"
            className="mt-9 inline-block rounded-full bg-amber-400 px-6 py-3 font-semibold text-blue-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300"
          >
            ดูหลักสูตรทั้งหมด
          </Link>
        </div>
      </section>

      <section aria-labelledby="mission-heading" className={sectionClass}>
        <h2 id="mission-heading" className={headingClass}>
          พันธกิจและวิสัยทัศน์
        </h2>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
              วิสัยทัศน์
            </h3>
            <p className="mt-3 text-lg font-medium leading-relaxed">
              {ABOUT.vision}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-sky-100 dark:bg-slate-900 dark:ring-slate-800 md:col-span-3">
            <h3 className="mb-3 font-semibold text-sky-700 dark:text-sky-300">
              พันธกิจ
            </h3>
            <ul className="space-y-3">
              {ABOUT.missions.map((mission, i) => (
                <li key={mission} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-200"
                  >
                    {i + 1}
                  </span>
                  <span>{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="benefit-heading" className={sectionClass}>
        <h2 id="benefit-heading" className={headingClass}>
          สิ่งที่ผู้เรียนได้รับ
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {ABOUT.benefits.map((benefit, i) => {
            const accent = BENEFIT_ACCENTS[i];
            return (
              <li
                key={benefit.title}
                className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:ring-white/10"
              >
                <div className={`h-2 bg-gradient-to-r ${accent.bar}`} />
                <div className="p-6">
                  <span
                    className={`inline-flex size-10 items-center justify-center rounded-xl text-lg font-bold ${accent.badge}`}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="stats-heading" className={sectionClass}>
        <h2 id="stats-heading" className={headingClass}>
          ผลการดำเนินงาน
        </h2>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statItems.map((item, i) => (
            <div
              key={item.label}
              className={`rounded-2xl p-6 text-center text-white shadow-lg ${STAT_TILES[i]}`}
            >
              <dt className="text-sm font-medium text-white/85">{item.label}</dt>
              <dd className="mt-2 text-3xl font-extrabold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          {`ข้อมูล ณ ${formatThaiDate(stats.asOf)}`}
        </p>
      </section>

      <section aria-labelledby="contact-heading" className={`${sectionClass} pb-20`}>
        <h2 id="contact-heading" className={headingClass}>
          ติดต่อเรา
        </h2>
        <dl className="grid gap-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 p-6 shadow-md ring-1 ring-sky-100 sm:grid-cols-[auto_1fr] sm:gap-x-8 sm:p-8 dark:from-slate-900 dark:to-slate-900 dark:ring-slate-800">
          <dt className="font-semibold text-blue-900 dark:text-sky-300">ที่อยู่</dt>
          <dd className="text-slate-700 dark:text-slate-200">{contact.address}</dd>
          <dt className="font-semibold text-blue-900 dark:text-sky-300">โทรศัพท์</dt>
          <dd>
            <a
              href={`tel:${contact.phone}`}
              className="font-medium text-indigo-700 underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-indigo-900 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {formatPhone(contact.phone)}
            </a>
          </dd>
          <dt className="font-semibold text-blue-900 dark:text-sky-300">อีเมล</dt>
          <dd>
            <a
              href={`mailto:${contact.email}`}
              className="font-medium text-indigo-700 underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-indigo-900 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {contact.email}
            </a>
          </dd>
          <dt className="font-semibold text-blue-900 dark:text-sky-300">เวลาทำการ</dt>
          <dd className="text-slate-700 dark:text-slate-200">{contact.hours}</dd>
        </dl>
      </section>
    </main>
  );
}
