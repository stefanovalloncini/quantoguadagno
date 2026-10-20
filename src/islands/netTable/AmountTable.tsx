import type { PaymentFrequency } from "@/data/index.ts";
import { formatPercent } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { netTablePath } from "./amounts.ts";
import { monthlyOf, type NetRow } from "./model.ts";

export interface AmountTableProps {
  readonly caption: string;
  readonly rows: readonly NetRow[];
  readonly counts: readonly PaymentFrequency[];
  readonly withheld?: boolean;
  readonly stacked?: boolean;
}

interface MetaCell {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export function AmountTable({
  caption,
  rows,
  counts,
  withheld = false,
  stacked = false,
}: AmountTableProps) {
  const t = useT();
  const f = useViewFormat();
  const metaCells = (row: NetRow): readonly MetaCell[] => [
    ...counts.map((count) => ({
      id: `monthly-${String(count)}`,
      label: t("netTable.inline.monthly", { count }),
      value: f.money(monthlyOf(row, count)),
    })),
    ...(withheld
      ? [
          {
            id: "withheld",
            label: t("netTable.inline.withheld"),
            value: formatPercent(row.withheldShare, f.locale, 1),
          },
        ]
      : []),
  ];
  return (
    <table
      className={
        stacked ? "qg-table qg-table--compact qg-table--stack" : "qg-table qg-table--compact"
      }
      role="table"
    >
      <caption className="qg-visually-hidden">{caption}</caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">
            {t("netTable.column.gross")}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {t("netTable.column.net")}
          </th>
          {counts.map((count) => (
            <th scope="col" role="columnheader" className="qg-table__num" key={count}>
              {t("netTable.column.monthly", { count })}
            </th>
          ))}
          {withheld && (
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("netTable.column.withheld")}
            </th>
          )}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {rows.map((row) => {
          const cells = metaCells(row);
          return (
            <tr role="row" key={row.gross}>
              <th scope="row" role="rowheader" className="qg-table__primary">
                <a href={netTablePath(row.gross, f.locale)}>
                  {f.whole(row.gross)}
                  <span className="qg-visually-hidden"> {t("netTable.row.suffix")}</span>
                </a>
              </th>
              <td role="cell" className="qg-table__num qg-table__value">
                {f.money(row.netAnnual)}
              </td>
              {cells.map((cell, index) => (
                <td
                  role="cell"
                  className={
                    index < cells.length - 1
                      ? "qg-table__num qg-table__meta qg-table__meta--sep"
                      : "qg-table__num qg-table__meta"
                  }
                  key={cell.id}
                >
                  <span className="qg-table__inline-label" aria-hidden="true">
                    {cell.label}{" "}
                  </span>
                  {cell.value}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
