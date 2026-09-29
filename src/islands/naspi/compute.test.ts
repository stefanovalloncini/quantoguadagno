import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { calculateNaspi, getNaspiConfig, getTaxConfig } from "@/domain/index.ts";
import { computeNaspi } from "./compute.ts";
import {
  NASPI_DEFAULTS,
  updateAge,
  updateGrossPay4Years,
  updateVoluntaryResignationInLast12Months,
  updateWeeksContribution4Years,
} from "./state.ts";

const CONFIG = getNaspiConfig(LATEST_SUPPORTED_YEAR);
const BRACKETS = getTaxConfig(LATEST_SUPPORTED_YEAR).irpefBrackets;

describe("computeNaspi", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computeNaspi(NASPI_DEFAULTS, "it")).toEqual(
      calculateNaspi({
        grossPay4Years: 100_000,
        weeksContribution4Years: 200,
        age: 40,
        voluntaryResignationInLast12Months: false,
        weeksAfterVoluntaryResignation: 0,
        config: CONFIG,
        irpefBrackets: BRACKETS,
      }),
    );
  });

  it("reports ineligibility for too few weeks, exactly like the engine", () => {
    const state = updateWeeksContribution4Years(NASPI_DEFAULTS, 0);
    expect(computeNaspi(state, "it")).toEqual(
      calculateNaspi({
        grossPay4Years: 100_000,
        weeksContribution4Years: 0,
        age: 40,
        voluntaryResignationInLast12Months: false,
        weeksAfterVoluntaryResignation: 0,
        config: CONFIG,
        irpefBrackets: BRACKETS,
      }),
    );
    expect(computeNaspi(state, "it").eligible).toBe(false);
  });

  it("parses a shorthand gross pay before calling the engine", () => {
    const state = updateGrossPay4Years(NASPI_DEFAULTS, "80k");
    expect(computeNaspi(state, "it").referenceMonthlyPay).toEqual(
      calculateNaspi({
        grossPay4Years: 80_000,
        weeksContribution4Years: 200,
        age: 40,
        voluntaryResignationInLast12Months: false,
        weeksAfterVoluntaryResignation: 0,
        config: CONFIG,
        irpefBrackets: BRACKETS,
      }).referenceMonthlyPay,
    );
  });

  it("treats unparseable text as zero gross pay instead of throwing", () => {
    const state = updateGrossPay4Years(NASPI_DEFAULTS, "abc");
    expect(computeNaspi(state, "it").referenceMonthlyPay).toBe(0);
  });

  it("rounds and clamps an out-of-range age instead of passing it through untouched", () => {
    const state = updateAge(NASPI_DEFAULTS, 999);
    expect(computeNaspi(state, "it")).toEqual(
      calculateNaspi({
        grossPay4Years: 100_000,
        weeksContribution4Years: 200,
        age: 80,
        voluntaryResignationInLast12Months: false,
        weeksAfterVoluntaryResignation: 0,
        config: CONFIG,
        irpefBrackets: BRACKETS,
      }),
    );
  });

  it("locks out a recent voluntary resignation without enough new weeks", () => {
    const state = updateVoluntaryResignationInLast12Months(NASPI_DEFAULTS, true);
    expect(computeNaspi(state, "it").eligible).toBe(false);
    expect(computeNaspi(state, "it").reasons).toContain("voluntary-resignation-lockout");
  });
});
