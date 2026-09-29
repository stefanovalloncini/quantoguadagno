import type { ReactNode } from "react";
import { dirOf } from "@/i18n/locales.ts";
import { formatNumber } from "@/i18n/numbers.ts";
import { useLocale } from "@/i18n/react.tsx";
import {
  buildChartModel,
  PLOT_UNITS,
  type BarLayout,
  type ChartSeries,
  type LabelPlacement,
  type SeriesStroke,
  type SeriesTone,
  type TickMark,
  type ValueLabel,
  type XScaleKind,
} from "./chartModel.ts";

export interface ChartProps {
  readonly summary: string;
  readonly series: readonly ChartSeries[];
  readonly caption?: ReactNode;
  readonly xLabel?: ReactNode;
  readonly formatX?: (value: number) => string;
  readonly formatY?: (value: number) => string;
  readonly formatValue?: (value: number) => string;
  readonly legend?: boolean;
  readonly xScale?: XScaleKind;
  readonly barLayout?: BarLayout;
  readonly zeroBased?: boolean;
  readonly xTickValues?: readonly number[];
}

const TICK_CHAR_PX = 7.2;
const TICK_GAP_PX = 10;
const VALUE_OFFSET: Readonly<Record<LabelPlacement, number>> = { above: -9, below: 21 };
const BAR_VALUE_OFFSET = -7;

function toneClass(base: string, tone: SeriesTone, stroke: SeriesStroke = "solid"): string {
  return [
    base,
    tone === "muted" ? `${base}--muted` : null,
    stroke === "dashed" ? `${base}--dashed` : null,
  ]
    .filter((part) => part !== null)
    .join(" ");
}

function percent(value: number): string {
  return `${String(value)}%`;
}

interface LegendProps {
  readonly series: readonly ChartSeries[];
}

function Legend({ series }: LegendProps) {
  return (
    <ul className="qg-chart__legend" role="list">
      {series.map((entry) => {
        const tone = entry.tone ?? "ink";
        return (
          <li className="qg-chart__legend-item" key={entry.id}>
            <svg
              className="qg-chart__key"
              width="24"
              height="12"
              viewBox="0 0 24 12"
              aria-hidden="true"
              focusable="false"
            >
              {entry.kind === "bar" ? (
                <rect
                  className={toneClass("qg-chart__bar", tone)}
                  x="6"
                  y="0"
                  width="12"
                  height="12"
                />
              ) : (
                <>
                  <line
                    className={toneClass("qg-chart__key-line", tone, entry.stroke)}
                    x1="1"
                    y1="6"
                    x2="23"
                    y2="6"
                  />
                  {(entry.markers ?? entry.kind === "line") && (
                    <circle className={toneClass("qg-chart__marker", tone)} cx="12" cy="6" r="4" />
                  )}
                </>
              )}
            </svg>
            {entry.label}
          </li>
        );
      })}
    </ul>
  );
}

interface XTicksProps {
  readonly ticks: readonly TickMark[];
  readonly variant: "narrow" | "wide";
  readonly format: (value: number) => string;
}

function XTicks({ ticks, variant, format }: XTicksProps) {
  return (
    <g className={`qg-chart__x-ticks qg-chart__x-ticks--${variant}`}>
      {ticks.map((tick) => (
        <text
          className="qg-chart__tick"
          key={tick.value}
          x={percent(tick.position)}
          y="17"
          textAnchor={tick.anchor}
        >
          {format(tick.value)}
        </text>
      ))}
    </g>
  );
}

interface ValueLabelsProps {
  readonly labels: readonly ValueLabel[];
  readonly variant: "narrow" | "wide";
  readonly bars: ReadonlySet<string>;
  readonly format: (value: number) => string;
}

function ValueLabels({ labels, variant, bars, format }: ValueLabelsProps) {
  return (
    <g className={`qg-chart__values qg-chart__values--${variant}`}>
      {labels.map((label) => (
        <text
          className="qg-chart__value"
          key={label.key}
          x={percent(label.x)}
          y={percent(label.y)}
          dy={bars.has(label.seriesId) ? BAR_VALUE_OFFSET : VALUE_OFFSET[label.placement]}
          textAnchor={label.anchor}
        >
          {format(label.value)}
        </text>
      ))}
    </g>
  );
}

