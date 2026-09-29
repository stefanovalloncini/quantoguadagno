import { Chart } from "@/components/chart/Chart.tsx";
import { ChartTable, type DataColumn } from "@/components/chart/ChartTable.tsx";
import type { CompoundInterestBreakdown, CompoundInterestYear } from "@/domain/compoundInterest.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { ChartPoint, VisibleSchedule } from "./derive.ts";
import { IDS } from "./viewIds.ts";

export interface CompoundInterestChartProps {
  readonly result: CompoundInterestBreakdown;
  readonly schedule: VisibleSchedule;
  readonly nominalSeries: readonly ChartPoint[];
  readonly realSeries: readonly ChartPoint[];
  readonly f: ViewFormat;
  readonly onShowAll: () => void;
}

export function CompoundInterestChart({
  result,
  schedule,
  nominalSeries,
  realSeries,
  f,
  onShowAll,
}: CompoundInterestChartProps) {
  const t = useT();
  const columns: readonly DataColumn<CompoundInterestYear>[] = [
    { id: "year", header: t("compoundInterest.schedule.year"), cell: (row) => row.year },
    {
      id: "balance",
      header: t("compoundInterest.schedule.balance"),
      numeric: true,
      cell: (row) => f.money(row.nominalBalance),
    },
    {
      id: "real",
      header: t("compoundInterest.schedule.real"),
      numeric: true,
      cell: (row) => f.money(row.realBalance),
    },
    {
      id: "contributions",
      header: t("compoundInterest.schedule.contributions"),
      numeric: true,
      wideOnly: true,
      cell: (row) => f.money(row.contributedSoFar),
    },
    {
      id: "interest",
      header: t("compoundInterest.schedule.interest"),
      numeric: true,
      wideOnly: true,
      cell: (row) => f.money(row.interestSoFar),
    },
  ];

  return (
    <section className="qg-section qg-band" aria-labelledby={IDS.chartHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.chartHeading}>
          {t("compoundInterest.chart.title")}
        </h2>
        <p className="qg-section__hint">{t("compoundInterest.chart.hint")}</p>
      </div>
      <div className="qg-split">
        <Chart
          summary={t("compoundInterest.chart.summary", {
            years: result.schedule.length - 1,
            nominal: f.money(result.finalNominal),
            real: f.money(result.finalReal),
          })}
          xLabel={t("compoundInterest.schedule.year")}
          caption={t("compoundInterest.chart.caption")}
          formatValue={(value) => f.money(value)}
          legend
          series={[
            {
              id: "nominal",
              label: t("compoundInterest.schedule.balance"),
              kind: "line",
              endLabels: "last",
              data: nominalSeries.map((point) => ({ x: point.x, y: point.y })),
            },
            {
              id: "real",
              label: t("compoundInterest.schedule.real"),
              kind: "line",
              tone: "muted",
              stroke: "dashed",
              endLabels: "last",
              data: realSeries.map((point) => ({ x: point.x, y: point.y })),
            },
          ]}
        />
        <div className="qg-section">
          <ChartTable
            id={IDS.table}
            caption={t("compoundInterest.schedule.caption")}
            {...(schedule.hasMore
              ? { captionNote: t("compoundInterest.schedule.caption.partial") }
              : {})}
            columns={columns}
            rows={schedule.rows}
            rowKey={(row) => String(row.year)}
          />
          {schedule.hasMore && (
            <button className="qg-link-button" type="button" onClick={onShowAll}>
              {t("schedule.showAllYears")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
