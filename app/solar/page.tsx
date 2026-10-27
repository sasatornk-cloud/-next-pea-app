// All figures below are mock data for the design.
const STATS = [
  { value: 24, suffix: "", label: "หลักสูตรที่เปิดสอน" },
  { value: 12480, suffix: "+", label: "ผู้เรียนทั้งหมด" },
  { value: 8950, suffix: "", label: "ผู้ผ่านการรับรอง" },
  { value: 4.9, suffix: "/5", label: "คะแนนความพึงพอใจ" },
];

const LEVEL_STYLES = {
  เริ่มต้น: "bg-emerald-100 text-emerald-700",
  ปานกลาง: "bg-amber-100 text-amber-700",
  ขั้นสูง: "bg-rose-100 text-rose-700",
};

const COURSES: {
  title: string;
  level: keyof typeof LEVEL_STYLES;
  days: number;
  hours: number;
  format: string;
  price: number;
  students: number;
  rating: number;
}[] = [
  {
    title: "พื้นฐานระบบโซลาร์เซลล์สำหรับผู้เริ่มต้น",
    level: "เริ่มต้น",
    days: 2,
    hours: 12,
    format: "ทฤษฎี + ปฏิบัติ",
    price: 3900,
    students: 3250,
    rating: 4.9,
  },
  {
    title: "ติดตั้งระบบออนกริด (On-Grid) สำหรับบ้านพักอาศัย",
    level: "ปานกลาง",
    days: 3,
    hours: 18,
    format: "ปฏิบัติหน้างานจริง",
    price: 7500,
    students: 2840,
    rating: 4.8,
  },
  {
    title: "ระบบออฟกริดและไฮบริด พร้อมระบบแบตเตอรี่",
    level: "ปานกลาง",
    days: 3,
    hours: 18,
    format: "ทฤษฎี + ปฏิบัติ",
    price: 8900,
    students: 1920,
    rating: 4.8,
  },
  {
    title: "ออกแบบโซลาร์รูฟสำหรับโรงงานและอาคารพาณิชย์",
    level: "ขั้นสูง",
    days: 5,
    hours: 30,
    format: "Workshop + ดูงาน",
    price: 15900,
    students: 860,
    rating: 4.9,
  },
  {
    title: "ตรวจสอบและบำรุงรักษาระบบโซลาร์ (O&M)",
    level: "ปานกลาง",
    days: 2,
    hours: 12,
    format: "ปฏิบัติหน้างานจริง",
    price: 5500,
    students: 1410,
    rating: 4.7,
  },
  {
    title: "ความปลอดภัยงานบนหลังคาและไฟฟ้ากระแสตรง (DC)",
    level: "เริ่มต้น",
    days: 1,
    hours: 6,
    format: "ทฤษฎี + ปฏิบัติ",
    price: 2500,
    students: 2200,
    rating: 4.8,
  },
];

const SCHEDULE = [
  {
    date: "8–9 พ.ย. 2569",
    course: "พื้นฐานระบบโซลาร์เซลล์สำหรับผู้เริ่มต้น",
    place: "กรุงเทพฯ (บางรัก)",
    seats: 4,
    total: 30,
  },
  {
    date: "14–16 พ.ย. 2569",
    course: "ติดตั้งระบบออนกริดสำหรับบ้านพักอาศัย",
    place: "เชียงใหม่",
    seats: 11,
    total: 24,
  },
  {
    date: "21–23 พ.ย. 2569",
    course: "ระบบออฟกริดและไฮบริด พร้อมระบบแบตเตอรี่",
    place: "ขอนแก่น",
    seats: 0,
    total: 24,
  },
  {
    date: "28 พ.ย. 2569",
    course: "ความปลอดภัยงานบนหลังคาและไฟฟ้ากระแสตรง",
    place: "ออนไลน์ (Zoom)",
    seats: 52,
    total: 100,
  },
  {
    date: "1–5 ธ.ค. 2569",
    course: "ออกแบบโซลาร์รูฟสำหรับโรงงานและอาคารพาณิชย์",
    place: "ชลบุรี (นิคมอมตะ)",
    seats: 7,
    total: 20,
  },
];

