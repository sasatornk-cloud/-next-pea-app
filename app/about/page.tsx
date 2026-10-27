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

const sectionClass = "mx-auto max-w-5xl px-4 py-12";
const headingClass = "mb-6 text-2xl font-semibold";

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
    <main className="flex-1">
      <section className="bg-black/[.03] dark:bg-white/[.04]">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold sm:text-4xl">{ABOUT.name}</h1>
          <p className="mt-4 max-w-2xl text-lg">{ABOUT.hero.description}</p>
          <Link
            href="/courses"
            className="mt-8 inline-block rounded-md bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
          >
            ดูหลักสูตรทั้งหมด
          </Link>
        </div>
      </section>

      <section aria-labelledby="mission-heading" className={sectionClass}>
        <h2 id="mission-heading" className={headingClass}>
          พันธกิจและวิสัยทัศน์
        </h2>
        <p className="mb-6 text-lg">
          <span className="font-semibold">วิสัยทัศน์: </span>
          {ABOUT.vision}
        </p>
        <h3 className="mb-2 font-semibold">พันธกิจ</h3>
        <ul className="list-inside list-disc space-y-2">
          {ABOUT.missions.map((mission) => (
            <li key={mission}>{mission}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="benefit-heading" className={sectionClass}>
        <h2 id="benefit-heading" className={headingClass}>
          สิ่งที่ผู้เรียนได้รับ
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {ABOUT.benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-lg border border-black/10 p-6 dark:border-white/10"
            >
              <h3 className="mb-2 font-semibold">{benefit.title}</h3>
              <p>{benefit.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stats-heading" className={sectionClass}>
        <h2 id="stats-heading" className={headingClass}>
          ผลการดำเนินงาน
        </h2>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-black/10 p-6 text-center dark:border-white/10"
            >
              <dt className="text-sm">{item.label}</dt>
              <dd className="mt-2 text-2xl font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm">{`ข้อมูล ณ ${formatThaiDate(stats.asOf)}`}</p>
      </section>

      <section aria-labelledby="contact-heading" className={sectionClass}>
        <h2 id="contact-heading" className={headingClass}>
          ติดต่อเรา
        </h2>
        <dl className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="font-semibold">ที่อยู่</dt>
          <dd>{contact.address}</dd>
          <dt className="font-semibold">โทรศัพท์</dt>
          <dd>
            <a
              href={`tel:${contact.phone}`}
              className="text-blue-700 underline dark:text-blue-300"
            >
              {formatPhone(contact.phone)}
            </a>
          </dd>
          <dt className="font-semibold">อีเมล</dt>
          <dd>
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-700 underline dark:text-blue-300"
            >
              {contact.email}
            </a>
          </dd>
          <dt className="font-semibold">เวลาทำการ</dt>
          <dd>{contact.hours}</dd>
        </dl>
      </section>
    </main>
  );
}
