import type { TfrYear } from "@/domain/index.ts";
import { useFormat, useT } from "@/i18n/react.tsx";

export interface ScheduleTableProps {
  readonly headingId: string;
  readonly rows: readonly TfrYear[];
  readonly hasMoreYears: boolean;
  readonly showAllYears: boolean;
  readonly onReveal: () => void;
}

export function ScheduleTable({
  headingId,
  rows,
  hasMoreYears,
  showAllYears,
  onReveal,
}: ScheduleTableProps) {
  const t = useT();
  const f = useFormat();
  return (
    <section className="qg-ledger-block qg-band qg-band--narrow" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {t("tfr.schedule.title")}
      </h2>
      <table className="qg-table qg-table--compact qg-table--stack" role="table">
        <caption className="qg-visually-hidden">{t("tfr.schedule.caption")}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              {t("tfr.schedule.year")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("tfr.schedule.quota")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("tfr.schedule.revaluation")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("tfr.schedule.stock")}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => (
            <tr key={row.year} role="row">
              <th scope="row" role="rowheader" className="qg-table__primary">
                <span className="qg-table__inline-label" aria-hidden="true">
                  {t("tfr.schedule.year")}{" "}
                </span>
                {row.year}
              </th>
              <td
                role="cell"
                className="qg-table__num qg-table__pair"
                data-label={t("tfr.schedule.quota")}
              >
                {f.money(row.quota)}
              </td>
              <td
                role="cell"
                className="qg-table__num qg-table__pair"
                data-label={t("tfr.schedule.revaluation")}
              >
                {f.money(row.revaluation)}
              </td>
              <td role="cell" className="qg-table__num qg-table__value">
                {f.money(row.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMoreYears && !showAllYears && (
        <p className="qg-notes__line">
          <button className="qg-link-button" type="button" onClick={onReveal}>
            {t("schedule.showAllYears")}
          </button>
        </p>
      )}
    </section>
  );
}
