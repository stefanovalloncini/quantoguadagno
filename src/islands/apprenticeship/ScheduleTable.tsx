import type { RegionCode } from "@/data/index.ts";
import { useLocale, useT } from "@/i18n/react.tsx";
import { hrefFor } from "@/routePaths.ts";
import { ESTIMATE_PAYMENT_FREQUENCY, type ApprenticeshipScheduleRow } from "./derive.ts";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";

export interface ScheduleTableProps {
  readonly headingId: string;
  readonly rows: readonly ApprenticeshipScheduleRow[];
  readonly region: RegionCode;
  readonly f: ViewFormat;
}

function ScheduleRow({
  row,
  region,
  f,
}: {
  readonly row: ApprenticeshipScheduleRow;
  readonly region: RegionCode;
  readonly f: ViewFormat;
}) {
  const t = useT();
  const locale = useLocale();
  const href = hrefFor("home", locale, {
    l: String(Math.round(row.grossAnnual)),
    t: "apprendistato",
    r: region,
    m: ESTIMATE_PAYMENT_FREQUENCY,
  });
  return (
    <tr role="row">
      <th scope="row" role="rowheader" className="qg-table__primary qg-table__nowrap">
        {t("apprenticeship.col.year")} {row.year}
      </th>
      <td role="cell" className="qg-table__num qg-table__value">
        {f.money(row.grossAnnual)}
      </td>
      <td role="cell" className="qg-table__num qg-table__meta qg-table__meta--sep">
        <span className="qg-table__inline-label" aria-hidden="true">
          {t("apprenticeship.col.percent")}:{" "}
        </span>
        {f.percent(row.percentageOfTarget)}
      </td>
      <td role="cell" className="qg-table__num qg-table__meta">
        <span className="qg-table__inline-label" aria-hidden="true">
          {t("apprenticeship.col.net")}:{" "}
        </span>
        {f.money(row.estimatedNetMonthly)}
      </td>
      <td role="cell" className="qg-table__meta qg-table__nowrap">
        <a href={href} aria-label={t("apprenticeship.row.openLink", { year: row.year })}>
          {t("apprenticeship.row.link")}
        </a>
      </td>
    </tr>
  );
}

export function ScheduleTable({ headingId, rows, region, f }: ScheduleTableProps) {
  const t = useT();
  return (
    <section className="qg-ledger-block" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {t("apprenticeship.schedule.title")}
      </h2>
      <table className="qg-table qg-table--compact qg-table--stack" role="table">
        <caption className="qg-visually-hidden">{t("apprenticeship.schedule.caption")}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              {t("apprenticeship.col.year")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("apprenticeship.col.gross")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num qg-table__wrap">
              {t("apprenticeship.col.percent")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num qg-table__wrap">
              {t("apprenticeship.col.net")}
            </th>
            <th scope="col" role="columnheader">
              <span className="qg-visually-hidden">{t("apprenticeship.row.link")}</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => (
            <ScheduleRow row={row} region={region} f={f} key={row.year} />
          ))}
        </tbody>
      </table>
    </section>
  );
}
