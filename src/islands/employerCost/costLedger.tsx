import type { ReactNode } from "react";
import { WorkedSum, type LedgerRow } from "@/components/result/Ledger.tsx";
import type { OtherEmployerCostsConfig, SupportedYear } from "@/data/index.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { RichTranslateFn, TranslateFn } from "@/i18n/react.tsx";
import type { EmployerCostBreakdown, EmployerCostLineId } from "@/islands/home/derive.ts";
import { monthlyShares } from "@/islands/home/monthly.ts";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { EmployerCostLedger } from "./derive.ts";

const MONTHS = 12;

const OTHER_RATE: Readonly<Record<EmployerCostLineId, keyof OtherEmployerCostsConfig>> = {
  inail: "inailRate",
  maternity: "maternityRate",
  naspi: "naspiRate",
  naspiAdditional: "naspiAdditionalDeterminatoRate",
  cig: "cigRate",
  other: "otherRate",
};

export interface CostLedgerContext {
  readonly ledger: EmployerCostLedger;
  readonly cost: EmployerCostBreakdown;
  readonly year: SupportedYear;
  readonly t: TranslateFn;
  readonly rt: RichTranslateFn;
  readonly f: ViewFormat;
}

export interface CostLedger {
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
}

function paragraph(text: ReactNode): ReactNode {
  return <p>{text}</p>;
}

export function buildCostLedger({ ledger, cost, year, t, rt, f }: CostLedgerContext): CostLedger {
  const rates = getTaxConfig(year).otherEmployerCosts;
  const [gross = 0, inps = 0, tfr = 0, others = 0] = monthlyShares(
    [ledger.gross, ledger.inps, ledger.tfr, ledger.othersTotal],
    MONTHS,
    ledger.totalMonthly,
  );
  const rows: LedgerRow[] = [
    {
      id: "gross",
      name: t("employerCost.ledger.gross"),
      kind: "plain",
      rule: t("employerCost.ledger.gross.rule"),
      annual: f.money(ledger.gross),
      monthly: f.money(gross),
      explanation: paragraph(t("employerCost.ledger.gross.explain")),
    },
    {
      id: "inps",
      name: t("employerCost.ledger.inps"),
      kind: "plain",
      rule: t("employerCost.ledger.inps.rule", { rate: f.percent(cost.employerInpsRate) }),
      annual: f.money(ledger.inps),
      monthly: f.money(inps),
      explanation: paragraph(t("employerCost.ledger.inps.explain")),
    },
    {
      id: "tfr",
      name: t("employerCost.ledger.tfr"),
      kind: "plain",
      rule: t("employerCost.ledger.tfr.rule", { rate: f.percent(cost.tfrRate) }),
      annual: f.money(ledger.tfr),
      monthly: f.money(tfr),
      explanation: paragraph(t("employerCost.ledger.tfr.explain")),
    },
    {
      id: "other",
      name: t("employerCost.ledger.other"),
      kind: "plain",
      rule: t("employerCost.ledger.other.rule"),
      annual: f.money(ledger.othersTotal),
      monthly: f.money(others),
      explanation: (
        <>
          {paragraph(t("employerCost.ledger.other.explain"))}
          <WorkedSum
            rows={ledger.others.map((line) => ({
              id: line.id,
              label: t(`employerCost.ledger.other.${line.id}`, {
                rate: f.percent(rates[OTHER_RATE[line.id]]),
              }),
              amount: f.money(line.amount),
            }))}
            total={{
              id: "total",
              label: t("employerCost.ledger.other"),
              amount: f.money(ledger.othersTotal),
            }}
          />
        </>
      ),
    },
  ];
  const total: LedgerRow = {
    id: "total",
    name: t("employerCost.ledger.total"),
    kind: "total",
    rule: t("employerCost.ledger.total.rule"),
    annual: f.money(ledger.total),
    monthly: f.money(ledger.totalMonthly),
    explanation: paragraph(
      rt("employerCost.ledger.total.explain", {
        annual: <Amount>{f.money(ledger.total)}</Amount>,
        monthly: <Amount>{f.money(ledger.totalMonthly)}</Amount>,
      }),
    ),
  };
  return { rows, total };
}
