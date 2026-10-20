import { Icon } from "@/components/icons/Icon.tsx";
import { useLocale, useT } from "@/i18n/react.tsx";
import { compactReference, dateText, dateValues } from "@/islands/prose/phrases.ts";
import type { CheckState, RowStatus, SourceGroup, SourceRow } from "./model.ts";
import { SourceReference } from "./SourceReference.tsx";

interface SourceTableProps {
  readonly caption: string;
  readonly nameHeader: string;
  readonly groups: readonly SourceGroup[];
  readonly anchorPrefix?: string;
}

export function groupAnchor(prefix: string, groupId: string): string {
  return `${prefix}-${groupId}`;
}

const COLUMN_COUNT = 5;

function CheckCell({ check, status }: { readonly check: CheckState; readonly status: RowStatus }) {
  const t = useT();
  const locale = useLocale();
  if (status === "todo") {
    return (
      <td role="cell" className="qg-table__meta qg-table__status">
        {check.kind === "retrieved" && (
          <>{t("sources.check.retrieved", dateValues(check.date, locale))} </>
        )}
        <StatusLabel status={status} />
      </td>
    );
  }
  return (
    <td role="cell" className="qg-table__meta">
      <span className="qg-table__inline-label" aria-hidden="true">
        {t("sources.check.inline")}{" "}
      </span>
      {check.kind !== "missing" && (
        <span className="qg-table__nowrap">{dateText(check.date, locale)}</span>
      )}
      {status === "provisional" && (
        <>
          {" "}
          <StatusLabel status={status} />
        </>
      )}
    </td>
  );
}

export function StatusLabel({ status }: { readonly status: RowStatus }) {
  const t = useT();
  if (status === "todo") {
    return (
      <span className="qg-status qg-status--todo">
        <Icon name="alert" />
        {t("sources.status.todo")}
      </span>
    );
  }
  if (status === "provisional") {
    return (
      <span className="qg-status qg-status--provisional">
        <Icon name="clock" />
        {t("sources.status.provisional")}
      </span>
    );
  }
  return null;
}

function Row({ row }: { readonly row: SourceRow }) {
  return (
    <tr role="row">
      <th scope="row" role="rowheader" className="qg-table__primary">
        {row.label}
      </th>
      <td role="cell" className="qg-table__num qg-table__value">
        {row.value}
      </td>
      <td role="cell" className="qg-table__meta qg-table__meta--sep qg-table__nowrap">
        {row.years}
      </td>
      <td
        role="cell"
        className={row.status === "todo" ? "qg-table__meta" : "qg-table__meta qg-table__meta--sep"}
      >
        <SourceReference source={row.source} text={compactReference(row.source.ref)} />
      </td>
      <CheckCell check={row.check} status={row.status} />
    </tr>
  );
}

export function SourceTable({ caption, nameHeader, groups, anchorPrefix }: SourceTableProps) {
  const t = useT();
  return (
    <table className="qg-table qg-table--compact qg-table--stack" role="table">
      <caption className="qg-visually-hidden">{caption}</caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">
            {nameHeader}
          </th>
          <th scope="col" role="columnheader" className="qg-table__num">
            {t("sources.column.value")}
          </th>
          <th scope="col" role="columnheader">
            {t("sources.column.years")}
          </th>
          <th scope="col" role="columnheader">
            {t("sources.column.source")}
          </th>
          <th scope="col" role="columnheader">
            {t("sources.column.checked")}
          </th>
        </tr>
      </thead>
      {groups.map((group) => (
        <tbody role="rowgroup" key={group.id}>
          <tr
            role="row"
            className="qg-table__group"
            id={anchorPrefix === undefined ? undefined : groupAnchor(anchorPrefix, group.id)}
          >
            <th scope="rowgroup" role="rowheader" colSpan={COLUMN_COUNT}>
              {group.label}
            </th>
          </tr>
          {group.rows.map((row) => (
            <Row row={row} key={row.id} />
          ))}
        </tbody>
      ))}
    </table>
  );
}
