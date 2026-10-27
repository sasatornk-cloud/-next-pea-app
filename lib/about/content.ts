export type AboutContent = {
  name: string;
  hero: { description: string };
  vision: string;
  missions: string[];
  benefits: { title: string; description: string }[];
  stats: {
    foundedYearBE: number;
    courses: number;
    learners: number;
    certificates: number;
    asOf: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
};

// Draft placeholder content: pending confirmation from the training center (spec 002).
export const ABOUT: AboutContent = {
  name: "ศูนย์อบรมออนไลน์ การไฟฟ้าส่วนภูมิภาค",
  hero: {
    description:
      "เรียนรู้ได้ทุกที่ทุกเวลา กับหลักสูตรอบรมออนไลน์คุณภาพสำหรับพนักงาน กฟภ. และบุคคลภายนอก",
  },
  vision: "เป็นศูนย์กลางการเรียนรู้ออนไลน์ด้านพลังงานไฟฟ้าที่ทุกคนเข้าถึงได้",
  missions: [
    "พัฒนาหลักสูตรอบรมที่ตรงกับงานจริงของผู้ปฏิบัติงาน",
    "เผยแพร่ความรู้ด้านความปลอดภัยและการใช้ไฟฟ้าอย่างมีประสิทธิภาพ",
    "เปิดโอกาสให้บุคคลภายนอกเข้าถึงการเรียนรู้คุณภาพ",
  ],
  benefits: [
    {
      title: "เรียนได้ตามเวลาของตนเอง",
      description:
        "บทเรียนวิดีโอให้เรียนซ้ำและเรียนต่อจากจุดที่ค้างไว้ได้ทุกเมื่อ",
    },
    {
      title: "ประเมินผลด้วยแบบทดสอบ",
      description:
        "แบบทดสอบหลังเรียนช่วยวัดความเข้าใจ และผ่านแล้วได้รับใบประกาศนียบัตร",
    },
    {
      title: "ใบประกาศที่ตรวจสอบได้",
      description:
        "ใบประกาศมีรหัสและ QR code ให้หน่วยงานภายนอกตรวจสอบความถูกต้องได้",
    },
  ],
  stats: {
    foundedYearBE: 2560,
    courses: 48,
    learners: 12500,
    certificates: 9800,
    asOf: "2026-09-30",
  },
  contact: {
    address: "การไฟฟ้าส่วนภูมิภาค กรุงเทพฯ (ที่อยู่ตัวอย่าง)",
    phone: "021234567",
    email: "training@example.com",
    hours: "จันทร์ - ศุกร์ 08:30 - 16:30 น.",
  },
};
