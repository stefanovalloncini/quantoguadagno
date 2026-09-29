import type { ReactNode } from "react";
import type { ChartSeries } from "./chartModel.ts";

export interface DataColumn<R> {
  readonly id: string;
  readonly header: ReactNode;
  readonly cell: (row: R) => ReactNode;
  readonly numeric?: boolean;
  readonly wideOnly?: boolean;
}

export interface ChartTableProps<R> {
  readonly caption: string;
  readonly columns: readonly DataColumn<R>[];
  readonly rows: readonly R[];
  readonly rowKey: (row: R) => string;
  readonly captionNote?: ReactNode;
  readonly total?: Readonly<Record<string, ReactNode>>;
  readonly id?: string;
}

function cellClass(column: DataColumn<never>): string | undefined {
  const parts = [
    column.numeric === true ? "qg-table__num" : null,
    column.wideOnly === true ? "qg-table__wide" : null,
  ].filter((part) => part !== null);
  return parts.length === 0 ? undefined : parts.join(" ");
}

export function ChartTable<R>({
  caption,
  columns,
  rows,
  rowKey,
  captionNote,
  total,
  id,
}: ChartTableProps<R>) {
  return (
    <div
      className="qg-table-scroll qg-chart-table"
      id={id}
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="qg-table qg-table--compact qg-table--condensed">
        <caption>
          {caption}
          {captionNote !== undefined && (
            <span className="qg-table__caption-note">{captionNote}</span>
          )}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" className={cellClass(column)} key={column.id}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) =>
                index === 0 ? (
                  <th scope="row" className={cellClass(column)} key={column.id}>
                    {column.cell(row)}
                  </th>
                ) : (
                  <td className={cellClass(column)} key={column.id}>
                    {column.cell(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {total !== undefined && (
          <tfoot>
            <tr className="qg-table__total">
              {columns.map((column, index) =>
                index === 0 ? (
                  <th scope="row" className={cellClass(column)} key={column.id}>
                    {total[column.id]}
                  </th>
                ) : (
                  <td className={cellClass(column)} key={column.id}>
                    {total[column.id]}
                  </td>
                ),
              )}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export interface SeriesRow {
  readonly x: number;
  readonly values: ReadonlyMap<string, number>;
}

export function seriesRows(series: readonly ChartSeries[]): readonly SeriesRow[] {
  const byX = new Map<number, Map<string, number>>();
  for (const entry of series) {
    for (const datum of entry.data) {
      const values = byX.get(datum.x) ?? new Map<string, number>();
      values.set(entry.id, datum.y);
      byX.set(datum.x, values);
    }
  }
  return [...byX.entries()].sort(([a], [b]) => a - b).map(([x, values]) => ({ x, values }));
}

export interface SeriesColumnsOptions {
  readonly xHeader: ReactNode;
  readonly formatX: (value: number) => ReactNode;
  readonly formatY: (value: number) => ReactNode;
  readonly missing?: ReactNode;
}

export function seriesColumns(
  series: readonly ChartSeries[],
  { xHeader, formatX, formatY, missing }: SeriesColumnsOptions,
): readonly DataColumn<SeriesRow>[] {
  return [
    { id: "x", header: xHeader, cell: (row) => formatX(row.x) },
    ...series.map((entry): DataColumn<SeriesRow> => ({
      id: entry.id,
      header: entry.label,
      numeric: true,
      cell: (row) => {
        const value = row.values.get(entry.id);
        return value === undefined ? missing : formatY(value);
      },
    })),
  ];
}
