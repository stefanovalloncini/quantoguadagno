import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { getTaxConfig, projectTfr } from "@/domain/index.ts";
import { deriveTfr, VISIBLE_TFR_YEARS } from "./derive.ts";

const CFG = getTaxConfig(LATEST_SUPPORTED_YEAR).tfr;
const RESULT = projectTfr(30_000, 15, 0.02, CFG);

describe("deriveTfr", () => {
  it("shows only the first 10 years by default", () => {
    const derived = deriveTfr(RESULT, false);
    expect(derived.visibleSchedule).toHaveLength(VISIBLE_TFR_YEARS);
    expect(derived.hasMoreYears).toBe(true);
  });

  it("shows every year once revealed", () => {
    const derived = deriveTfr(RESULT, true);
    expect(derived.visibleSchedule).toHaveLength(15);
    expect(derived.hasMoreYears).toBe(false);
  });

  it("never reports more years available than the schedule holds", () => {
    const short = projectTfr(30_000, 3, 0.02, CFG);
    const derived = deriveTfr(short, false);
    expect(derived.visibleSchedule).toHaveLength(3);
    expect(derived.hasMoreYears).toBe(false);
  });
});
