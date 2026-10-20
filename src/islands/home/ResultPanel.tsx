import { useState, type ReactNode, type Ref } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import type { RegionText } from "@/components/form/regionText.ts";
import { Actions } from "@/components/result/Actions.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { Ledger, type LedgerProps } from "@/components/result/Ledger.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import type { VerifiedLine } from "@/components/result/verifiedLine.ts";
import { FigureAside, ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { splitSalaryYear } from "@/domain/tredicesima.ts";
import { formatPercent } from "@/i18n/numbers.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import type { EmployeeResult } from "./compute.ts";
import type { EmployeeLinks } from "./derive.ts";
import { buildLedger, type LedgerContext, type MunicipalMode } from "./ledgerRows.tsx";
import { Amount, type ViewFormat } from "./viewFormat.tsx";
import { IDS } from "./viewIds.ts";

const explainedLedger = preloadable(() => import("./ExplainedLedger.tsx"));

export const loadExplainedLedger = explainedLedger.load;

const ExplainedLedger = explainedLedger.Component;

interface LedgerSectionProps extends LedgerProps {
  readonly context: LedgerContext;
}

function LedgerSection({ context, ...ledger }: LedgerSectionProps) {
  if (!ledger.explained) return <Ledger {...ledger} />;
  return (
    <ClientSuspense fallback={<Ledger {...ledger} />}>
      <ExplainedLedger {...ledger} context={context} />
    </ClientSuspense>
  );
}

export interface ResultPanelProps {
  readonly result: EmployeeResult | null;
  readonly figureState: FigureState;
  readonly staleNote: ReactNode;
  readonly prompt: string;
  readonly municipalMode: MunicipalMode;
  readonly links: EmployeeLinks;
  readonly announcement: string;
  readonly verified: (VerifiedLine & { readonly pending: number }) | null;
  readonly regions: RegionText;
  readonly f: ViewFormat;
  readonly valueRef: Ref<HTMLParagraphElement>;
}

export function ResultPanel({
  result,
  figureState,
  staleNote,
  prompt,
  municipalMode,
  links,
  announcement,
  verified,
  regions,
  f,
  valueRef,
}: ResultPanelProps) {
  const t = useT();
  const rt = useRichT();
  const [explained, setExplained] = useState(false);
  const b = result?.breakdown;
  const count = result?.values.paymentFrequency ?? 13;
  const context =
    result !== null && figureState !== "empty"
      ? { result, municipalMode, t, rt, f, regions }
      : null;
  const ledger = context === null ? null : buildLedger(context);
  const credited = b === undefined ? 0 : b.sommaAggiuntiva + b.trattamentoIntegrativo;
  const split = result === null ? null : splitSalaryYear(result.input, result.breakdown);

  return (
    <div className="qg-result">
      <div className="qg-result__summary">
        <ResultFigure
          headingId={IDS.resultHeading}
          label={t("employee.result.label")}
          state={b === undefined ? "empty" : figureState}
          prompt={prompt}
          staleNote={staleNote}
          valueRef={valueRef}
          {...(b === undefined
            ? {}
            : {
                value: f.money(b.netMonthly),
                basis: t("employee.result.basis", { count }),
                subLines: [
                  ...(split === null
                    ? []
                    : [
                        rt("employee.result.split", {
                          ordinary: <strong>{f.money(split.ordinaryMonth)}</strong>,
                          extra: <strong>{f.money(split.extraMonth)}</strong>,
                          count: split.extraMonths,
                        }),
                      ]),
                  rt("employee.result.annual", {
                    amount: <strong>{f.money(b.netAnnual)}</strong>,
                  }),
                ],
              })}
        />
      </div>
      <LiveStatus message={announcement} />
      {context !== null && b !== undefined && ledger !== null && (
        <>
          {b.grossAnnual > 0 && (
            <FigureAside shown={figureState === "ready"}>
              {rt(credited > 0 ? "employee.result.withheldCredits" : "employee.result.withheld", {
                article: f.article(b.totalTaxes / b.grossAnnual),
                share: <Amount>{formatPercent(b.totalTaxes / b.grossAnnual, f.locale, 2)}</Amount>,
                amount: <Amount>{f.money(b.totalTaxes)}</Amount>,
                credits: <Amount>{f.money(credited)}</Amount>,
              })}
            </FigureAside>
          )}
          <NoteLine term={t("result.estimate.term")}>
            {t("employee.result.estimate")}
            {verified !== null && (
              <>
                {" "}
                {rt("employee.result.trust", {
                  checked: (
                    <a href={verified.href}>
                      {t("employee.result.verified", {
                        date: verified.date,
                        dateArticle: verified.dateArticle,
                      })}
                    </a>
                  ),
                  pending: verified.pending > 0 ? "yes" : "no",
                  count: verified.pending,
                })}
              </>
            )}
          </NoteLine>
          <LedgerSection
            context={context}
            explained={explained}
            onExplainedChange={setExplained}
            headingId={IDS.ledgerHeading}
            toggleId={IDS.ledgerToggle}
            title={t("employee.ledger.title")}
            caption={t("employee.ledger.caption", { year: context.result.values.taxYear })}
            columns={{
              term: t("employee.ledger.column.term"),
              monthly: t("employee.ledger.column.monthly"),
              annual: t("employee.ledger.column.annual"),
            }}
            rows={ledger.rows}
            total={ledger.total}
          />
          <Actions
            links={[
              { id: "print", icon: "print", label: t("employee.action.print"), href: links.print },
              {
                id: "employer",
                icon: "building",
                label: t("employee.action.employerCost"),
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
