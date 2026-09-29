import { useState, type ReactNode, type Ref } from "react";
import type { RegionText } from "@/components/form/regionText.ts";
import { Actions } from "@/components/result/Actions.tsx";
import { Assumptions, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { Ledger } from "@/components/result/Ledger.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { FigureAside, ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { useRichT, useT } from "@/i18n/react.tsx";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { InverseResult as Result } from "./compute.ts";
import type { InverseDerived } from "./derive.ts";
import { buildInverseLedger } from "./inverseLedger.tsx";
import { NET_PAY_PREFIXES, TrustNote } from "./TrustNote.tsx";
import { IDS } from "./viewIds.ts";

export interface InverseLinks {
  readonly print: string;
  readonly employerCost: string;
}

export interface InverseAssumptionItem extends AssumptionItem {
  readonly group?: "contract";
}

export interface InverseResultProps {
  readonly result: Result | null;
  readonly derived: InverseDerived | null;
  readonly figureState: FigureState;
  readonly staleNote: ReactNode;
  readonly prompt: string;
  readonly municipalMode: MunicipalMode;
  readonly assumptions: readonly InverseAssumptionItem[];
  readonly links: InverseLinks;
  readonly announcement: string;
  readonly regions: RegionText;
  readonly f: ViewFormat;
  readonly valueRef: Ref<HTMLParagraphElement>;
  readonly onChange: (item: InverseAssumptionItem) => void;
}

export function InverseResult({
  result,
  derived,
  figureState,
  staleNote,
  prompt,
  municipalMode,
  assumptions,
  links,
  announcement,
  regions,
  f,
  valueRef,
  onChange,
}: InverseResultProps) {
  const t = useT();
  const rt = useRichT();
  const [explained, setExplained] = useState(false);
  const b = result?.breakdown;
  const count = result?.values.paymentFrequency ?? 13;
  const contract = derived?.assumptions.find((item) => item.id === "contract");
  const showDetail = result !== null && derived !== null && figureState !== "empty";
  const ledger =
    showDetail && contract?.id === "contract"
      ? buildInverseLedger({
          result,
          lines: derived.lines,
          inpsRate: contract.value.employeeInpsRate,
          municipalMode,
          t,
          rt,
          f,
          regions,
        })
      : null;

  return (
    <div className="qg-result">
      <div className="qg-result__summary">
        <ResultFigure
          headingId={IDS.resultHeading}
          label={t("inverse.result.label")}
          state={b === undefined ? "empty" : figureState}
          prompt={prompt}
          staleNote={staleNote}
          valueRef={valueRef}
          {...(result === null || b === undefined
            ? {}
            : {
                value: f.money(b.grossAnnual),
                basis: t("inverse.result.basis", {
                  amount: f.money(result.values.targetNetAnnual),
                }),
                sub: rt("inverse.result.monthly", {
                  amount: <strong>{f.money(b.grossMonthly)}</strong>,
                  count,
                }),
              })}
        />
      </div>
      <LiveStatus message={announcement} />
      {showDetail && ledger !== null && b !== undefined && (
        <>
          <FigureAside shown={figureState === "ready"}>
            {result.converged
              ? rt("inverse.result.net", {
                  annual: <Amount>{f.money(b.netAnnual)}</Amount>,
                  monthly: <Amount>{f.money(b.netMonthly)}</Amount>,
                  count,
                })
              : rt("inverse.result.notConverged", {
                  target: <Amount>{f.money(result.values.targetNetAnnual)}</Amount>,
                  annual: <Amount>{f.money(b.netAnnual)}</Amount>,
                })}
          </FigureAside>
          <Assumptions headingId={IDS.assumptionsHeading} items={assumptions} onChange={onChange} />
          <TrustNote
            ns="inverse"
            locale={f.locale}
            scope={{
              prefixes: NET_PAY_PREFIXES,
              region: result.values.regionCode,
              year: result.values.taxYear,
              withComune: result.values.comune !== null,
            }}
          />
          <Ledger
            headingId={IDS.ledgerHeading}
            toggleId={IDS.ledgerToggle}
            title={t("inverse.ledger.title")}
            caption={t("inverse.ledger.caption", { year: result.values.taxYear })}
            columns={{
              term: t("inverse.ledger.column.term"),
              monthly: t("inverse.ledger.column.monthly"),
              annual: t("inverse.ledger.column.annual"),
            }}
            rows={ledger.rows}
            total={ledger.total}
            explained={explained}
            onExplainedChange={setExplained}
          />
          <Actions
            links={[
              { id: "print", icon: "print", label: t("inverse.action.print"), href: links.print },
              {
                id: "employer",
                icon: "building",
                label: t("inverse.action.employerCost"),
                href: links.employerCost,
              },
            ]}
            copyLink
          />
        </>
      )}
    </div>
  );
}
