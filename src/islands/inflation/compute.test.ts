import { describe, expect, it } from "vitest";
import {
  adjustValueAcrossYears,
  cumulativeInflation,
  frozenSalaryRealValue,
  raiseNeededToKeepPace,
} from "@/domain/inflation.ts";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import { computeInflation } from "./compute.ts";
import { DEFAULT_STATE } from "./state.ts";

describe("computeInflation", () => {
  it("matches calling the engine functions directly for the defaults", () => {
    const result = computeInflation(DEFAULT_STATE);
    const adjusted = adjustValueAcrossYears(
      DEFAULT_STATE.amount,
      DEFAULT_STATE.fromYear,
      DEFAULT_STATE.toYear,
    );
    expect(result.adjusted).toBe(adjusted?.adjusted);
    expect(result.factor).toBe(adjusted?.factor);
    expect(result.cumulativeRate).toBe(
      cumulativeInflation(DEFAULT_STATE.fromYear, DEFAULT_STATE.toYear),
    );
    expect(result.keepPace).toEqual(
      raiseNeededToKeepPace(DEFAULT_STATE.amount, DEFAULT_STATE.fromYear, DEFAULT_STATE.toYear),
    );
    expect(result.frozen).toEqual(
      frozenSalaryRealValue(
        DEFAULT_STATE.amount,
        DEFAULT_STATE.fromYear,
        DEFAULT_STATE.toYear - DEFAULT_STATE.fromYear,
      ),
    );
  });

  it("adjusts 1000 euro from 2015 to the latest FOI year (2026)", () => {
    const result = computeInflation(DEFAULT_STATE);
    expect(result.fromYear).toBe(2015);
    expect(result.toYear).toBe(FOI_LATEST_YEAR);
    expect(result.adjusted).toBeCloseTo(1241, 0);
    expect(result.cumulativeRate).toBeCloseTo(0.241, 3);
  });

  it("works out the raise that keeps pace with inflation", () => {
    const result = computeInflation(DEFAULT_STATE);
    expect(result.keepPace?.grossNeeded).toBeCloseTo(1241, 0);
    expect(result.keepPace?.raiseAmount).toBeCloseTo(241, 0);
    expect(result.keepPace?.raisePercent).toBeCloseTo(0.241, 3);
  });

  it("walks a frozen salary year by year across the requested span", () => {
    const result = computeInflation(DEFAULT_STATE);
    expect(result.frozen?.years).toHaveLength(12);
    expect(result.frozen?.years[0]?.year).toBe(2015);
    expect(result.frozen?.years[11]?.year).toBe(2026);
  });

  it("drops the frozen breakdown when there is no span to walk", () => {
    const result = computeInflation({ ...DEFAULT_STATE, fromYear: 2026, toYear: 2026 });
    expect(result.frozen).toBeNull();
  });

  it("falls back to the default amount instead of propagating NaN from an unparsable field", () => {
    const result = computeInflation({ ...DEFAULT_STATE, amount: Number.NaN });
    expect(result.adjusted).toBe(computeInflation(DEFAULT_STATE).adjusted);
  });

  it("falls back to the nominal amount and a neutral factor for years outside the series", () => {
    const result = computeInflation({ ...DEFAULT_STATE, fromYear: 1900 });
    expect(result.adjusted).toBe(DEFAULT_STATE.amount);
    expect(result.factor).toBe(1);
    expect(result.cumulativeRate).toBe(0);
  });
});
