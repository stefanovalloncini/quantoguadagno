import { integerTicks, linearPosition, strideFor, valueDomain } from "./scale.ts";

export type SeriesKind = "line" | "bar" | "step";
export type SeriesTone = "ink" | "muted";
export type SeriesStroke = "solid" | "dashed";
export type EndLabels = "none" | "last" | "first-last";
export type XScaleKind = "band" | "linear";
export type BarLayout = "grouped" | "stacked";
export type TextAnchor = "start" | "middle" | "end";
export type LabelPlacement = "above" | "below";

export interface ChartDatum {
  readonly x: number;
  readonly y: number;
}

export interface ChartSeries {
  readonly id: string;
  readonly label: string;
  readonly kind: SeriesKind;
  readonly data: readonly ChartDatum[];
  readonly tone?: SeriesTone;
  readonly stroke?: SeriesStroke;
  readonly markers?: boolean;
  readonly endLabels?: EndLabels;
}

export interface ChartModelInput {
  readonly series: readonly ChartSeries[];
  readonly xScale?: XScaleKind;
  readonly barLayout?: BarLayout;
  readonly zeroBased?: boolean;
  readonly mirrored?: boolean;
  readonly xTickValues?: readonly number[];
  readonly xLabelChars?: number;
  readonly valueLabelChars?: (value: number) => number;
}

export interface TickMark {
  readonly value: number;
  readonly position: number;
  readonly anchor: TextAnchor;
}

