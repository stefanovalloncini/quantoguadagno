import { describe, expect, it } from "vitest";
import {
  adjustedRows,
  defaultGrowthRate,
  lastSettings,
  latestSupportedEntry,
  netSeries,
  nominalSeries,
  projectionBundle,
  projectionSeries,
  realChangeSinceFirst,
  tableRows,
} from "./derive.ts";
import { DEFAULT_ENTRY_SETTINGS, type SalaryEntry } from "./storage.ts";

function entry(id: string, year: number, grossAnnual: number): SalaryEntry {
  return {
    id,
    year,
    grossAnnual,
    createdAt: "2026-01-01T00:00:00.000Z",
    settings: DEFAULT_ENTRY_SETTINGS,
  };
}

describe("adjustedRows", () => {
  it("pairs each entry with its inflation-adjusted value and net breakdown", () => {
    const rows = adjustedRows([entry("a", 2024, 30_000)], 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.adjusted?.fromYear).toBe(2024);
    expect(rows[0]?.net?.netAnnual).toBeGreaterThan(0);
  });

  it("adjusts a year the FOI series covers even when the tax config does not, leaving net null", () => {
    const rows = adjustedRows([entry("a", 2015, 20_000)], 2026);
    expect(rows[0]?.adjusted).not.toBeNull();
    expect(rows[0]?.net).toBeNull();
  });

  it("leaves adjusted null for a year outside the FOI series entirely", () => {
    const rows = adjustedRows([entry("a", 1950, 20_000)], 2026);
    expect(rows[0]?.adjusted).toBeNull();
    expect(rows[0]?.net).toBeNull();
  });
});

describe("lastSettings", () => {
  it("falls back to the default settings when there are no entries", () => {
    expect(lastSettings([])).toEqual(DEFAULT_ENTRY_SETTINGS);
  });

  it("returns the last entry's settings", () => {
    const custom = { ...DEFAULT_ENTRY_SETTINGS, regionCode: "toscana" as const };
    const entries = [entry("a", 2020, 20_000), { ...entry("b", 2024, 30_000), settings: custom }];
    expect(lastSettings(entries)).toEqual(custom);
  });
});

describe("latestSupportedEntry", () => {
  it("returns the most recent entry whose net breakdown could be computed", () => {
    const rows = adjustedRows([entry("a", 2015, 20_000), entry("b", 2024, 30_000)], 2026);
    expect(latestSupportedEntry(rows)?.id).toBe("b");
  });

  it("returns null when nothing is supported", () => {
    const rows = adjustedRows([entry("a", 2015, 20_000)], 2026);
    expect(latestSupportedEntry(rows)).toBeNull();
  });
});

describe("realChangeSinceFirst", () => {
  it("returns null for an empty list", () => {
    expect(realChangeSinceFirst([])).toBeNull();
  });

  it("is zero when the first and latest row are the same entry", () => {
    expect(realChangeSinceFirst(adjustedRows([entry("a", 2024, 30_000)], 2026))).toBe(0);
  });

  it("compares the first and latest adjusted value", () => {
    const rows = adjustedRows([entry("a", 2022, 25_000), entry("b", 2026, 32_000)], 2026);
    const change = realChangeSinceFirst(rows);
    const firstAdjusted = rows[0]?.adjusted?.adjusted ?? null;
    const latestAdjusted = rows[1]?.adjusted?.adjusted ?? null;
    expect(firstAdjusted).not.toBeNull();
    expect(latestAdjusted).not.toBeNull();
    expect(change).toBeCloseTo((latestAdjusted ?? 0) / (firstAdjusted ?? 1) - 1, 6);
  });
});

describe("defaultGrowthRate", () => {
  it("averages the last three FOI year-over-year rates", () => {
    const expected = (119.7 / 118.6 - 1 + (121.4 / 119.7 - 1) + (124.1 / 121.4 - 1)) / 3;
    expect(defaultGrowthRate()).toBeCloseTo(expected, 6);
  });
});

describe("projectionBundle", () => {
  it("returns empty series when there is no base entry", () => {
    const bundle = projectionBundle(null, 5, 2);
    expect(bundle.expected).toEqual([]);
    expect(bundle.low).toEqual([]);
    expect(bundle.high).toEqual([]);
  });

  it("returns empty series when the horizon is zero", () => {
    expect(projectionBundle(entry("a", 2026, 30_000), 0, 2).expected).toEqual([]);
  });

  it("builds expected/low/high bands one point apart", () => {
    const bundle = projectionBundle(entry("a", 2026, 30_000), 3, 2);
    expect(bundle.expected).toHaveLength(3);
    expect(bundle.low).toHaveLength(3);
    expect(bundle.high).toHaveLength(3);
    expect(bundle.growthRate).toBeCloseTo(0.02);
    const expectedFirst = bundle.expected[0]?.grossAnnual ?? 0;
    expect(bundle.high[0]?.grossAnnual ?? 0).toBeGreaterThan(expectedFirst);
    expect(bundle.low[0]?.grossAnnual ?? 0).toBeLessThan(expectedFirst);
  });
});

describe("chart series", () => {
  const rows = adjustedRows([entry("a", 2024, 30_000), entry("b", 2015, 20_000)], 2026);

  it("maps gross per year as plain {x, y, label} points", () => {
    const series = nominalSeries(rows);
    expect(series).toContainEqual({ x: 2024, y: 30_000, label: "2024" });
    expect(series).toContainEqual({ x: 2015, y: 20_000, label: "2015" });
  });

  it("only includes years with a computable net in the net series", () => {
    const series = netSeries(rows);
    expect(series).toHaveLength(1);
    expect(series[0]?.x).toBe(2024);
  });

  it("maps projection years, preferring the net figure over the gross one", () => {
    const bundle = projectionBundle(entry("a", 2026, 30_000), 1, 2);
    const series = projectionSeries(bundle.expected);
    expect(series[0]?.x).toBe(2027);
    expect(series[0]?.y).toBe(bundle.expected[0]?.net?.netAnnual);
  });
});

describe("tableRows", () => {
  it("flattens adjusted rows into plain, view-ready records", () => {
    const rows = adjustedRows([entry("a", 2024, 30_000)], 2026);
    const table = tableRows(rows);
    expect(table).toEqual([
      {
        id: "a",
        year: 2024,
        grossAnnual: 30_000,
        netAnnual: rows[0]?.net?.netAnnual,
        adjusted: rows[0]?.adjusted?.adjusted,
        note: undefined,
        isMigrated: false,
        settings: DEFAULT_ENTRY_SETTINGS,
      },
    ]);
  });
});
