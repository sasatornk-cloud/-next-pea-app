import type { Course } from "./mock";

export type RegistrationStatus =
  | { kind: "NOT_OPEN"; openDate: string }
  | { kind: "CLOSED" }
  | { kind: "FULL" }
  | { kind: "OPEN"; closeDate: string; seatsLeft: number | null };

export function thaiToday(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function seatsLeft(course: Course): number | null {
  if (course.capacity === null) return null;
  return Math.max(0, course.capacity - course.enrolled);
}

export function registrationStatus(
  course: Course,
  today: string,
): RegistrationStatus {
  if (today < course.openDate) {
    return { kind: "NOT_OPEN", openDate: course.openDate };
  }
  if (today > course.closeDate) return { kind: "CLOSED" };
  const seats = seatsLeft(course);
  if (seats === 0) return { kind: "FULL" };
  return { kind: "OPEN", closeDate: course.closeDate, seatsLeft: seats };
}

export function totalSeconds(course: Course): number {
  return course.lessonSeconds.reduce((sum, s) => sum + s, 0);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} นาที`;
  if (minutes === 0) return `${hours} ชม.`;
  return `${hours} ชม. ${minutes} นาที`;
}