export interface BarMark {
  readonly key: string;
  readonly seriesId: string;
  readonly tone: SeriesTone;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface LineMark {
  readonly seriesId: string;
  readonly tone: SeriesTone;
  readonly stroke: SeriesStroke;
  readonly points: string;
}

export interface MarkerMark {
  readonly key: string;
  readonly seriesId: string;
  readonly tone: SeriesTone;
  readonly cx: number;
  readonly cy: number;
}

export interface ValueLabel {
  readonly key: string;
  readonly seriesId: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly anchor: TextAnchor;
  readonly placement: LabelPlacement;
}

export interface ChartModel {
  readonly xScale: XScaleKind;
  readonly yTicks: readonly TickMark[];
  readonly gridlines: readonly number[];
  readonly baseline: number | null;
  readonly xTicksNarrow: readonly TickMark[];
  readonly xTicksWide: readonly TickMark[];
  readonly bars: readonly BarMark[];
  readonly lines: readonly LineMark[];
  readonly markers: readonly MarkerMark[];
  readonly labels: readonly ValueLabel[];
  readonly labelsNarrow: readonly ValueLabel[];
}

export const PLOT_UNITS = 1000;

const LINEAR_INSET = 4;
const BAR_SHARE = 0.6;
const BAR_MAX_WIDTH = 3.6;
const HEADROOM = 0.14;
const TARGET_TICKS = 4;
const NARROW_PLOT_PX = 240;
const WIDE_PLOT_PX = 460;
const PX_PER_CHAR = 7;
const LABEL_GAP_PX = 6;
const LABEL_COLLISION = 9;
const MARKERS_UP_TO = 24;
const LABEL_OVERHANG_PX = 10;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toUnits(percent: number): string {
  return String(Math.round(percent * (PLOT_UNITS / 100) * 10) / 10);
}

function sortedUnique(values: readonly number[]): readonly number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

interface Segment {
  readonly from: number;
  readonly to: number;
}

type StackMap = ReadonlyMap<string, ReadonlyMap<number, Segment>>;

function stackBars(barSeries: readonly ChartSeries[], layout: BarLayout): StackMap {
  const positive = new Map<number, number>();
  const negative = new Map<number, number>();
  const stacks = new Map<string, Map<number, Segment>>();
  for (const series of barSeries) {
    const segments = new Map<number, Segment>();
    for (const datum of series.data) {
      if (layout === "grouped") {
        segments.set(datum.x, { from: 0, to: datum.y });
        continue;
      }
      const ledger = datum.y >= 0 ? positive : negative;
      const from = ledger.get(datum.x) ?? 0;
      const to = from + datum.y;
      ledger.set(datum.x, to);
      segments.set(datum.x, { from, to });
    }
    stacks.set(series.id, segments);
  }
  return stacks;
}

function labelWidthPercent(chars: number, plotPx: number): number {
  return ((chars * PX_PER_CHAR) / plotPx) * 100;
}

function maxLabels(chars: number, plotPx: number): number {
  return Math.max(1, Math.floor(plotPx / (chars * PX_PER_CHAR + LABEL_GAP_PX)));
}

function anchorFor(position: number, halfWidth: number, slack: number): TextAnchor {
  if (position - halfWidth < -slack) return "start";
  if (position + halfWidth > 100 + slack) return "end";
  return "middle";
}

interface XAxis {
  readonly position: (x: number) => number;
  readonly slot: number;
  readonly values: readonly number[];
}

function xAxisOf(kind: XScaleKind, xs: readonly number[], mirrored: boolean): XAxis {
  const flip = (percent: number) => round2(mirrored ? 100 - percent : percent);
  if (kind === "band") {
    const slot = 100 / Math.max(1, xs.length);
    const indexOf = new Map(xs.map((x, index) => [x, index]));
    return {
      slot,
      values: xs,
      position: (x) => flip(((indexOf.get(x) ?? 0) + 0.5) * slot),
    };
  }
  const low = xs[0] ?? 0;
  const high = xs.at(-1) ?? low;
  return {
    slot: 0,
    values: xs,
    position: (x) => flip(LINEAR_INSET + linearPosition(x, low, high) * (100 - 2 * LINEAR_INSET)),
  };
}

function tickSet(
  kind: XScaleKind,
  axis: XAxis,
  chars: number,
  plotPx: number,
  requested: readonly number[] | undefined,
): readonly TickMark[] {
  const limit = maxLabels(chars, plotPx);
  const half = labelWidthPercent(chars, plotPx) / 2;
  const slack = (LABEL_OVERHANG_PX / plotPx) * 100;
  const candidates =
    requested ??
    (kind === "band"
      ? axis.values
      : integerTicks(axis.values[0] ?? 0, axis.values.at(-1) ?? 0, limit));
  const stride =
    kind === "band" || requested !== undefined ? strideFor(candidates.length, limit) : 1;
  return candidates
    .filter((_, index) => index % stride === 0)
    .map((value) => {
      const position = axis.position(value);
      return { value, position, anchor: anchorFor(position, half, slack) };
    });
}

function linePoints(
  series: ChartSeries,
  axis: XAxis,
  kind: XScaleKind,
  yOf: (value: number) => number,
  mirrored: boolean,
): readonly (readonly [number, number])[] {
  const points = series.data.map((datum) => [axis.position(datum.x), yOf(datum.y)] as const);
  if (series.kind !== "step" || points.length === 0) return points;
  const stepped: (readonly [number, number])[] = [];
  const edge = (kind === "band" ? axis.slot / 2 : 0) * (mirrored ? -1 : 1);
  const first = points[0];
  if (first !== undefined && edge !== 0) stepped.push([first[0] - edge, first[1]]);
  points.forEach((point, index) => {
    stepped.push(point);
    const next = points[index + 1];
    if (next !== undefined) stepped.push([next[0], point[1]]);
  });
  const last = points.at(-1);
  if (last !== undefined && edge !== 0) stepped.push([last[0] + edge, last[1]]);
  return stepped;
}

interface LabelSeed {
  readonly end: "first" | "last" | "only";
  readonly label: ValueLabel;
}

function endIndexes(series: ChartSeries): readonly ("first" | "last" | "only")[] {
  const mode = series.endLabels ?? "none";
  if (mode === "none" || series.data.length === 0) return [];
  if (series.data.length === 1) return ["only"];
  return mode === "last" ? ["last"] : ["first", "last"];
}

function inwardAnchor(end: "first" | "last" | "only", mirrored: boolean): TextAnchor {
  if (end === "only") return "middle";
  const startsInward = end === "first" ? !mirrored : mirrored;
  return startsInward ? "start" : "end";
}

function separateLabels(seeds: readonly LabelSeed[], bars: ReadonlySet<string>): ValueLabel[] {
  const out: ValueLabel[] = [];
  for (const end of ["first", "last", "only"] as const) {
    const group = seeds
      .filter((seed) => seed.end === end)
      .map((seed) => seed.label)
      .sort((a, b) => a.y - b.y);
    let previous: ValueLabel | null = null;
    for (const label of group) {
      const crowded = previous !== null && label.y - previous.y < LABEL_COLLISION;
      const placed: ValueLabel =
        crowded && !bars.has(label.seriesId) ? { ...label, placement: "below" } : label;
      out.push(placed);
      previous = placed.placement === "above" ? placed : previous;
    }
  }
  return out;
}

function clearOfBars(
  label: ValueLabel,
  bars: readonly BarMark[],
  chars: number,
  plotPx: number,
): ValueLabel {
  const width = labelWidthPercent(chars, plotPx);
  const from =
    label.anchor === "start"
      ? label.x
      : label.anchor === "end"
        ? label.x - width
        : label.x - width / 2;
  const to = from + width;
  const covered = bars.filter(
    (bar) => bar.seriesId === label.seriesId && bar.x < to && bar.x + bar.width > from,
  );
  return { ...label, y: Math.min(label.y, ...covered.map((bar) => bar.y)) };
}

export function buildChartModel(input: ChartModelInput): ChartModel {
  const { series } = input;
  const mirrored = input.mirrored ?? false;
  const barSeries = series.filter((candidate) => candidate.kind === "bar");
  const kind: XScaleKind = input.xScale ?? (barSeries.length > 0 ? "band" : "linear");
  const layout: BarLayout = input.barLayout ?? "grouped";
  const xs = sortedUnique(series.flatMap((candidate) => candidate.data.map((datum) => datum.x)));
  const stacks = stackBars(barSeries, layout);

  const values = [
    ...series
      .filter((candidate) => candidate.kind !== "bar")
      .flatMap((candidate) => candidate.data.map((datum) => datum.y)),
    ...[...stacks.values()].flatMap((segments) =>
      [...segments.values()].flatMap((segment) => [segment.from, segment.to]),
    ),
  ];
  const domain = valueDomain(values, {
    zeroBased: (input.zeroBased ?? true) || barSeries.length > 0,
    targetTicks: TARGET_TICKS,
    headroom: HEADROOM,
  });
  const yOf = (value: number) => round2((1 - linearPosition(value, domain.low, domain.high)) * 100);
  const baselineValue = domain.low <= 0 && domain.high >= 0 ? 0 : null;
  const baseline = baselineValue === null ? null : yOf(baselineValue);

  const axis = xAxisOf(kind, xs, mirrored);
  const chars = Math.max(1, input.xLabelChars ?? 4);

  const groupCount = layout === "stacked" ? Math.min(1, barSeries.length) : barSeries.length;
  const barWidth =
    groupCount === 0 ? 0 : round2(Math.min((axis.slot * BAR_SHARE) / groupCount, BAR_MAX_WIDTH));

  const bars: BarMark[] = [];
  const barEdges = new Map<
    string,
    Map<number, { readonly left: number; readonly right: number }>
  >();
  barSeries.forEach((candidate, index) => {
    const segments = stacks.get(candidate.id);
    const edges = new Map<number, { readonly left: number; readonly right: number }>();
    for (const datum of candidate.data) {
      const segment = segments?.get(datum.x);
      if (segment === undefined) continue;
      const center = axis.position(datum.x);
      const halfGroup = (barWidth * groupCount) / 2;
      const offset = layout === "stacked" ? 0 : index * barWidth;
      const physicalLeft = mirrored
        ? center + halfGroup - offset - barWidth
        : center - halfGroup + offset;
      const top = Math.min(yOf(segment.from), yOf(segment.to));
      const bottom = Math.max(yOf(segment.from), yOf(segment.to));
      const left = round2(physicalLeft);
      edges.set(datum.x, { left, right: round2(left + barWidth) });
      bars.push({
        key: `${candidate.id}-${String(datum.x)}`,
        seriesId: candidate.id,
        tone: candidate.tone ?? "ink",
        x: left,
        y: round2(top),
        width: barWidth,
        height: round2(bottom - top),
      });
    }
    barEdges.set(candidate.id, edges);
  });

  const lines: LineMark[] = [];
  const markers: MarkerMark[] = [];
  for (const candidate of series) {
    if (candidate.kind === "bar") continue;
    const points = linePoints(candidate, axis, kind, yOf, mirrored);
    lines.push({
      seriesId: candidate.id,
      tone: candidate.tone ?? "ink",
      stroke: candidate.stroke ?? "solid",
      points: points.map(([x, y]) => `${toUnits(x)},${toUnits(y)}`).join(" "),
    });
    const withMarkers =
      candidate.markers ?? (candidate.kind === "line" && candidate.data.length <= MARKERS_UP_TO);
    if (!withMarkers) continue;
    for (const datum of candidate.data) {
      markers.push({
        key: `${candidate.id}-${String(datum.x)}`,
        seriesId: candidate.id,
        tone: candidate.tone ?? "ink",
        cx: axis.position(datum.x),
        cy: yOf(datum.y),
      });
    }
  }

  const seeds: LabelSeed[] = [];
  for (const candidate of series) {
    for (const end of endIndexes(candidate)) {
      const datum = end === "last" ? candidate.data.at(-1) : candidate.data[0];
      if (datum === undefined) continue;
      const anchor = inwardAnchor(end, mirrored);
      const edge = barEdges.get(candidate.id)?.get(datum.x);
      const segment = stacks.get(candidate.id)?.get(datum.x);
      const x =
        edge === undefined || anchor === "middle"
          ? axis.position(datum.x)
          : anchor === "start"
            ? edge.left
            : edge.right;
      const y = segment === undefined ? yOf(datum.y) : Math.min(yOf(segment.to), yOf(segment.from));
      seeds.push({
        end,
        label: {
          key: `${candidate.id}-${end}`,
          seriesId: candidate.id,
          value: datum.y,
          x,
          y,
          anchor,
          placement: "above",
        },
      });
    }
  }

  const separated = separateLabels(seeds, new Set(barSeries.map((candidate) => candidate.id)));
  const charsOf = input.valueLabelChars ?? ((value: number) => String(Math.round(value)).length);
  const fitted = (plotPx: number) =>
    separated.map((label) => clearOfBars(label, bars, charsOf(label.value), plotPx));

  return {
    xScale: kind,
    yTicks: domain.ticks.map((value) => ({ value, position: yOf(value), anchor: "end" })),
    gridlines: domain.ticks.filter((value) => value !== baselineValue).map(yOf),
    baseline,
    xTicksNarrow: tickSet(kind, axis, chars, NARROW_PLOT_PX, input.xTickValues),
    xTicksWide: tickSet(kind, axis, chars, WIDE_PLOT_PX, input.xTickValues),
    bars,
    lines,
    markers,
    labels: fitted(WIDE_PLOT_PX),
    labelsNarrow: fitted(NARROW_PLOT_PX),
  };
}
