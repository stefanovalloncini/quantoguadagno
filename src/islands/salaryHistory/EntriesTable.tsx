import { useRegionText } from "@/components/form/regionText.ts";
import { useT } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { AdjustedEntry } from "./derive.ts";
import { DEFAULT_ENTRY_SETTINGS, type SalaryEntry } from "./storage.ts";
import { IDS, removeButtonId } from "./viewIds.ts";

export interface EntriesTableProps {
  readonly rows: readonly AdjustedEntry[];
  readonly targetYear: number;
  readonly firstTaxYear: number;
  readonly confirming: boolean;
  readonly f: ViewFormat;
  readonly onRemove: (entry: SalaryEntry) => void;
  readonly onClearRequest: () => void;
  readonly onClearConfirm: () => void;
  readonly onClearCancel: () => void;
}

export default function EntriesTable({
  rows,
  targetYear,
  firstTaxYear,
  confirming,
  f,
  onRemove,
  onClearRequest,
  onClearConfirm,
  onClearCancel,
}: EntriesTableProps) {
  const t = useT();
  const regions = useRegionText();
  const realHeader = t("history.entries.real", { target: targetYear });
  const netHeader = t("history.entries.net");
  const missingNet = rows.some((row) => row.net === null);
  const migrated = rows.some((row) => row.entry.isMigrated === true);

  return (
    <section className="qg-section" aria-labelledby={IDS.entriesHeading}>
      <h2 className="qg-heading" id={IDS.entriesHeading} tabIndex={-1}>
        {t("history.entries.title")}
      </h2>
      <table className="qg-table qg-table--compact qg-table--stack qg-entries" role="table">
        <caption className="qg-visually-hidden">{t("history.entries.caption")}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              {t("history.entries.year")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {t("history.entries.gross")}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {realHeader}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              {netHeader}
            </th>
            <th scope="col" role="columnheader" className="qg-table__num">
              <span className="qg-visually-hidden">{t("history.entries.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map(({ entry, adjusted, net }) => (
            <tr role="row" key={entry.id}>
              <th scope="row" role="rowheader" className="qg-table__primary">
                {entry.year}
                {entry.note !== undefined && (
                  <span className="qg-table__note qg-entries__note">{entry.note}</span>
                )}
                {entry.isMigrated === true && (
                  <span className="qg-table__note qg-entries__note">
                    {t("history.entries.migrated")}
                  </span>
                )}
              </th>
              <td role="cell" className="qg-table__num qg-table__value">
                {f.whole(entry.grossAnnual)}
              </td>
              <td role="cell" className="qg-table__num qg-table__pair" data-label={realHeader}>
                {adjusted === null ? t("history.entries.realMissing") : f.whole(adjusted.adjusted)}
              </td>
              <td
                role="cell"
                className={
                  net === null
                    ? "qg-table__num qg-table__pair qg-table__muted"
                    : "qg-table__num qg-table__pair"
                }
                data-label={netHeader}
              >
                {net === null ? t("history.entries.netMissing") : f.money(net.netAnnual)}
              </td>
              <td role="cell" className="qg-table__num qg-entries__action">
                <button
                  className="qg-link-button"
                  type="button"
                  id={removeButtonId(entry.id)}
                  onClick={() => {
                    onRemove(entry);
                  }}
                >
                  {t("history.entries.remove")}{" "}
                  <span className="qg-visually-hidden">
                    {t("history.entries.remove.target", { year: entry.year })}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {missingNet && (
        <p className="qg-section__hint">
          {t("history.entries.netNote", { firstTax: firstTaxYear })}
        </p>
      )}
      {migrated && (
        <p className="qg-section__hint">
          {t("history.entries.migratedNote", {
            count: DEFAULT_ENTRY_SETTINGS.paymentFrequency,
            region: regions.name(DEFAULT_ENTRY_SETTINGS.regionCode),
            rate: f.percent(DEFAULT_ENTRY_SETTINGS.municipalTaxRate),
          })}
        </p>
      )}
      {confirming ? (
        <div className="qg-notice" role="group" aria-labelledby={IDS.clearQuestion}>
          <p className="qg-notice__title" id={IDS.clearQuestion} tabIndex={-1}>
            {t("history.entries.clear.question", { count: rows.length })}
          </p>
          <div className="qg-actions">
            <button className="qg-button" type="button" onClick={onClearConfirm}>
              {t("history.entries.clear.confirm")}
            </button>
            <button className="qg-link-button" type="button" onClick={onClearCancel}>
              {t("history.entries.clear.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button className="qg-link-button" type="button" id={IDS.clear} onClick={onClearRequest}>
          {t("history.entries.clear")}
        </button>
      )}
    </section>
  );
}
