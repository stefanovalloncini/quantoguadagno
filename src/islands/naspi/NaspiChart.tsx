import { Chart } from "@/components/chart/Chart.tsx";
import { ChartTable, type DataColumn } from "@/components/chart/ChartTable.tsx";
import { getNaspiConfig } from "@/domain/index.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { NaspiMonthRow } from "./netEstimate.ts";
import { fullAmountMonths, signedPercent, type NaspiOutcome } from "./outcome.ts";
import { IDS } from "./viewIds.ts";

export interface NaspiChartProps {
  readonly outcome: NaspiOutcome;
  readonly f: ViewFormat;
  readonly showAll: boolean;
  readonly visibleMonths: number;
  readonly onShowAll: () => void;
}

export default function NaspiChart({
  outcome,
  f,
  showAll,
  visibleMonths,
  onShowAll,
}: NaspiChartProps) {
  const t = useT();
  const { breakdown, schedule, facts } = outcome;
  if (schedule === null) return null;
  const config = getNaspiConfig(facts.year);
  const rows = schedule.rows;
  const first = rows[0];
  const last = rows.at(-1);
  if (first === undefined || last === undefined) return null;
  const months = schedule.months;
  const full = fullAmountMonths(breakdown);
  const reduces = months > full;
  const rate = f.percent(config.decalageRate);
  const shownRows = showAll ? rows : rows.slice(0, visibleMonths);
  const partial = shownRows.length < rows.length;

  const summary = reduces
    ? t("naspi.chart.summary", {
        first: f.money(first.gross),
        basis: t("naspi.result.basis.first", { months: full }),
        rate,
        last: f.money(last.gross),
        months,
      })
    : t("naspi.chart.summary.flat", { amount: f.money(first.gross), months });

  const columns: readonly DataColumn<NaspiMonthRow>[] = [
    { id: "month", header: t("naspi.table.month"), cell: (row) => row.month },
    {
      id: "gross",
      header: t("naspi.table.gross"),
      numeric: true,
      cell: (row) => f.money(row.gross),
    },
    { id: "net", header: t("naspi.table.net"), numeric: true, cell: (row) => f.money(row.net) },
    {
      id: "change",
      header: t("naspi.table.change"),
      numeric: true,
      wideOnly: true,
      cell: (row) => signedPercent(row.change, f.locale, 2),
    },
  ];

  return (
    <section className="qg-section qg-band" aria-labelledby={IDS.chartHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.chartHeading}>
          {t("naspi.chart.title")}
        </h2>
        <p className="qg-section__hint">{t("naspi.chart.hint")}</p>
      </div>
      <div className="qg-split">
        <Chart
          summary={summary}
          xLabel={t("naspi.chart.month")}
          caption={
            reduces
              ? t("naspi.chart.caption.reduction", { start: breakdown.decalageStartMonth, rate })
              : t("naspi.chart.caption")
          }
          formatValue={(value) => f.money(value)}
          series={[
            {
              id: "gross",
              label: t("naspi.table.gross"),
              kind: "bar",
              endLabels: "first-last",
              data: rows.map((row) => ({ x: row.month, y: row.gross })),
            },
          ]}
        />
        <div className="qg-section">
          <ChartTable
            id={IDS.table}
            caption={t("naspi.table.caption")}
            {...(partial
              ? {
                  captionNote: t("naspi.table.caption.partial", {
                    shown: shownRows.length,
                    months,
                  }),
                }
              : {})}
            columns={columns}
            rows={shownRows}
            rowKey={(row) => String(row.month)}
            total={{
              month: t("naspi.table.total"),
              gross: f.money(schedule.grossTotal),
              net: f.money(schedule.netTotal),
              change: null,
            }}
          />
          {partial && (
            <button className="qg-link-button" type="button" onClick={onShowAll}>
              {t("schedule.showAllMonths")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
