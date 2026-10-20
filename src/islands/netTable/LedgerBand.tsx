import { useRegionText } from "@/components/form/regionText.ts";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { LedgerTable, type LedgerRow } from "@/components/result/Ledger.tsx";
import { useRichT, useT } from "@/i18n/react.tsx";
import type { EmployeeResult } from "@/islands/home/compute.ts";
import { explanationsFor } from "@/islands/home/ExplainedLedger.tsx";
import { buildLedger, type LedgerContext } from "@/islands/home/ledgerRows.tsx";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import type { AmountPage, LedgerNote } from "./model.ts";
import { placeName } from "./present.ts";

export interface LedgerBandProps {
  readonly page: AmountPage;
  readonly result: EmployeeResult;
  readonly headingId: string;
}

// The ledger of the calculator, with every explanation open: a text page has no script to
// open them one by one. The rows are the ones of the model, so a surcharge worth nothing is
// left out and a note says why.
export function LedgerBand({ page, result, headingId }: LedgerBandProps) {
  const t = useT();
  const rt = useRichT();
  const f = useViewFormat();
  const regions = useRegionText();
  const context: LedgerContext = { result, municipalMode: "comune", t, rt, f, regions };
  const ledger = buildLedger(context);
  const explanations = explanationsFor(context);
  const shown = new Set<string>(page.ledger.lines.map((line) => line.id));
  const explained = (row: LedgerRow): LedgerRow => ({ ...row, explanation: explanations[row.id] });
  const city = placeName(page.residence.comuneName);
  const noteText = (note: LedgerNote): string => {
    switch (note.kind) {
      case "municipalExempt":
        return t("netTable.ledger.municipalExempt", { city, threshold: f.whole(note.threshold) });
      case "municipalNone":
        return t("netTable.ledger.municipalNone", { city });
      case "surchargesNotDue":
        return t("netTable.ledger.surchargesNotDue");
    }
  };
  return (
    <section className="qg-section qg-band" aria-labelledby={headingId}>
      <h2 className="qg-heading" id={headingId}>
        {t("netTable.ledger.title")}
      </h2>
      <LedgerTable
        caption={t("employee.ledger.caption", { year: page.year })}
        columns={{
          term: t("employee.ledger.column.term"),
          monthly: t("employee.ledger.column.monthly"),
          annual: t("employee.ledger.column.annual"),
        }}
        rows={ledger.rows.filter((row) => shown.has(row.id)).map(explained)}
        total={explained(ledger.total)}
        explained
      />
      {page.ledger.notes.map((note) => (
        <NoteLine key={note.kind}>{noteText(note)}</NoteLine>
      ))}
    </section>
  );
}
