import Logo from "./logo";

const FOOTER_COLUMNS = [
  {
    title: "หลักสูตรยอดนิยม",
    links: [
      "พื้นฐานระบบโซลาร์เซลล์",
      "ติดตั้งระบบออนกริด",
      "ระบบออฟกริดและไฮบริด",
      "โซลาร์รูฟอาคารพาณิชย์",
    ],
  },
  {
    title: "เกี่ยวกับเรา",
    links: ["ประวัติสถาบัน", "ทีมวิทยากร", "ศูนย์ฝึกอบรม", "ร่วมงานกับเรา"],
  },
  {
    title: "ช่วยเหลือ",
    links: [
      "วิธีสมัครเรียน",
      "คำถามที่พบบ่อย",
      "ตรวจสอบใบรับรอง",
      "นโยบายความเป็นส่วนตัว",
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-blue-950 text-blue-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-7 text-blue-200">
            ศูนย์อบรมการติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์
            เน้นภาคปฏิบัติกับอุปกรณ์จริง สอนโดยวิศวกรไฟฟ้าที่มีใบอนุญาต
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>📍 99/9 ถนนพลังงาน แขวงแสงสว่าง เขตบางรัก กรุงเทพฯ 10500</li>
            <li>📞 02-123-4567 (จ.–ส. 08:30–17:30)</li>
            <li>✉️ contact@solarskill.example</li>
            <li>💬 LINE @solarskill</li>
          </ul>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-semibold text-white">{column.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-amber-400">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-blue-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-blue-300 sm:flex-row sm:justify-between">
          <span>© 2026 SolarSkill Academy สงวนลิขสิทธิ์</span>
          <span>ข้อมูลบนหน้านี้เป็นข้อมูลสมมติเพื่อการออกแบบ</span>
        </div>
      </div>
    </footer>
  );
}
