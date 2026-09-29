import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { getTaxConfig, projectTfr } from "@/domain/index.ts";
import { computeTfr } from "./compute.ts";
import { MAX_YEARS, TFR_DEFAULTS, updateRal, updateYears } from "./state.ts";

const CFG = getTaxConfig(LATEST_SUPPORTED_YEAR).tfr;

describe("computeTfr", () => {
  it("matches calling the engine directly for the defaults", () => {
    expect(computeTfr(TFR_DEFAULTS, "it")).toEqual(projectTfr(30_000, 10, 0.02, CFG));
  });

  it("parses a shorthand RAL before calling the engine", () => {
    const state = updateRal(TFR_DEFAULTS, "54k");
    expect(computeTfr(state, "it")).toEqual(projectTfr(54_000, 10, 0.02, CFG));
  });

  it("treats unparseable text as a zero RAL instead of throwing", () => {
    const state = updateRal(TFR_DEFAULTS, "abc");
    expect(computeTfr(state, "it").finalStock).toBe(0);
  });

  it("caps years at the OLD form's maximum of 50 instead of hanging", () => {
    const state = updateYears(TFR_DEFAULTS, 10_000);
    expect(computeTfr(state, "it")).toEqual(projectTfr(30_000, MAX_YEARS, 0.02, CFG));
  });

  it("falls back to the default years when years is not a finite integer", () => {
    const state = updateYears(TFR_DEFAULTS, Number.NaN);
    expect(computeTfr(state, "it")).toEqual(projectTfr(30_000, TFR_DEFAULTS.years, 0.02, CFG));
  });

  it("clamps an out-of-range inflation rate instead of propagating NaN-like behaviour", () => {
    const state = { ...TFR_DEFAULTS, inflationRate: 5 };
    expect(computeTfr(state, "it")).toEqual(projectTfr(30_000, 10, 0.2, CFG));
  });
});