const FEATURES = [
  {
    icon: "🔧",
    title: "ฝึกกับอุปกรณ์จริง",
    text: "ลงมือติดตั้งแผง อินเวอร์เตอร์ และตู้ควบคุมบนหลังคาจำลองขนาดเท่าของจริง",
  },
  {
    icon: "👷",
    title: "วิทยากรมืออาชีพ",
    text: "วิศวกรไฟฟ้าที่มีใบอนุญาต กว. ประสบการณ์ติดตั้งมากกว่า 1,500 โครงการ",
  },
  {
    icon: "📜",
    title: "ใบรับรองหลังจบ",
    text: "รับวุฒิบัตรเมื่อผ่านการทดสอบ ใช้ประกอบการยื่นขอขนานไฟกับการไฟฟ้าได้",
  },
  {
    icon: "🤝",
    title: "ดูแลหลังเรียน",
    text: "ปรึกษางานติดตั้งจริงฟรี 1 ปี พร้อมกลุ่มศิษย์เก่าและแหล่งงานช่างโซลาร์",
  },
];

const REVIEWS = [
  {
    name: "สมชาย ใจดี",
    role: "ช่างไฟฟ้าอิสระ, นครปฐม",
    text: "เรียนจบคอร์สออนกริดแล้วรับงานติดตั้งบ้านได้เลย ตอนนี้มีงานเข้าเดือนละ 4–5 หลัง",
  },
  {
    name: "วิภาวรรณ ศรีสุข",
    role: "วิศวกรโรงงาน, ระยอง",
    text: "คอร์สออกแบบโซลาร์รูฟละเอียดมาก ได้ใช้คำนวณระบบให้โรงงานจริง ประหยัดค่าไฟไป 30%",
  },
  {
    name: "ธนากร แก้วมณี",
    role: "เจ้าของบ้าน, ขอนแก่น",
    text: "ไม่มีพื้นฐานไฟฟ้ามาก่อนก็เรียนเข้าใจ วิทยากรอธิบายเป็นขั้นตอน ติดตั้งระบบที่บ้านเองได้",
  },
];

const formatNumber = (n: number) => n.toLocaleString("th-TH");

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 380" className="w-full drop-shadow-xl" aria-hidden>
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="hero-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <radialGradient id="hero-sun">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <rect width={480} height={380} rx={28} fill="url(#hero-sky)" />
      <circle cx={380} cy={84} r={70} fill="#fde68a" opacity={0.35} />
      <circle cx={380} cy={84} r={44} fill="url(#hero-sun)" />
      <path d="M40 120q20-18 44-6 14-20 38-8 22 2 22 20H40Z" fill="#fff" />
      {/* House */}
      <path d="M70 230 240 120 410 230Z" fill="#9a3412" />
      <rect x={95} y={228} width={290} height={130} fill="#fef3c7" />
      <rect x={140} y={265} width={60} height={60} rx={4} fill="#93c5fd" />
      <rect x={280} y={275} width={50} height={83} rx={4} fill="#78350f" />
      {/* Solar array on the roof */}
      <g transform="translate(120 152) skewX(-30) scale(1 0.62)">
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={(i % 4) * 58 + 40}
            y={Math.floor(i / 4) * 60}
            width={54}
            height={56}
            rx={3}
            fill="url(#hero-panel)"
            stroke="#93c5fd"
            strokeWidth={2}
          />
        ))}
      </g>
      <rect y={355} width={480} height={25} rx={0} fill="#86efac" />
      {/* Inverter */}
      <rect x={395} y={270} width={36} height={48} rx={6} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
      <circle cx={413} cy={288} r={5} fill="#22c55e" />
      <path d="M385 240v40h10" fill="none" stroke="#475569" strokeWidth={3} />
    </svg>
  );
}