export function Chart({
  summary,
  series,
  caption,
  xLabel,
  formatX,
  formatY,
  formatValue,
  legend,
  xScale,
  barLayout,
  zeroBased,
  xTickValues,
}: ChartProps) {
  const locale = useLocale();
  const mirrored = dirOf(locale) === "rtl";
  const tickX = formatX ?? ((value: number) => formatNumber(value, locale, 0));
  const tickY = formatY ?? ((value: number) => formatNumber(value, locale, 0));
  const valueText = formatValue ?? tickY;
  const xs = series.flatMap((entry) => entry.data.map((datum) => datum.x));
  const xLabelChars = Math.max(1, ...xs.map((x) => tickX(x).length));
  const model = buildChartModel({
    series,
    mirrored,
    xLabelChars,
    valueLabelChars: (value) => valueText(value).length,
    ...(xScale === undefined ? {} : { xScale }),
    ...(barLayout === undefined ? {} : { barLayout }),
    ...(zeroBased === undefined ? {} : { zeroBased }),
    ...(xTickValues === undefined ? {} : { xTickValues }),
  });
  const yLabels = model.yTicks.map((tick) => ({ ...tick, text: tickY(tick.value) }));
  const yAxisWidth = Math.ceil(
    Math.max(1, ...yLabels.map((tick) => tick.text.length)) * TICK_CHAR_PX + TICK_GAP_PX,
  );
  const barSeries = new Set(
    series.filter((entry) => entry.kind === "bar").map((entry) => entry.id),
  );
  const showLegend = legend ?? series.length > 1;

  return (
    <figure className="qg-chart">
      {showLegend && <Legend series={series} />}
      <div className="qg-chart__frame" role="img" aria-label={summary}>
        <svg className="qg-chart__y" width={yAxisWidth} aria-hidden="true" focusable="false">
          {yLabels.map((tick) => (
            <text
              className="qg-chart__tick"
              key={tick.value}
              x={mirrored ? TICK_GAP_PX : yAxisWidth - TICK_GAP_PX}
              y={percent(tick.position)}
              dy="0.32em"
              textAnchor={mirrored ? "start" : "end"}
            >
              {tick.text}
            </text>
          ))}
        </svg>
        <svg
          className={
            barLayout === "stacked" ? "qg-chart__plot qg-chart__plot--stacked" : "qg-chart__plot"
          }
          aria-hidden="true"
          focusable="false"
        >
          {model.gridlines.map((y) => (
            <line
              className="qg-chart__grid"
              key={y}
              x1="0"
              x2="100%"
              y1={percent(y)}
              y2={percent(y)}
            />
          ))}
          {model.bars.map((bar) => (
            <rect
              className={toneClass("qg-chart__bar", bar.tone)}
              key={bar.key}
              x={percent(bar.x)}
              y={percent(bar.y)}
              width={percent(bar.width)}
              height={percent(bar.height)}
            />
          ))}
          {model.lines.length > 0 && (
            <svg
              className="qg-chart__lines"
              viewBox={`0 0 ${String(PLOT_UNITS)} ${String(PLOT_UNITS)}`}
              preserveAspectRatio="none"
              width="100%"
              height="100%"
            >
              {model.lines.map((line) => (
                <polyline
                  className={toneClass("qg-chart__line", line.tone, line.stroke)}
                  key={line.seriesId}
                  points={line.points}
                />
              ))}
            </svg>
          )}
          {model.baseline !== null && (
            <line
              className="qg-chart__baseline"
              x1="0"
              x2="100%"
              y1={percent(model.baseline)}
              y2={percent(model.baseline)}
            />
          )}
          {model.markers.map((marker) => (
            <circle
              className={toneClass("qg-chart__marker", marker.tone)}
              key={marker.key}
              cx={percent(marker.cx)}
              cy={percent(marker.cy)}
              r="4"
            />
          ))}
          <ValueLabels
            labels={model.labelsNarrow}
            variant="narrow"
            bars={barSeries}
            format={valueText}
          />
          <ValueLabels labels={model.labels} variant="wide" bars={barSeries} format={valueText} />
        </svg>
        <svg className="qg-chart__x" aria-hidden="true" focusable="false">
          <XTicks ticks={model.xTicksNarrow} variant="narrow" format={tickX} />
          <XTicks ticks={model.xTicksWide} variant="wide" format={tickX} />
        </svg>
        {xLabel !== undefined && <p className="qg-chart__axis-title">{xLabel}</p>}
      </div>
      {caption !== undefined && <figcaption className="qg-chart__caption">{caption}</figcaption>}
    </figure>
  );
}
