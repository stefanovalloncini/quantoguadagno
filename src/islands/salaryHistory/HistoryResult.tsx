import type { ReactNode } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure } from "@/components/result/ResultFigure.tsx";
import { useRichT, useT } from "@/i18n/react.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import type { EntriesTableProps } from "./EntriesTable.tsx";
import { signedPercent } from "./historyFormat.ts";
import type { PurchasingPower } from "./purchasingPower.ts";
import { IDS } from "./viewIds.ts";

const entriesTable = preloadable(() => import("./EntriesTable.tsx"));
const EntriesTable = entriesTable.Component;

export const loadEntriesTable = entriesTable.load;

export interface HistoryResultProps extends Omit<EntriesTableProps, "f"> {
  readonly power: PurchasingPower;
  readonly announcement: string;
  readonly verified: { readonly date: string; readonly href: string } | null;
  readonly targetYear: number;
  readonly firstTaxYear: number;
  readonly f: ViewFormat;
}

function Figure({
  power,
  targetYear,
  f,
}: {
  readonly power: PurchasingPower;
  readonly targetYear: number;
  readonly f: ViewFormat;
}) {
  const t = useT();
  const rt = useRichT();
  const whole = (value: number): ReactNode => <Amount>{f.whole(value)}</Amount>;
  if (power.kind === "none") {
    return (
      <ResultFigure
        headingId={IDS.resultHeading}
        label={t("history.result.change")}
        state="empty"
        prompt={t("history.result.empty")}
      />
    );
  }
  if (power.kind === "single") {
    const { row } = power;
    const real = row.adjusted?.adjusted;
    const lines = [
      ...(real !== undefined && row.entry.year !== targetYear
        ? [rt("history.result.single.real", { target: targetYear, amount: whole(real) })]
        : []),
      t("history.result.single.more"),
    ];
    return (
      <ResultFigure
        headingId={IDS.resultHeading}
        label={t("history.result.single", { year: row.entry.year })}
        state="ready"
        size="small"
        value={f.whole(row.entry.grossAnnual)}
        sub={lines[0]}
        subLines={lines.slice(1)}
      />
    );
  }
  const { first, last } = power;
  return (
    <ResultFigure
      headingId={IDS.resultHeading}
      label={t("history.result.change")}
      state="ready"
      size="small"
      value={signedPercent(power.realChange, f.locale, 1)}
      basis={t("history.result.change.basis", { first: first.entry.year, last: last.entry.year })}
      sub={rt("history.result.change.sub", {
        from: whole(first.entry.grossAnnual),
        to: whole(last.entry.grossAnnual),
        nominal: <Amount>{signedPercent(power.nominalChange, f.locale, 1)}</Amount>,
        target: targetYear,
        fromReal: whole(first.adjusted.adjusted),
        toReal: whole(last.adjusted.adjusted),
      })}
    />
  );
}

export function HistoryResult({
  power,
  announcement,
  verified,
  targetYear,
  firstTaxYear,
  f,
  ...table
}: HistoryResultProps) {
  const t = useT();
  const rt = useRichT();
  return (
    <div className="qg-result">
      <div className="qg-result__summary">
        <Figure power={power} targetYear={targetYear} f={f} />
      </div>
      <LiveStatus message={announcement} />
      {power.kind !== "none" && (
        <>
          <NoteLine term={t("result.estimate.term")}>
            {t("history.note.estimate", { target: targetYear, firstTax: firstTaxYear })}
            {verified !== null && (
              <>
                {" "}
                {rt("history.note.trust", {
                  checked: (
                    <a href={verified.href}>
                      {t("history.note.verified", { date: verified.date })}
                    </a>
                  ),
                })}
              </>
            )}
          </NoteLine>
          <ClientSuspense fallback={null}>
            <EntriesTable {...table} targetYear={targetYear} firstTaxYear={firstTaxYear} f={f} />
          </ClientSuspense>
        </>
      )}
    </div>
  );
}
