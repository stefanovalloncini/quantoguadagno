import type { ReactNode } from "react";
import type { RegionText } from "@/components/form/regionText.ts";
import { WorkedSum, type LedgerRow } from "@/components/result/Ledger.tsx";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { RichTranslateFn, TranslateFn } from "@/i18n/react.tsx";
import { regionSummary } from "@/islands/home/regionSummary.ts";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import { monthlyShares } from "@/islands/home/monthly.ts";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { InverseResult } from "./compute.ts";
import type { InverseLine, InverseLineId } from "./derive.ts";
import { rateRangeText, ratesOfRule } from "./rateText.ts";

export interface InverseLedgerContext {
  readonly result: InverseResult;
  readonly lines: readonly InverseLine[];
  readonly inpsRate: number;
  readonly municipalMode: MunicipalMode;
  readonly t: TranslateFn;
  readonly rt: RichTranslateFn;
  readonly f: ViewFormat;
  readonly regions: RegionText;
}

export interface InverseLedger {
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
}

const CHAIN: ReadonlySet<InverseLineId> = new Set([
  "inps",
  "irpef",
  "regional",
  "municipal",
  "sommaAggiuntiva",
  "trattamento",
]);

function paragraph(text: ReactNode): ReactNode {
  return <p>{text}</p>;
}

function regionalRule({ result, t, f, regions }: InverseLedgerContext): string {
  const { breakdown: b, values } = result;
  const name = regions.name(values.regionCode);
  if (b.irpefNet <= 0) return t("inverse.ledger.ruleNotDue", { name });
  const summary = regionSummary(values.regionCode, values.taxYear);
  const exemption = summary.exemptionThreshold;
  if (exemption !== null && b.regionalTax === 0 && b.taxableIncome <= exemption) {
    return t("inverse.ledger.ruleExempt", { name, amount: f.whole(exemption) });
  }
  return `${name}, ${rateRangeText(summary.rates, f)}`;
}

function municipalRule({ result, t, f, municipalMode }: InverseLedgerContext): string {
  const { municipal, breakdown: b } = result;
  if (municipal.kind === "manual") {
    const key =
      municipalMode === "manual"
        ? "inverse.ledger.municipal.ruleManual"
        : "inverse.ledger.municipal.ruleNone";
    return t(key, { rate: f.percent(municipal.rate) });
  }
  const rates = ratesOfRule(municipal.rule).map((rate) => rate / 100);
  const name = municipal.comune.name;
  if (Math.max(...rates) === 0) return t("inverse.ledger.municipal.ruleZero", { name });
  if (b.irpefNet <= 0) return t("inverse.ledger.ruleNotDue", { name });
  const exemption = municipal.rule.exemption ?? 0;
  if (exemption > 0 && b.municipalTax === 0 && b.taxableIncome <= exemption) {
    return t("inverse.ledger.ruleExempt", { name, amount: f.whole(exemption) });
  }
  return `${name}, ${rateRangeText(rates, f)}`;
}

