import { describe, expect, it } from "vitest";
import { buildChartModel, type ChartSeries } from "./chartModel.ts";
import { integerTicks, niceStep, strideFor, valueDomain } from "./scale.ts";

const NASPI_MONTHS = [
  1353.36, 1353.36, 1353.36, 1353.36, 1353.36, 1312.76, 1273.38, 1235.18, 1198.12, 1162.18, 1127.31,
  1093.49,
];

const naspi: ChartSeries = {
  id: "gross",
  label: "Lordo",
  kind: "bar",
  endLabels: "first-last",
  data: NASPI_MONTHS.map((y, index) => ({ x: index + 1, y })),
};

describe("scale", () => {
  it("picks steps of 1, 2, 2.5 or 5 times a power of ten", () => {
    expect(niceStep(1353, 4)).toBe(500);
    expect(niceStep(1000, 4)).toBe(250);
    expect(niceStep(38_000, 4)).toBe(10_000);
    expect(niceStep(0.9, 4)).toBe(0.25);
  });

  it("starts at zero and stops the ticks at the largest value, leaving headroom", () => {
    const domain = valueDomain([1353.36, 1093.49], {
      zeroBased: true,
      targetTicks: 4,
      headroom: 0.14,
    });
    expect(domain.ticks).toEqual([0, 500, 1000]);
    expect(domain.low).toBe(0);
    expect(domain.high).toBeGreaterThan(1353.36);
  });

  it("reaches below zero on a whole step when a value is negative", () => {
    const domain = valueDomain([-120, 400], { zeroBased: true, targetTicks: 4, headroom: 0.1 });
    expect(domain.low).toBe(-200);
    expect(domain.ticks).toContain(0);
  });

  it("can leave zero out for lines that only move within a range, with room below", () => {
    const domain = valueDomain([28_000, 34_000], {
      zeroBased: false,
      targetTicks: 4,
      headroom: 0.1,
    });
    expect(domain.low).toBe(26_000);
    expect(domain.low).toBeLessThan(28_000);
    expect(domain.ticks[0]).toBe(26_000);
  });

  it("spaces year ticks by whole steps", () => {
    expect(integerTicks(2015, 2031, 7)).toEqual([2015, 2020, 2025, 2030]);
    expect(integerTicks(2021, 2026, 12)).toEqual([2021, 2022, 2023, 2024, 2025, 2026]);
    expect(strideFor(23, 12)).toBe(2);
  });
});

describe("buildChartModel", () => {
  it("lays out one bar per month with the zero line at the bottom", () => {
    const model = buildChartModel({ series: [naspi], xLabelChars: 2 });
    expect(model.xScale).toBe("band");
    expect(model.bars).toHaveLength(12);
    expect(model.baseline).toBe(100);
    const [first] = model.bars;
    expect(first?.y).toBeGreaterThan(0);
    expect((first?.y ?? 0) + (first?.height ?? 0)).toBeCloseTo(100, 1);
    expect(model.gridlines).toHaveLength(2);
  });

  it("labels the first and the last bar from their outer edges", () => {
    const model = buildChartModel({ series: [naspi], xLabelChars: 2 });
    const [first, last] = model.labels;
    expect(first?.value).toBe(1353.36);
    expect(first?.anchor).toBe("start");
    expect(first?.x).toBe(model.bars[0]?.x);
    expect(last?.value).toBe(1093.49);
    expect(last?.anchor).toBe("end");
  });

  it("mirrors the x axis for right-to-left pages", () => {
    const ltr = buildChartModel({ series: [naspi], xLabelChars: 2 });
    const rtl = buildChartModel({ series: [naspi], xLabelChars: 2, mirrored: true });
    const firstLtr = ltr.bars[0];
    const firstRtl = rtl.bars[0];
    expect(firstLtr).toBeDefined();
    expect(firstRtl?.x).toBeCloseTo(100 - (firstLtr?.x ?? 0) - (firstLtr?.width ?? 0), 1);
    expect(rtl.labels[0]?.anchor).toBe("end");
  });

  it("thins month labels on narrow charts but keeps every one when there is room", () => {
    const long: ChartSeries = {
      ...naspi,
      data: Array.from({ length: 23 }, (_, index) => ({ x: index + 1, y: 1000 - index * 10 })),
    };
    const model = buildChartModel({ series: [long], xLabelChars: 2 });
    expect(model.xTicksNarrow.length).toBeLessThan(23);
    expect(model.xTicksWide).toHaveLength(23);
  });

  it("lifts a bar label above the taller neighbours it would cover", () => {
    const falling: ChartSeries = {
      ...naspi,
      data: Array.from({ length: 23 }, (_, index) => ({ x: index + 1, y: 1270 * 0.97 ** index })),
    };
    const model = buildChartModel({
      series: [falling],
      xLabelChars: 2,
      valueLabelChars: () => 8,
    });
    const lastBar = model.bars.at(-1);
    const narrow = model.labelsNarrow.at(-1);
    const wide = model.labels.at(-1);
    expect(narrow?.y).toBeLessThan(wide?.y ?? 0);
    expect(wide?.y).toBeLessThan(lastBar?.y ?? 0);
  });

  it("draws lines in plot units with a marker per point", () => {
    const line: ChartSeries = {
      id: "nominal",
      label: "RAL",
      kind: "line",
      data: [
        { x: 2019, y: 25_000 },
        { x: 2024, y: 30_000 },
        { x: 2026, y: 32_000 },
      ],
    };
    const model = buildChartModel({ series: [line], xLabelChars: 4, zeroBased: false });
    expect(model.xScale).toBe("linear");
    expect(model.lines[0]?.points.split(" ")).toHaveLength(3);
    expect(model.markers).toHaveLength(3);
    expect(model.markers[0]?.cx).toBe(4);
    expect(model.markers[2]?.cx).toBe(96);
  });

  it("moves the lower of two crowded end labels below its point", () => {
    const series: readonly ChartSeries[] = [
      {
        id: "a",
        label: "A",
        kind: "line",
        endLabels: "last",
        data: [
          { x: 1, y: 100 },
          { x: 2, y: 200 },
        ],
      },
      {
        id: "b",
        label: "B",
        kind: "line",
        endLabels: "last",
        data: [
          { x: 1, y: 90 },
          { x: 2, y: 195 },
        ],
      },
    ];
    const model = buildChartModel({ series, xLabelChars: 1 });
    const placements = Object.fromEntries(
      model.labels.map((label) => [label.seriesId, label.placement]),
    );
    expect(placements).toEqual({ a: "above", b: "below" });
  });

  it("stacks bars when asked, one segment on top of the other", () => {
    const series: readonly ChartSeries[] = [
      { id: "paid", label: "Versato", kind: "bar", data: [{ x: 1, y: 100 }] },
      { id: "interest", label: "Interessi", kind: "bar", tone: "muted", data: [{ x: 1, y: 50 }] },
    ];
    const model = buildChartModel({ series, barLayout: "stacked", xLabelChars: 1 });
    const [paid, interest] = model.bars;
    expect(paid?.x).toBe(interest?.x);
    expect((interest?.y ?? 0) + (interest?.height ?? 0)).toBeCloseTo(paid?.y ?? 0, 1);
  });

  it("draws a step series with a flat run for every value", () => {
    const step: ChartSeries = {
      id: "rate",
      label: "Aliquota",
      kind: "step",
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 20 },
      ],
    };
    const model = buildChartModel({ series: [step], xScale: "band", xLabelChars: 1 });
    expect(model.lines[0]?.points.split(" ")).toHaveLength(7);
    expect(model.markers).toHaveLength(0);
  });
});
