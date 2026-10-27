import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatPhone,
  formatThaiDate,
  yearsSinceFounding,
} from "./format";

describe("formatNumber", () => {
  it("groups thousands with commas", () => {
    expect(formatNumber(12500)).toBe("12,500");
    expect(formatNumber(48)).toBe("48");
  });
});

describe("formatThaiDate", () => {
  it("renders ISO date as Thai date in Buddhist Era", () => {
    expect(formatThaiDate("2026-09-30")).toBe("30 กันยายน 2569");
  });
});

describe("formatPhone", () => {
  it("formats a 9-digit Bangkok number as 2-3-4", () => {
    expect(formatPhone("021234567")).toBe("02-123-4567");
  });

  it("formats a 10-digit number as 3-3-4", () => {
    expect(formatPhone("0812345678")).toBe("081-234-5678");
  });
});

describe("yearsSinceFounding (founded 2560 BE, Asia/Bangkok)", () => {
  const founded = 2560;

  it.each([
    ["2026-10-27T10:00:00+07:00", 9],
    ["2026-12-31T23:59:59.999+07:00", 9],
    ["2026-12-31T17:00:00Z", 10],
    ["2027-01-01T00:00:00.000+07:00", 10],
  ])("at %s returns %i years", (iso, expected) => {
    expect(yearsSinceFounding(founded, new Date(iso))).toBe(expected);
  });

  it("returns 0 when founded in the current Buddhist year", () => {
    expect(
      yearsSinceFounding(2569, new Date("2026-10-27T10:00:00+07:00")),
    ).toBe(0);
  });

  it("never returns a negative value", () => {
    expect(
      yearsSinceFounding(2600, new Date("2026-10-27T10:00:00+07:00")),
    ).toBe(0);
  });
});