export function buildInverseLedger(context: InverseLedgerContext): InverseLedger {
  const { result, lines, inpsRate, t, rt, f } = context;
  const { breakdown: b, values } = result;
  const config = getTaxConfig(values.taxYear);
  const count = values.paymentFrequency;
  const chain = lines.filter((line) => CHAIN.has(line.id));
  const signed = (line: InverseLine) => (line.kind === "credited" ? line.amount : -line.amount);
  const shares = monthlyShares(chain.map(signed), count, b.netMonthly - b.grossMonthly);
  const monthlyOf = (id: InverseLineId) => shares[chain.findIndex((line) => line.id === id)] ?? 0;
  const cells = (line: InverseLine) => {
    const annual = signed(line);
    const monthly = monthlyOf(line.id);
    return {
      annual: annual > 0 ? f.signed(annual) : f.money(annual),
      monthly: monthly > 0 ? f.signed(monthly) : f.money(monthly),
    };
  };
  const hasCredits = lines.some((line) => line.kind === "credited");
  const sommaMax = config.taxWedgeCut?.sommaAggiuntiva.at(-1)?.maxIncome ?? 0;
  const bonusMax = config.trattamentoIntegrativo.maxAnnualBonus;

  const rowOf = (line: InverseLine): LedgerRow => {
    switch (line.id) {
      case "gross":
        return {
          id: line.id,
          name: t("inverse.ledger.gross"),
          kind: line.kind,
          rule: t("inverse.ledger.gross.rule"),
          annual: f.money(b.grossAnnual),
          monthly: f.money(b.grossMonthly),
          explanation: paragraph(t("inverse.ledger.gross.explain")),
        };
      case "inps":
        return {
          id: line.id,
          name: t("inverse.ledger.inps"),
          kind: line.kind,
          rule: t("inverse.ledger.inps.rule", { rate: f.percent(inpsRate) }),
          ...cells(line),
          explanation: paragraph(t("inverse.ledger.inps.explain")),
        };
      case "taxable":
        return {
          id: line.id,
          name: t("inverse.ledger.taxable"),
          kind: line.kind,
          rule: t("inverse.ledger.taxable.rule"),
          annual: f.money(b.taxableIncome),
          monthly: f.money(b.grossMonthly + monthlyOf("inps")),
          explanation: paragraph(t("inverse.ledger.taxable.explain")),
        };
      case "irpef":
        return {
          id: line.id,
          name: t("inverse.ledger.irpef"),
          kind: line.kind,
          rule: t("inverse.ledger.irpef.rule"),
          ...cells(line),
          explanation: (
            <>
              {paragraph(t("inverse.ledger.irpef.explain"))}
              <WorkedSum
                rows={[
                  {
                    id: "gross",
                    label: t("inverse.ledger.irpef.gross"),
                    amount: f.money(b.irpefGross),
                  },
                  {
                    id: "deductions",
                    label: t("inverse.ledger.irpef.deductions"),
                    amount: f.money(b.irpefNet - b.irpefGross),
                  },
                ]}
                total={{ id: "net", label: t("inverse.ledger.irpef"), amount: f.money(b.irpefNet) }}
              />
            </>
          ),
        };
      case "regional":
        return {
          id: line.id,
          name: t("inverse.ledger.regional"),
          kind: line.kind,
          rule: regionalRule(context),
          ...cells(line),
          explanation: paragraph(t("inverse.ledger.regional.explain")),
        };
      case "municipal":
        return {
          id: line.id,
          name: t("inverse.ledger.municipal"),
          kind: line.kind,
          rule: municipalRule(context),
          ...cells(line),
          explanation: paragraph(t("inverse.ledger.municipal.explain")),
        };
      case "sommaAggiuntiva":
        return {
          id: line.id,
          name: t("inverse.ledger.somma"),
          kind: line.kind,
          rule: t("inverse.ledger.somma.rule"),
          ...cells(line),
          explanation: paragraph(
            rt("inverse.ledger.somma.explain", { max: <Amount>{f.whole(sommaMax)}</Amount> }),
          ),
        };
      case "trattamento":
        return {
          id: line.id,
          name: t("inverse.ledger.trattamento"),
          kind: line.kind,
          rule: t("inverse.ledger.trattamento.rule", { max: f.whole(bonusMax) }),
          ...cells(line),
          explanation: paragraph(
            rt("inverse.ledger.trattamento.explain", {
              max: <Amount>{f.whole(bonusMax)}</Amount>,
            }),
          ),
        };
      case "net":
        return {
          id: line.id,
          name: t("inverse.ledger.net"),
          kind: line.kind,
          rule: t(hasCredits ? "inverse.ledger.net.ruleCredits" : "inverse.ledger.net.rule"),
          annual: f.money(b.netAnnual),
          monthly: f.money(b.netMonthly),
          explanation: paragraph(
            rt("inverse.ledger.net.explain", {
              annual: <Amount>{f.money(b.netAnnual)}</Amount>,
              monthly: <Amount>{f.money(b.netMonthly)}</Amount>,
              count,
            }),
          ),
        };
    }
  };

  const rows = lines.filter((line) => line.kind !== "total").map(rowOf);
  const total = rowOf(
    lines.find((line) => line.kind === "total") ?? {
      id: "net",
      kind: "total",
      amount: b.netAnnual,
    },
  );
  return { rows, total };
}
