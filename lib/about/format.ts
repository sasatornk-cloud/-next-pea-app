const BANGKOK_TZ = "Asia/Bangkok";
const BE_OFFSET = 543;

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatThaiDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${THAI_MONTHS[month - 1]} ${year + BE_OFFSET}`;
}

export function formatPhone(digits: string): string {
  if (digits.startsWith("02")) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function yearsSinceFounding(foundedYearBE: number, now: Date): number {
  const ceYear = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: BANGKOK_TZ,
      year: "numeric",
    }).format(now),
  );
  return Math.max(0, ceYear + BE_OFFSET - foundedYearBE);
}
