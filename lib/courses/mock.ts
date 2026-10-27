export type Audience = "ALL" | "EMPLOYEE_ONLY";

export type Course = {
  code: string;
  title: string;
  category: string;
  audience: Audience;
  isPublished: boolean;
  lessonSeconds: number[];
  openDate: string;
  closeDate: string;
  capacity: number | null;
  enrolled: number;
  prerequisite: string | null;
};

// Mock data until the course database exists. Dates are Thai calendar days (YYYY-MM-DD).
export const COURSES: Course[] = [
  {
    code: "SAF-101",
    title: "ความปลอดภัยในการปฏิบัติงานไฟฟ้าเบื้องต้น",
    category: "ความปลอดภัย",
    audience: "ALL",
    isPublished: true,
    lessonSeconds: [1500, 1800, 2100, 1800, 2400, 2700],
    openDate: "2026-10-01",
    closeDate: "2026-11-30",
    capacity: 200,
    enrolled: 154,
    prerequisite: null,
  },
  {
    code: "SAF-201",
    title: "การปฏิบัติงานไฟฟ้าแรงสูงอย่างปลอดภัย",
    category: "ความปลอดภัย",
    audience: "EMPLOYEE_ONLY",
    isPublished: true,
    lessonSeconds: [2400, 2700, 3000, 3000, 3000, 4500],
    openDate: "2026-10-15",
    closeDate: "2026-11-15",
    capacity: 40,
    enrolled: 40,
    prerequisite: "SAF-101",
  },
  {
    code: "ENR-101",
    title: "การใช้ไฟฟ้าอย่างประหยัดและมีประสิทธิภาพในบ้าน",
    category: "พลังงาน",
    audience: "ALL",
    isPublished: true,
    lessonSeconds: [900, 1200, 1500, 2700],
    openDate: "2026-09-01",
    closeDate: "2026-12-31",
    capacity: null,
    enrolled: 1284,
    prerequisite: null,
  },
  {
    code: "SOL-101",
    title: "พื้นฐานระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคา",
    category: "พลังงานทดแทน",
    audience: "ALL",
    isPublished: true,
    lessonSeconds: [2400, 2400, 3000, 3000, 3600],
    openDate: "2026-11-01",
    closeDate: "2026-12-15",
    capacity: 150,
    enrolled: 0,
    prerequisite: null,
  },
  {
    code: "DIG-101",
    title: "ความมั่นคงปลอดภัยไซเบอร์สำหรับพนักงาน",
    category: "ดิจิทัล",
    audience: "EMPLOYEE_ONLY",
    isPublished: true,
    lessonSeconds: [1200, 1500, 1800, 1500, 1200],
    openDate: "2026-10-01",
    closeDate: "2026-11-30",
    capacity: 300,
    enrolled: 87,
    prerequisite: null,
  },
  {
    code: "SRV-101",
    title: "การบริการลูกค้าและการสื่อสารอย่างมืออาชีพ",
    category: "บริการ",
    audience: "EMPLOYEE_ONLY",
    isPublished: true,
    lessonSeconds: [1800, 1800, 2700, 2700],
    openDate: "2026-08-01",
    closeDate: "2026-09-30",
    capacity: 100,
    enrolled: 96,
    prerequisite: null,
  },
  {
    code: "MET-101",
    title: "การอ่านและตรวจสอบมิเตอร์ไฟฟ้า",
    category: "ปฏิบัติการ",
    audience: "EMPLOYEE_ONLY",
    isPublished: false,
    lessonSeconds: [1800, 2400],
    openDate: "2026-12-01",
    closeDate: "2027-01-31",
    capacity: 80,
    enrolled: 0,
    prerequisite: null,
  },
];
