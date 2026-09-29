import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { calculateNaspi, getNaspiConfig, getTaxConfig } from "@/domain/index.ts";
import { deriveNaspi, naspiIneligibilityMessageKey, VISIBLE_NASPI_MONTHS } from "./derive.ts";

const CONFIG = getNaspiConfig(LATEST_SUPPORTED_YEAR);
const BRACKETS = getTaxConfig(LATEST_SUPPORTED_YEAR).irpefBrackets;

const ELIGIBLE_RESULT = calculateNaspi({
  grossPay4Years: 100_000,
  weeksContribution4Years: 200,
  age: 40,
  voluntaryResignationInLast12Months: false,
  weeksAfterVoluntaryResignation: 0,
  config: CONFIG,
  irpefBrackets: BRACKETS,
});

describe("naspiIneligibilityMessageKey", () => {
  it("maps each domain reason to its message key", () => {
    expect(naspiIneligibilityMessageKey("insufficient-weeks")).toBe(
      "naspi.ineligible.insufficient-weeks",
    );
    expect(naspiIneligibilityMessageKey("voluntary-resignation-lockout")).toBe(
      "naspi.ineligible.voluntary-resignation-lockout",
    );
  });
});

describe("deriveNaspi", () => {
  it("shows only the first 12 months by default", () => {
    const derived = deriveNaspi(ELIGIBLE_RESULT, false);
    expect(derived.visibleSchedule).toHaveLength(VISIBLE_NASPI_MONTHS);
    expect(derived.hasMoreMonths).toBe(true);
  });

  it("shows every month once revealed", () => {
    const derived = deriveNaspi(ELIGIBLE_RESULT, true);
    expect(derived.visibleSchedule).toHaveLength(ELIGIBLE_RESULT.schedule.length);
    expect(derived.hasMoreMonths).toBe(false);
  });

  it("maps ineligibility reasons to message keys", () => {
    const ineligible = calculateNaspi({
      grossPay4Years: 100_000,
      weeksContribution4Years: 0,
      age: 40,
      voluntaryResignationInLast12Months: false,
      weeksAfterVoluntaryResignation: 0,
      config: CONFIG,
      irpefBrackets: BRACKETS,
    });
    const derived = deriveNaspi(ineligible, false);
    expect(derived.ineligibilityMessageKeys).toEqual(["naspi.ineligible.insufficient-weeks"]);
    expect(derived.visibleSchedule).toHaveLength(0);
    expect(derived.hasMoreMonths).toBe(false);
  });
});
