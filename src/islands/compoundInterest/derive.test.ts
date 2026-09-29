import { describe, expect, it } from "vitest";
import { calculateCompoundInterest } from "@/domain/compoundInterest.ts";
import { contributionsSeries, nominalSeries, realSeries, visibleSchedule } from "./derive.ts";
import { DEFAULT_STATE } from "./state.ts";

const result = calculateCompoundInterest(DEFAULT_STATE);

describe("visibleSchedule", () => {
  it("caps the schedule at ten rows until asked for the rest", () => {
    const capped = visibleSchedule(result, false);
    expect(capped.rows).toHaveLength(10);
    expect(capped.hasMore).toBe(true);
  });

  it("returns every row once showAll is set", () => {
    const all = visibleSchedule(result, true);
    expect(all.rows).toHaveLength(result.schedule.length);
    expect(all.hasMore).toBe(false);
  });

  it("never reports more rows once the schedule already fits", () => {
    const short = calculateCompoundInterest({ ...DEFAULT_STATE, years: 3 });
    const visible = visibleSchedule(short, false);
    expect(visible.rows).toHaveLength(4);
    expect(visible.hasMore).toBe(false);
  });
});

describe("chart series", () => {
  it("maps the nominal balance per year as plain {x, y, label} points", () => {
    const series = nominalSeries(result);
    expect(series).toHaveLength(result.schedule.length);
    expect(series[0]).toEqual({ x: 0, y: result.schedule[0]?.nominalBalance, label: "0" });
    const last = series[series.length - 1];
    const lastRow = result.schedule[result.schedule.length - 1];
    expect(last).toEqual({
      x: lastRow?.year,
      y: lastRow?.nominalBalance,
      label: String(lastRow?.year),
    });
  });

  it("maps the real balance per year", () => {
    const series = realSeries(result);
    expect(series[1]).toEqual({ x: 1, y: result.schedule[1]?.realBalance, label: "1" });
  });

  it("maps contributions accrued per year", () => {
    const series = contributionsSeries(result);
    expect(series[1]).toEqual({ x: 1, y: result.schedule[1]?.contributedSoFar, label: "1" });
  });
});
