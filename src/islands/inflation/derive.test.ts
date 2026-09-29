import { describe, expect, it } from "vitest";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import { computeInflation } from "./compute.ts";
import { availableYears, frozenSeries, keepPaceRows } from "./derive.ts";
import { DEFAULT_STATE } from "./state.ts";

describe("availableYears", () => {
  it("lists every year the FOI series covers, starting in 2015", () => {
    const years = availableYears();
    expect(years[0]).toBe(2015);
    expect(years[years.length - 1]).toBe(FOI_LATEST_YEAR);
  });
});

describe("frozenSeries", () => {
  it("returns an empty series for a null frozen breakdown", () => {
    expect(frozenSeries(null)).toEqual([]);
  });

  it("maps the frozen years as plain {x, y, label} points", () => {
    const { frozen } = computeInflation(DEFAULT_STATE);
    const series = frozenSeries(frozen);
    expect(series).toHaveLength(12);
    expect(series[0]).toEqual({ x: 2015, y: frozen?.years[0]?.realValue, label: "2015" });
  });
});

describe("keepPaceRows", () => {
  it("returns no rows for a null keep-pace breakdown", () => {
    expect(keepPaceRows(null)).toEqual([]);
  });

  it("returns a needed-amount row and a raise row", () => {
    const { keepPace } = computeInflation(DEFAULT_STATE);
    const rows = keepPaceRows(keepPace);
    expect(rows).toEqual([
      { key: "needed", amount: keepPace?.grossNeeded },
      { key: "raise", amount: keepPace?.raiseAmount, rate: keepPace?.raisePercent },
    ]);
  });
});