export default function SolarHome() {
  return (
    <div id="top">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-amber-50 via-white to-blue-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-28 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700">
              ศูนย์อบรมช่างโซลาร์เซลล์อันดับ 1 ที่ผู้เรียนเลือก
            </span>
            <h1 className="mt-6 text-4xl leading-tight font-bold text-blue-950 sm:text-5xl sm:leading-tight">
              เรียนติดตั้ง
              <span className="text-amber-500">โซลาร์เซลล์</span>
              <br />
              กับผู้เชี่ยวชาญตัวจริง
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              หลักสูตรอบรมการติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์ ตั้งแต่พื้นฐานจนถึงการออกแบบระบบเชิงพาณิชย์
              ฝึกปฏิบัติจริง พร้อมใบรับรองหลังจบหลักสูตร
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#courses"
                className="rounded-full bg-amber-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600"
              >
                ดูหลักสูตรทั้งหมด
              </a>
              <a
                href="#schedule"
                className="rounded-full border border-blue-950/15 bg-white px-7 py-3.5 font-semibold text-blue-950 hover:border-blue-950/40"
              >
                ตารางอบรมเดือนนี้
              </a>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-xl lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white px-6 py-8 text-center">
              <dt className="text-sm text-slate-500">{stat.label}</dt>
              <dd className="mt-2 text-3xl font-bold text-blue-950 sm:text-4xl">
                {formatNumber(stat.value)}
                <span className="text-amber-500">{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-600">หลักสูตรยอดนิยม</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-950">
              เลือกหลักสูตรที่ใช่สำหรับคุณ
            </h2>
          </div>
          <a href="#" className="font-semibold text-blue-700 hover:underline">
            ดูทั้ง 24 หลักสูตร →
          </a>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <li
              key={course.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_STYLES[course.level]}`}
                >
                  {course.level}
                </span>
                <span className="text-sm text-slate-500">
                  ⭐ {course.rating.toFixed(1)}
                </span>
              </div>
              <h3 className="mt-4 text-lg leading-7 font-semibold text-blue-950">
                {course.title}
              </h3>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>
                  🗓️ {course.days} วัน ({course.hours} ชั่วโมง)
                </li>
                <li>🛠️ {course.format}</li>
                <li>
                  👥 ผู้เรียนแล้ว{" "}
                  <strong className="text-blue-950">
                    {formatNumber(course.students)}
                  </strong>{" "}
                  คน
                </li>
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-xl font-bold text-amber-600">
                  ฿{formatNumber(course.price)}
                </span>
                <a
                  href="#"
                  className="rounded-full bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  ดูรายละเอียด
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Why us */}
      <section id="why-us" className="scroll-mt-28 bg-blue-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-semibold text-amber-400">ทำไมต้อง SolarSkill</p>
          <h2 className="mt-2 text-3xl font-bold">
            เรียนจบแล้วทำงานได้จริง ไม่ใช่แค่ท่องทฤษฎี
          </h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-blue-200">
                  {feature.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24">
        <p className="font-semibold text-amber-600">ตารางอบรม</p>
        <h2 className="mt-2 text-3xl font-bold text-blue-950">รอบอบรมที่กำลังจะมาถึง</h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">วันที่</th>
                <th className="px-6 py-4 font-medium">หลักสูตร</th>
                <th className="px-6 py-4 font-medium">สถานที่</th>
                <th className="px-6 py-4 font-medium">ที่นั่งว่าง</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHEDULE.map((session) => {
                const full = session.seats === 0;
                return (
                  <tr key={session.date + session.course}>
                    <td className="px-6 py-4 font-semibold whitespace-nowrap text-blue-950">
                      {session.date}
                    </td>
                    <td className="px-6 py-4">{session.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{session.place}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          full
                            ? "text-rose-600"
                            : session.seats <= 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }
                      >
                        {full
                          ? "เต็มแล้ว"
                          : `${session.seats} / ${session.total} ที่`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {full ? (
                        <span className="text-slate-400">รอรอบถัดไป</span>
                      ) : (
                        <a
                          href="#"
                          className="font-semibold whitespace-nowrap text-blue-700 hover:underline"
                        >
                          จองที่นั่ง →
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-28 bg-amber-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-semibold text-amber-600">เสียงจากผู้เรียน</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-950">
            ผู้เรียนกว่า {formatNumber(12480)} คนไว้วางใจเรา
          </h2>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <li key={review.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-amber-500">★★★★★</p>
                <p className="mt-4 leading-7 text-slate-700">“{review.text}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-blue-950 font-semibold text-white">
                    {review.name[0]}
                  </span>
                  <div>
                    <p className="font-semibold text-blue-950">{review.name}</p>
                    <p className="text-sm text-slate-500">{review.role}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-14 text-center text-white shadow-xl lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-3xl font-bold">พร้อมเริ่มอาชีพช่างโซลาร์แล้วหรือยัง?</h2>
            <p className="mt-2 text-amber-50">
              ปรึกษาเลือกหลักสูตรฟรี ทีมงานตอบกลับภายใน 1 ชั่วโมง
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 rounded-full bg-white px-8 py-3.5 font-semibold text-amber-600 hover:bg-amber-50"
          >
            ติดต่อทีมงาน
          </a>
        </div>
      </section>
    </div>
  );
}
