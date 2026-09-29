import type { ReactNode } from "react";
import { useT } from "@/i18n/react.tsx";

export type LedgerRowKind = "plain" | "deducted" | "credited" | "subtotal" | "total";

export interface LedgerRow {
  readonly id: string;
  readonly name: ReactNode;
  readonly kind: LedgerRowKind;
  readonly annual: string;
  readonly monthly?: string;
  readonly rule?: ReactNode;
  readonly explanation?: ReactNode;
}

export interface LedgerColumns {
  readonly term: string;
  readonly annual: string;
  readonly monthly?: string;
}

export interface LedgerProps {
  readonly headingId: string;
  readonly toggleId: string;
  readonly title: ReactNode;
  readonly caption: string;
  readonly columns: LedgerColumns;
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
  readonly explained: boolean;
  readonly onExplainedChange?: (explained: boolean) => void;
}

const ROW_CLASS: Readonly<Record<LedgerRowKind, string>> = {
  plain: "qg-ledger__row",
  deducted: "qg-ledger__row",
  credited: "qg-ledger__row",
  subtotal: "qg-ledger__row qg-ledger__row--subtotal",
  total: "qg-ledger__row qg-ledger__row--total",
};

interface RowProps {
  readonly row: LedgerRow;
  readonly withMonthly: boolean;
  readonly explained: boolean;
}

function LedgerLine({ row, withMonthly, explained }: RowProps) {
  const t = useT();
  const suffix =
    row.kind === "deducted"
      ? t("ledger.deducted")
      : row.kind === "credited"
        ? t("ledger.credited")
        : null;
  return (
    <>
      <tr className={ROW_CLASS[row.kind]}>
        <th scope="row">
          <span className="qg-ledger__term">
            <span className="qg-ledger__name">
              {row.name}
              {suffix !== null && <span className="qg-visually-hidden">{suffix}</span>}
            </span>
            {row.rule !== undefined && <span className="qg-ledger__rule">{row.rule}</span>}
          </span>
        </th>
        {withMonthly && <td className="qg-ledger__num qg-ledger__month">{row.monthly}</td>}
        <td className="qg-ledger__num">{row.annual}</td>
      </tr>
      {explained && row.explanation !== undefined && (
        <tr className="qg-ledger__explain-row">
          <td colSpan={withMonthly ? 3 : 2}>
            <div className="qg-ledger__explain">{row.explanation}</div>
          </td>
        </tr>
      )}
    </>
  );
}

export interface LedgerTableProps {
  readonly caption: string;
  readonly columns: LedgerColumns;
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
  readonly explained: boolean;
}

export function LedgerTable({ caption, columns, rows, total, explained }: LedgerTableProps) {
  const withMonthly = columns.monthly !== undefined;
  return (
    <table className="qg-ledger">
      <caption className="qg-visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.term}</th>
          {withMonthly && (
            <th scope="col" className="qg-ledger__num qg-ledger__month">
              {columns.monthly}
            </th>
          )}
          <th scope="col" className="qg-ledger__num">
            {columns.annual}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <LedgerLine key={row.id} row={row} withMonthly={withMonthly} explained={explained} />
        ))}
      </tbody>
      <tfoot>
        <LedgerLine row={total} withMonthly={withMonthly} explained={explained} />
      </tfoot>
    </table>
  );
}

export function Ledger({
  headingId,
  toggleId,
  title,
  caption,
  columns,
  rows,
  total,
  explained,
  onExplainedChange,
}: LedgerProps) {
  const t = useT();
  return (
    <section className="qg-ledger-block" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {title}
      </h2>
      <div className="qg-check">
        <input
          className="qg-check__input"
          type="checkbox"
          id={toggleId}
          checked={explained}
          onChange={(event) => {
            onExplainedChange?.(event.target.checked);
          }}
        />
        <label className="qg-check__label" htmlFor={toggleId}>
          {t("ledger.explain")}
        </label>
      </div>
      <LedgerTable
        caption={caption}
        columns={columns}
        rows={rows}
        total={total}
        explained={explained}
      />
    </section>
  );
}

export interface WorkedSumRow {
  readonly id: string;
  readonly label: ReactNode;
  readonly amount: string;
}

export interface WorkedSumProps {
  readonly rows: readonly WorkedSumRow[];
  readonly total: WorkedSumRow;
}

export function WorkedSum({ rows, total }: WorkedSumProps) {
  return (
    <dl className="qg-sum">
      {rows.map((row) => (
        <div className="qg-sum__row" key={row.id}>
          <dt>{row.label}</dt>
          <dd>{row.amount}</dd>
        </div>
      ))}
      <div className="qg-sum__row qg-sum__row--total">
        <dt>{total.label}</dt>
        <dd>{total.amount}</dd>
      </div>
    </dl>
  );
}
