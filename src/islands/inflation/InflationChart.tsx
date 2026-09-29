import { Chart } from "@/components/chart/Chart.tsx";
import { ChartTable, type DataColumn } from "@/components/chart/ChartTable.tsx";
import type { FrozenSalary, FrozenSalaryYear } from "@/domain/inflation.ts";
import { useT, type TranslateFn } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { ChartPoint } from "./derive.ts";
import { IDS } from "./viewIds.ts";

export interface InflationChartProps {
  readonly frozen: FrozenSalary;
  readonly series: readonly ChartPoint[];
  readonly f: ViewFormat;
}

function lossText(row: FrozenSalaryYear, baseYear: number, t: TranslateFn, f: ViewFormat): string {
  if (row.year === baseYear) return t("inflation.frozen.row.base");
  return row.lossRate >= 0
    ? t("inflation.frozen.row.loss", { rate: f.percent(row.lossRate) })
    : t("inflation.frozen.row.gain", { rate: f.percent(-row.lossRate) });
}

export function InflationChart({ frozen, series, f }: InflationChartProps) {
  const t = useT();
  const columns: readonly DataColumn<FrozenSalaryYear>[] = [
    { id: "year", header: t("inflation.frozen.col.year"), cell: (row) => row.year },
    {
      id: "real",
      header: t("inflation.frozen.col.real"),
      numeric: true,
      cell: (row) => f.money(row.realValue),
    },
    {
      id: "loss",
      header: t("inflation.frozen.col.loss"),
      cell: (row) => lossText(row, frozen.fromYear, t, f),
    },
  ];

  return (
    <section className="qg-section qg-band" aria-labelledby={IDS.frozenHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.frozenHeading}>
          {t("inflation.frozen.title")}
        </h2>
        <p className="qg-section__hint">{t("inflation.frozen.hint")}</p>
      </div>
      <div className="qg-split">
        <Chart
          summary={t("inflation.frozen.caption", { year: frozen.fromYear })}
          xLabel={t("inflation.frozen.col.year")}
          caption={t("inflation.frozen.chart.caption", { year: frozen.fromYear })}
          formatX={(value) => String(value)}
          formatValue={(value) => f.money(value)}
          series={[
            {
              id: "real",
              label: t("inflation.frozen.caption", { year: frozen.fromYear }),
              kind: "line",
              endLabels: "last",
              data: series.map((point) => ({ x: point.x, y: point.y })),
            },
          ]}
        />
        <div className="qg-section">
          <ChartTable
            id={IDS.frozenTable}
            caption={t("inflation.frozen.caption", { year: frozen.fromYear })}
            columns={columns}
            rows={frozen.years}
            rowKey={(row) => String(row.year)}
          />
          {frozen.truncated && (
            <p className="qg-notes__line">
              {t("inflation.frozen.seriesEnd", { year: frozen.lastYear })}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
