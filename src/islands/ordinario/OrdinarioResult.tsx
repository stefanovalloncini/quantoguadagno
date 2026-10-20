import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { useMemo, useState, type Ref } from "react";
import type { RegionText } from "@/components/form/regionText.ts";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { Actions } from "@/components/result/Actions.tsx";
import { Ledger } from "@/components/result/Ledger.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { useRichT, useT } from "@/i18n/react.tsx";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import { ordinarioValuesToVerify, type OrdinarioResult as Result } from "./compute.ts";
import { buildOrdinarioLedger } from "./ledger.tsx";
import { IDS } from "./viewIds.ts";

export interface OrdinarioResultProps {
  readonly result: Result | null;
  readonly figureState: FigureState;
  readonly prompt: string;
  readonly staleNote: string;
  readonly announcement: string;
  readonly municipalMode: MunicipalMode;
  readonly regions: RegionText;
  readonly f: ViewFormat;
  readonly valueRef: Ref<HTMLParagraphElement>;
}

function TrustLine({ result, f }: { readonly result: Result; readonly f: ViewFormat }) {
  const t = useT();
  const rt = useRichT();
  const { taxYear, gestion, regionCode, comune } = result.values;
  const pending = useMemo(
    () => ordinarioValuesToVerify({ taxYear, gestion, regionCode, withComune: comune !== null }),
    [taxYear, gestion, regionCode, comune],
  );
  const checked = verifiedLine(f.locale);
  return (
    <NoteLine term={t("result.estimate.term")}>
      {t("ordinario.result.estimate")}
      {checked !== null && (
        <>
          {" "}
          {rt("ordinario.result.trust", {
            checked: (
              <a href={checked.href}>
                {t("ordinario.result.verified", {
                  date: checked.date,
                  dateArticle: checked.dateArticle,
                })}
              </a>
            ),
            pending: pending > 0 ? "yes" : "no",
            count: pending,
          })}
        </>
      )}
    </NoteLine>
  );
}

export function OrdinarioResult({
  result,
  figureState,
  prompt,
  staleNote,
  announcement,
  municipalMode,
  regions,
  f,
  valueRef,
}: OrdinarioResultProps) {
  const t = useT();
  const rt = useRichT();
  const [explained, setExplained] = useState(false);
  const shown = result !== null && figureState !== "empty" ? result : null;
  const ledger =
    shown === null
      ? null
      : buildOrdinarioLedger({ result: shown, municipalMode, t, rt, f, regions });

  return (
    <div className="qg-result">
      <div className="qg-result__summary">
        <ResultFigure
          headingId={IDS.resultHeading}
          label={t("ordinario.result.label")}
          state={shown === null ? "empty" : figureState}
          prompt={prompt}
          staleNote={staleNote}
          valueRef={valueRef}
          {...(shown === null
            ? {}
            : {
                value: f.money(shown.breakdown.netAnnual),
                basis: t("ordinario.result.basis"),
                sub: rt("ordinario.result.monthly", {
                  amount: <strong>{f.money(shown.breakdown.netMonthly)}</strong>,
                }),
              })}
        />
      </div>
      <LiveStatus message={announcement} />
      {shown !== null && ledger !== null && (
        <>
          <div className="qg-notes">
            <TrustLine result={shown} f={f} />
            <NoteLine term={t("ordinario.result.vatTerm")}>{t("ordinario.result.vat")}</NoteLine>
          </div>
          <Ledger
            headingId={IDS.ledgerHeading}
            toggleId={IDS.ledgerToggle}
            title={t("ordinario.ledger.title")}
            caption={t("ordinario.ledger.caption", { year: shown.values.taxYear })}
            columns={{
              term: t("ordinario.ledger.column.term"),
              annual: t("ordinario.ledger.column.annual"),
            }}
            rows={ledger.rows}
            total={ledger.total}
            explained={explained}
            onExplainedChange={setExplained}
          />
          <Actions links={[]} copyLink />
        </>
      )}
    </div>
  );
}
