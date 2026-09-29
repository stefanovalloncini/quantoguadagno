import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import {
  MAX_AGE,
  MAX_GROSS_PAY_4_YEARS,
  MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
  MAX_WEEKS_CONTRIBUTION_4_YEARS,
  MIN_AGE,
  MIN_GROSS_PAY_4_YEARS,
  MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
  MIN_WEEKS_CONTRIBUTION_4_YEARS,
  NASPI_DEFAULTS,
  parseGrossPay4Years,
  updateAge,
  updateGrossPay4Years,
  updateVoluntaryResignationInLast12Months,
  updateWeeksAfterVoluntaryResignation,
  updateWeeksContribution4Years,
  updateYear,
  validateNaspi,
} from "./state.ts";

describe("NASPI_DEFAULTS", () => {
  it("matches the OLD tool defaults", () => {
    expect(NASPI_DEFAULTS).toEqual({
      grossPay4Years: "100000",
      weeksContribution4Years: 200,
      age: 40,
      voluntaryResignationInLast12Months: false,
      weeksAfterVoluntaryResignation: 0,
      year: LATEST_SUPPORTED_YEAR,
    });
  });
});

describe("updaters", () => {
  it("each updater only changes its own field", () => {
    expect(updateGrossPay4Years(NASPI_DEFAULTS, "80000")).toEqual({
      ...NASPI_DEFAULTS,
      grossPay4Years: "80000",
    });
    expect(updateWeeksContribution4Years(NASPI_DEFAULTS, 150)).toEqual({
      ...NASPI_DEFAULTS,
      weeksContribution4Years: 150,
    });
    expect(updateAge(NASPI_DEFAULTS, 55)).toEqual({ ...NASPI_DEFAULTS, age: 55 });
    expect(updateVoluntaryResignationInLast12Months(NASPI_DEFAULTS, true)).toEqual({
      ...NASPI_DEFAULTS,
      voluntaryResignationInLast12Months: true,
    });
    expect(updateWeeksAfterVoluntaryResignation(NASPI_DEFAULTS, 13)).toEqual({
      ...NASPI_DEFAULTS,
      weeksAfterVoluntaryResignation: 13,
    });
    expect(updateYear(NASPI_DEFAULTS, 2025)).toEqual({ ...NASPI_DEFAULTS, year: 2025 });
  });
});

describe("parseGrossPay4Years", () => {
  it("parses via the shared i18n money parser", () => {
    expect(parseGrossPay4Years(updateGrossPay4Years(NASPI_DEFAULTS, "100k"), "it")).toBe(100_000);
  });
});

describe("validateNaspi", () => {
  it("has no errors for the defaults", () => {
    expect(validateNaspi(NASPI_DEFAULTS, "it")).toEqual({});
  });

  it("flags an unparseable or out-of-range gross pay", () => {
    const grossPayError = {
      key: "field.error.moneyRange",
      values: { min: MIN_GROSS_PAY_4_YEARS, max: MAX_GROSS_PAY_4_YEARS },
    };
    expect(validateNaspi(updateGrossPay4Years(NASPI_DEFAULTS, "abc"), "it").grossPay4Years).toEqual(
      grossPayError,
    );
    expect(
      validateNaspi(updateGrossPay4Years(NASPI_DEFAULTS, String(MAX_GROSS_PAY_4_YEARS + 1)), "it")
        .grossPay4Years,
    ).toEqual(grossPayError);
  });

  it("flags weeks of contribution outside 0-208", () => {
    const weeksError = {
      key: "field.error.integerRange",
      values: { min: MIN_WEEKS_CONTRIBUTION_4_YEARS, max: MAX_WEEKS_CONTRIBUTION_4_YEARS },
    };
    expect(
      validateNaspi(updateWeeksContribution4Years(NASPI_DEFAULTS, -1), "it")
        .weeksContribution4Years,
    ).toEqual(weeksError);
    expect(
      validateNaspi(
        updateWeeksContribution4Years(NASPI_DEFAULTS, MAX_WEEKS_CONTRIBUTION_4_YEARS + 1),
        "it",
      ).weeksContribution4Years,
    ).toEqual(weeksError);
  });

  it("flags an age outside 18-80", () => {
    const ageError = { key: "field.error.integerRange", values: { min: MIN_AGE, max: MAX_AGE } };
    expect(validateNaspi(updateAge(NASPI_DEFAULTS, 17), "it").age).toEqual(ageError);
    expect(validateNaspi(updateAge(NASPI_DEFAULTS, MAX_AGE + 1), "it").age).toEqual(ageError);
  });

  it("flags weeks after voluntary resignation outside 0-52", () => {
    const weeksAfterError = {
      key: "field.error.integerRange",
      values: {
        min: MIN_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
        max: MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION,
      },
    };
    expect(
      validateNaspi(updateWeeksAfterVoluntaryResignation(NASPI_DEFAULTS, -1), "it")
        .weeksAfterVoluntaryResignation,
    ).toEqual(weeksAfterError);
    expect(
      validateNaspi(
        updateWeeksAfterVoluntaryResignation(
          NASPI_DEFAULTS,
          MAX_WEEKS_AFTER_VOLUNTARY_RESIGNATION + 1,
        ),
        "it",
      ).weeksAfterVoluntaryResignation,
    ).toEqual(weeksAfterError);
  });

  it("flags an unsupported year", () => {
    const state = updateYear(NASPI_DEFAULTS, 1999 as typeof NASPI_DEFAULTS.year);
    expect(validateNaspi(state, "it").year).toEqual({ key: "field.error.unsupportedYear" });
  });
});
