import { Chart } from "@/components/chart/Chart.tsx";
import type { ChartSeries } from "@/components/chart/chartModel.ts";
import { ChartTable, type DataColumn } from "@/components/chart/ChartTable.tsx";
import { Field } from "@/components/form/Field.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { formatNumber } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { ProjectionYear } from "./compute.ts";
import type { AdjustedEntry, ProjectionBundle } from "./derive.ts";
import type { SalaryEntry } from "./storage.ts";
import { IDS } from "./viewIds.ts";

export const HORIZONS = [1, 3, 5, 10] as const;

export interface HistoryTrendProps {
  readonly rows: readonly AdjustedEntry[];
  readonly projection: ProjectionBundle;
  readonly base: SalaryEntry | null;
  readonly targetYear: number;
  readonly firstTaxYear: number;
  readonly taxYear: number;
  readonly horizon: number;
  readonly growthText: string;
  readonly growthError: string | undefined;
  readonly growthStale: boolean;
  readonly startingGrowth: number;
  readonly f: ViewFormat;
  readonly onGrowthChange: (text: string) => void;
  readonly onGrowthFocus: () => void;
  readonly onGrowthBlur: () => void;
  readonly onHorizonChange: (years: number) => void;
}

function trendSeries(
  rows: readonly AdjustedEntry[],
  projection: readonly ProjectionYear[],
  base: SalaryEntry | null,
  labels: { readonly nominal: string; readonly real: string; readonly projected: string },
): readonly ChartSeries[] {
  const nominal: ChartSeries = {
    id: "nominal",
    label: labels.nominal,
    kind: "line",
    endLabels: projection.length > 0 ? "none" : "last",
    data: rows.map((row) => ({ x: row.entry.year, y: row.entry.grossAnnual })),
  };
  const real: ChartSeries = {
    id: "real",
    label: labels.real,
    kind: "line",
    tone: "muted",
    data: rows.flatMap((row) =>
      row.adjusted === null ? [] : [{ x: row.entry.year, y: row.adjusted.adjusted }],
    ),
  };
  if (projection.length === 0 || base === null) return [nominal, real];
  const projected: ChartSeries = {
    id: "projected",
    label: labels.projected,
    kind: "line",
    stroke: "dashed",
    markers: false,
    endLabels: "last",
    data: [
      { x: base.year, y: base.grossAnnual },
      ...projection.map((year) => ({ x: year.year, y: year.grossAnnual })),
    ],
  };
  return [nominal, real, projected];
}

export default function HistoryTrend({
  rows,
  projection,
  base,
  targetYear,
  firstTaxYear,
  taxYear,
  horizon,
  growthText,
  growthError,
  growthStale,
  startingGrowth,
  f,
  onGrowthChange,
  onGrowthFocus,
  onGrowthBlur,
  onHorizonChange,
}: HistoryTrendProps) {
  const t = useT();
  const expected = projection.expected;
  const series = trendSeries(rows, expected, base, {
    nominal: t("history.chart.nominal"),
    real: t("history.chart.real", { target: targetYear }),
    projected: t("history.chart.projected"),
  });
  const years = new Set(series.flatMap((entry) => entry.data.map((datum) => datum.x)));
  const first = rows[0];
  const last = rows.at(-1);
  if (years.size < 2 || first === undefined || last === undefined) return null;
  const firstReal = rows.find((row) => row.adjusted !== null)?.adjusted?.adjusted;
  const lastReal = rows.findLast((row) => row.adjusted !== null)?.adjusted?.adjusted;
  const end = expected.at(-1);
  const summary = [
    t("history.chart.summary", {
      first: first.entry.year,
      last: last.entry.year,
      from: f.whole(first.entry.grossAnnual),
      to: f.whole(last.entry.grossAnnual),
      target: targetYear,
      fromReal: f.whole(firstReal ?? first.entry.grossAnnual),
      toReal: f.whole(lastReal ?? last.entry.grossAnnual),
    }),
    ...(end === undefined
      ? []
      : [
          t("history.chart.summary.projected", {
            year: end.year,
            amount: f.whole(end.grossAnnual),
          }),
        ]),
  ].join(" ");
  const columns: readonly DataColumn<ProjectionYear>[] = [
    { id: "year", header: t("history.projection.year"), cell: (row) => row.year },
    {
      id: "gross",
      header: t("history.projection.gross"),
      numeric: true,
      cell: (row) => f.whole(row.grossAnnual),
    },
    {
      id: "net",
      header: t("history.projection.net"),
      numeric: true,
      cell: (row) => (row.net === null ? "" : f.money(row.net.netAnnual)),
    },
  ];

  return (
    <section className="qg-section qg-band" aria-labelledby={IDS.trendHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.trendHeading}>
          {t("history.chart.title")}
        </h2>
        <p className="qg-section__hint">
          {t("history.chart.hint", { target: targetYear })}
          {expected.length > 0 && <> {t("history.chart.hint.projected")}</>}
        </p>
      </div>
      <div className="qg-split">
        <Chart
          summary={summary}
          series={series}
          zeroBased={false}
          formatX={String}
          formatValue={(value) => f.whole(value)}
          caption={
            expected.length > 0 ? t("history.chart.caption.projected") : t("history.chart.caption")
          }
        />
        <section className="qg-section" aria-labelledby={IDS.projectionHeading}>
          <h3 className="qg-subheading" id={IDS.projectionHeading}>
            {t("history.projection.title")}
          </h3>
          {base === null ? (
            <p className="qg-section__hint">
              {t("history.projection.empty", { firstTax: firstTaxYear })}
            </p>
          ) : (
            <>
              <p className="qg-section__hint">
                {t("history.projection.hint", {
                  year: base.year,
                  amount: f.whole(base.grossAnnual),
                  taxYear,
                })}
              </p>
              <Field
                id={IDS.growth}
                label={t("history.projection.growth")}
                labelSuffix={t("field.unit.percent")}
                hint={t("history.projection.growth.hint", {
                  rate: `${formatNumber(startingGrowth, f.locale, 2)}%`,
                })}
                error={growthError}
              >
                {(control) => (
                  <NumberInput
                    {...control}
                    kind="percent"
                    name="growthPct"
                    value={growthText}
                    onValueChange={onGrowthChange}
                    onFocus={onGrowthFocus}
                    onBlur={onGrowthBlur}
                  />
                )}
              </Field>
              <RadioGroup
                idPrefix={IDS.horizon}
                name="horizon"
                legend={t("history.projection.horizon")}
                layout="fill"
                value={String(horizon)}
                options={HORIZONS.map((years) => ({ value: String(years), label: String(years) }))}
                onValueChange={(value) => {
                  onHorizonChange(Number(value));
                }}
              />
              {growthStale && <p className="qg-figure__stale">{t("history.projection.stale")}</p>}
              <ChartTable
                id={IDS.projectionTable}
                caption={t("history.projection.caption")}
                columns={columns}
                rows={expected}
                rowKey={(row) => String(row.year)}
              />
            </>
          )}
        </section>
      </div>
    </section>
  );
}
