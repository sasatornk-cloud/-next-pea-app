import { describe, expect, it } from "vitest";
import { COURSES, type Course } from "./mock";
import {
  formatDuration,
  registrationStatus,
  seatsLeft,
  thaiToday,
} from "./status";

const base: Course = {
  code: "SAF-101",
  title: "t",
  category: "c",
  audience: "ALL",
  isPublished: true,
  lessonSeconds: [600],
  openDate: "2026-10-01",
  closeDate: "2026-11-30",
  capacity: 40,
  enrolled: 10,
  prerequisite: null,
};

describe("thaiToday", () => {
  it("uses the Bangkok calendar day", () => {
    expect(thaiToday(new Date("2026-12-31T16:59:59Z"))).toBe("2026-12-31");
    expect(thaiToday(new Date("2026-12-31T17:00:00Z"))).toBe("2027-01-01");
  });
});

describe("registrationStatus", () => {
  it.each([
    ["2026-09-30", "NOT_OPEN"],
    ["2026-10-01", "OPEN"],
    ["2026-11-30", "OPEN"],
    ["2026-12-01", "CLOSED"],
  ])("on %s is %s", (today, kind) => {
    expect(registrationStatus(base, today).kind).toBe(kind);
  });

  it("is FULL when approved + completed reaches capacity", () => {
    expect(registrationStatus({ ...base, enrolled: 40 }, "2026-10-27").kind).toBe(
      "FULL",
    );
  });

  it("treats null capacity as unlimited", () => {
    const course = { ...base, capacity: null, enrolled: 9999 };
    expect(seatsLeft(course)).toBeNull();
    expect(registrationStatus(course, "2026-10-27").kind).toBe("OPEN");
  });

  it("never reports negative seats", () => {
    expect(seatsLeft({ ...base, enrolled: 45 })).toBe(0);
  });
});

describe("formatDuration", () => {
  it.each([
    [12300, "3 ชม. 25 นาที"],
    [14400, "4 ชม."],
    [2700, "45 นาที"],
  ])("%i seconds is %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe("mock courses follow the course rules", () => {
  it.each(COURSES.map((c) => [c.code, c] as const))("%s", (_code, course) => {
    expect(course.code).toMatch(/^[A-Z]{2,5}-\d{3}$/);
    expect(course.closeDate >= course.openDate).toBe(true);
    expect(course.lessonSeconds.length).toBeGreaterThan(0);
    expect(course.lessonSeconds.every((s) => s > 0)).toBe(true);
    if (course.capacity !== null) {
      expect(course.capacity).toBeGreaterThanOrEqual(1);
      expect(course.capacity).toBeLessThanOrEqual(500);
    }
  });

  it("has unique codes", () => {
    const codes = COURSES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
