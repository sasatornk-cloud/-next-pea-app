import { describe, expect, it } from "vitest";
import { ABOUT, type AboutContent } from "./content";
import { validateAboutContent } from "./validate";

function withContent(patch: (draft: AboutContent) => void): AboutContent {
  const draft = structuredClone(ABOUT);
  patch(draft);
  return draft;
}

describe("validateAboutContent", () => {
  it("accepts the bundled content", () => {
    expect(validateAboutContent(ABOUT)).toEqual([]);
  });

  it.each([
    ["email missing domain", (d: AboutContent) => (d.contact.email = "training@")],
    ["phone contains hyphens", (d: AboutContent) => (d.contact.phone = "02-589-9000")],
    ["negative learners", (d: AboutContent) => (d.stats.learners = -1)],
    ["founding year in Christian Era", (d: AboutContent) => (d.stats.foundedYearBE = 2017)],
    ["only 2 benefit cards", (d: AboutContent) => d.benefits.pop()],
    ["as-of date in dd/mm/yyyy", (d: AboutContent) => (d.stats.asOf = "30/09/2569")],
    ["as-of date that does not exist", (d: AboutContent) => (d.stats.asOf = "2026-02-30")],
    ["hero description over 120 characters", (d: AboutContent) => (d.hero.description = "ก".repeat(121))],
    ["more than 5 missions", (d: AboutContent) => (d.missions = ["a", "b", "c", "d", "e", "f"])],
    ["fractional course count", (d: AboutContent) => (d.stats.courses = 4.5)],
  ])("reports an error when %s", (_label, patch) => {
    const errors = validateAboutContent(withContent(patch));
    expect(errors.length).toBeGreaterThan(0);
  });
});
