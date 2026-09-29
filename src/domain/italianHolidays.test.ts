import { describe, expect, it } from "vitest";
import { isItalianHoliday, italianHolidaysFor } from "./italianHolidays.ts";

describe("italianHolidaysFor", () => {
  it("includes the 12 fixed and movable Italian national holidays for 2026", () => {
    const holidays = italianHolidaysFor(2026);
    expect(holidays).toContain("2026-01-01");
    expect(holidays).toContain("2026-01-06");
    expect(holidays).toContain("2026-04-05"); // Easter 2026 falls on April 5
    expect(holidays).toContain("2026-04-06"); // Pasquetta
    expect(holidays).toContain("2026-04-25");
    expect(holidays).toContain("2026-05-01");
    expect(holidays).toContain("2026-06-02");
    expect(holidays).toContain("2026-08-15");
    expect(holidays).toContain("2026-11-01");
    expect(holidays).toContain("2026-12-08");
    expect(holidays).toContain("2026-12-25");
    expect(holidays).toContain("2026-12-26");
    expect(holidays).toHaveLength(12);
  });

  it("computes Easter correctly for 2024 (March 31)", () => {
    const holidays = italianHolidaysFor(2024);
    expect(holidays).toContain("2024-03-31");
    expect(holidays).toContain("2024-04-01"); // Pasquetta
  });
});

describe("isItalianHoliday", () => {
  it("returns true for Capodanno 2026", () => {
    expect(isItalianHoliday(new Date("2026-01-01"))).toBe(true);
  });

  it("returns false for a regular weekday", () => {
    expect(isItalianHoliday(new Date("2026-05-18"))).toBe(false);
  });
});
