import { useState, type ReactNode, type Ref } from "react";
import { Actions } from "@/components/result/Actions.tsx";
import { Ledger } from "@/components/result/Ledger.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { FigureAside, ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { useRichT, useT } from "@/i18n/react.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import { NET_PAY_PREFIXES, TrustNote } from "@/islands/inverse/TrustNote.tsx";
import type { EmployerCostResult as Result } from "./compute.ts";
import { buildCostLedger } from "./costLedger.tsx";
import type { EmployerCostDerived } from "./derive.ts";
import { IDS } from "./viewIds.ts";

const COST_PREFIXES: readonly string[] = [...NET_PAY_PREFIXES, "employer.", "tfr"];

export interface EmployerCostResultProps {
  readonly result: Result | null;
  readonly derived: EmployerCostDerived | null;
  readonly figureState: FigureState;
  readonly staleNote: ReactNode;
  readonly prompt: string;
  readonly printHref: string;
  readonly announcement: string;
  readonly f: ViewFormat;
  readonly valueRef: Ref<HTMLParagraphElement>;
}

export function EmployerCostResult({
  result,
  derived,
  figureState,
  staleNote,
  prompt,
  printHref,
  announcement,
  f,
  valueRef,
}: EmployerCostResultProps) {
  const t = useT();
  const rt = useRichT();
  const [explained, setExplained] = useState(false);
  const showDetail = result !== null && derived !== null && figureState !== "empty";
  const ledger = showDetail
    ? buildCostLedger({
        ledger: derived.ledger,
        cost: derived.cost,
        year: result.values.taxYear,
        t,
        rt,
        f,
      })
    : null;
  const ratio = derived?.cost.costPerNetEuro ?? null;

  return (
    <div className="qg-result">
      <div className="qg-result__summary">
        <ResultFigure
          headingId={IDS.resultHeading}
          label={t("employerCost.result.label")}
          state={derived === null ? "empty" : figureState}
          prompt={prompt}
          staleNote={staleNote}
          valueRef={valueRef}
          {...(derived === null
            ? {}
            : {
                value: f.money(derived.ledger.total),
                basis: t("employerCost.result.basis", { amount: f.money(derived.grossAnnual) }),
                sub: rt("employerCost.result.monthly", {
                  amount: <strong>{f.money(derived.ledger.totalMonthly)}</strong>,
                }),
              })}
        />
      </div>
      <LiveStatus message={announcement} />
      {showDetail && ledger !== null && (
        <>
          {ratio !== null && (
            <FigureAside shown={figureState === "ready"}>
              {rt("employerCost.result.net", {
                net: <Amount>{f.money(derived.netAnnual)}</Amount>,
                monthly: <Amount>{f.money(derived.netMonthly)}</Amount>,
                count: result.values.paymentFrequency,
                ratio: <Amount>{f.money(ratio)}</Amount>,
              })}
            </FigureAside>
          )}
          <TrustNote
            ns="employerCost"
            locale={f.locale}
            scope={{
              prefixes: COST_PREFIXES,
              region: result.values.regionCode,
              year: result.values.taxYear,
              withComune: result.values.comune !== null,
            }}
          />
          <Ledger
            headingId={IDS.ledgerHeading}
            toggleId={IDS.ledgerToggle}
            title={t("employerCost.ledger.title")}
            caption={t("employerCost.ledger.caption", { year: result.values.taxYear })}
            columns={{
              term: t("employerCost.ledger.column.term"),
              monthly: t("employerCost.ledger.column.monthly"),
              annual: t("employerCost.ledger.column.annual"),
            }}
            rows={ledger.rows}
            total={ledger.total}
            explained={explained}
            onExplainedChange={setExplained}
          />
          <Actions
            links={[
              {
                id: "print",
                icon: "print",
                label: t("employerCost.action.print"),
                href: printHref,
              },
            ]}
            copyLink
          />
        </>
      )}
    </div>
  );
}
