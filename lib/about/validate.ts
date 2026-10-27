import type { AboutContent } from "./content";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = /^0\d{8,9}$/;

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateAboutContent(content: AboutContent): string[] {
  const errors: string[] = [];

  if (content.name.trim() === "") errors.push("name is empty");

  const heroLength = content.hero.description.length;
  if (heroLength === 0 || heroLength > 120) {
    errors.push("hero.description must be 1-120 characters");
  }

  if (content.vision.trim() === "") errors.push("vision is empty");

  if (content.missions.length < 1 || content.missions.length > 5) {
    errors.push("missions must have 1-5 items");
  }

  if (content.benefits.length !== 3) {
    errors.push("benefits must have exactly 3 cards");
  }
  for (const benefit of content.benefits) {
    if (benefit.title.trim() === "") errors.push("benefit title is empty");
    if (benefit.description.length > 200) {
      errors.push("benefit description must be at most 200 characters");
    }
  }

  const { stats } = content;
  if (
    !Number.isInteger(stats.foundedYearBE) ||
    stats.foundedYearBE < 2500 ||
    stats.foundedYearBE > 2700
  ) {
    errors.push("stats.foundedYearBE must be a Buddhist Era year (2500-2700)");
  }
  if (!isNonNegativeInteger(stats.courses)) {
    errors.push("stats.courses must be a non-negative integer");
  }
  if (!isNonNegativeInteger(stats.learners)) {
    errors.push("stats.learners must be a non-negative integer");
  }
  if (!isNonNegativeInteger(stats.certificates)) {
    errors.push("stats.certificates must be a non-negative integer");
  }
  if (!isRealIsoDate(stats.asOf)) {
    errors.push("stats.asOf must be a real date in YYYY-MM-DD format");
  }

  if (!PHONE_DIGITS.test(content.contact.phone)) {
    errors.push("contact.phone must be digits only, 9-10 digits starting with 0");
  }
  if (!EMAIL.test(content.contact.email)) {
    errors.push("contact.email is not a valid email");
  }
  if (content.contact.address.trim() === "") errors.push("contact.address is empty");
  if (content.contact.hours.trim() === "") errors.push("contact.hours is empty");

  return errors;
}
