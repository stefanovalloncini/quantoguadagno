import type { RegionText } from "@/components/form/regionText.ts";
import type { LedgerRow } from "@/components/result/Ledger.tsx";
import type { ComunaleRule } from "@/data/index.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { RichTranslateFn, TranslateFn } from "@/i18n/react.tsx";
import type { EmployeeResult } from "./compute.ts";
import { regionSummary } from "./derive.ts";
import { impatriatiBase, irpefBaseOf, type ImpatriatiBase } from "./impatriati.ts";
import { monthlyShares } from "./monthly.ts";
import type { ViewFormat } from "./viewFormat.tsx";

export type MunicipalMode = "comune" | "none" | "manual";

export interface LedgerContext {
  readonly result: EmployeeResult;
  readonly municipalMode: MunicipalMode;
  readonly t: TranslateFn;
  readonly rt: RichTranslateFn;
  readonly f: ViewFormat;
  readonly regions: RegionText;
}

export interface LedgerModel {
  readonly rows: readonly LedgerRow[];
  readonly total: LedgerRow;
}

type ChainId = "inps" | "irpef" | "regional" | "municipal" | "somma" | "trattamento" | "premio";

interface ChainEntry {
  readonly id: ChainId;
  readonly signed: number;
}

export function ratesOfRule(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

export function rangeText(rates: readonly number[], f: ViewFormat): string {
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  if (min === max) return f.percent(max);
  return `${f.percent(min).replace("%", "")}–${f.percent(max)}`;
}

function municipalRule(context: LedgerContext): string {
  const { result, t, f, municipalMode } = context;
  const { municipal } = result;
  if (municipal.kind === "manual") {
    const key =
      municipalMode === "manual"
        ? "employee.ledger.municipal.ruleManual"
        : "employee.ledger.municipal.ruleNone";
    return t(key, { rate: f.percent(municipal.rate) });
  }
  const rates = ratesOfRule(municipal.rule).map((rate) => rate / 100);
  const name = municipal.comune.name;
  if (Math.max(...rates) === 0) return t("employee.ledger.municipal.ruleZero", { name });
  const { breakdown: b } = result;
  const exemption = municipal.rule.exemption ?? 0;
  if (b.irpefNet <= 0) return t("employee.ledger.ruleNotDue", { name });
  if (exemption > 0 && b.municipalTax === 0 && irpefBaseOf(result) <= exemption) {
    return t("employee.ledger.ruleExempt", { name, amount: f.whole(exemption) });
  }
  return `${name}, ${rangeText(rates, f)}`;
}

function regionalRule(context: LedgerContext): string {
  const { result, t, f, regions } = context;
  const { breakdown: b, values } = result;
  const name = regions.name(values.regionCode);
  if (b.irpefNet <= 0) return t("employee.ledger.ruleNotDue", { name });
  const summary = regionSummary(values.regionCode, values.taxYear);
  const exemption = summary.exemptionThreshold;
  if (exemption !== null && b.regionalTax === 0 && irpefBaseOf(result) <= exemption) {
    return t("employee.ledger.ruleExempt", { name, amount: f.whole(exemption) });
  }
  return `${name}, ${rangeText(summary.rates, f)}`;
}

function monthlyOfAnnual(amount: number, count: number): number {
  return Math.round((amount * 100) / count) / 100;
}

function impatriatiRows(
  reduced: ImpatriatiBase,
  count: number,
  { t, f }: LedgerContext,
): readonly LedgerRow[] {
  return [
    {
      id: "impatriatiExempt",
      name: t("employee.ledger.impatriatiExempt", { rate: f.percent(reduced.exemptionRate) }),
      kind: "plain",
      rule: t("employee.ledger.impatriatiExempt.rule"),
      annual: f.money(-reduced.exempt),
      monthly: f.money(-monthlyOfAnnual(reduced.exempt, count)),
    },
    {
      id: "irpefBase",
      name: t("employee.ledger.irpefBase"),
      kind: "subtotal",
      rule: t("employee.ledger.irpefBase.rule"),
      annual: f.money(reduced.taxed),
      monthly: f.money(monthlyOfAnnual(reduced.taxed, count)),
    },
  ];
}

export function buildLedger(context: LedgerContext): LedgerModel {
  const { result, t, f } = context;
  const { breakdown: b, values } = result;
  const config = getTaxConfig(values.taxYear);
  const count = values.paymentFrequency;
  const fringeTaxable = b.fringeBenefits?.taxableAmount ?? 0;
  const adjusted = fringeTaxable > 0 || b.pensionFundDeduction > 0;
  const chain: ChainEntry[] = [
    { id: "inps", signed: -b.inpsContribution },
    { id: "irpef", signed: -b.irpefNet },
    { id: "regional", signed: -b.regionalTax },
    { id: "municipal", signed: -b.municipalTax },
    ...(b.sommaAggiuntiva > 0 ? [{ id: "somma" as const, signed: b.sommaAggiuntiva }] : []),
    ...(b.trattamentoIntegrativo > 0
      ? [{ id: "trattamento" as const, signed: b.trattamentoIntegrativo }]
      : []),
    ...(b.pdrNet > 0 ? [{ id: "premio" as const, signed: b.pdrNet }] : []),
  ];
  const monthly = monthlyShares(
    chain.map((entry) => entry.signed),
    count,
    b.netMonthly - b.grossMonthly,
  );
  const monthlyOf = (id: ChainId) => monthly[chain.findIndex((entry) => entry.id === id)] ?? 0;
  const amountText = (entry: ChainEntry) =>
    entry.signed > 0 ? f.signed(entry.signed) : f.money(entry.signed);
  const monthlyText = (entry: ChainEntry) => {
    const value = monthlyOf(entry.id);
    return value > 0 ? f.signed(value) : f.money(value);
  };
  const entry = (id: ChainId): ChainEntry =>
    chain.find((item) => item.id === id) ?? { id, signed: 0 };
  const cells = (id: ChainId) => ({
    annual: amountText(entry(id)),
    monthly: monthlyText(entry(id)),
  });
  const hasCredits = chain.some((item) => item.signed > 0);
  const taxableMonthly = adjusted
    ? Math.round((b.taxableIncome * 100) / count) / 100
    : b.grossMonthly + monthlyOf("inps");
  const standardRate = resolveInpsRates(config.inps, {
    contractType: values.contractType,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    override: values.inpsOverride ?? undefined,
  }).standardRate;
  const trattamento = config.trattamentoIntegrativo;
  const reduced = impatriatiBase(result);
  const irpefRule =
    reduced === null
      ? t("employee.ledger.irpef.rule")
      : reduced.wholeIncomeEligible
        ? t("employee.ledger.irpef.ruleImpatriati", { share: f.percent(1 - reduced.exemptionRate) })
        : t("employee.ledger.irpef.ruleImpatriatiCapped");

  const credits: LedgerRow[] = [
    ...(b.sommaAggiuntiva > 0
      ? [
          {
            id: "somma",
            name: t("employee.ledger.somma"),
            kind: "credited" as const,
            rule: t("employee.ledger.somma.rule"),
            ...cells("somma"),
          },
        ]
      : []),
    ...(b.trattamentoIntegrativo > 0
      ? [
          {
            id: "trattamento",
            name: t("employee.ledger.trattamento"),
            kind: "credited" as const,
            rule: t("employee.ledger.trattamento.rule", {
              max: f.whole(trattamento.maxAnnualBonus),
            }),
            ...cells("trattamento"),
          },
        ]
      : []),
    ...(b.pdrNet > 0
      ? [
          {
            id: "premio",
            name: t("employee.ledger.premio"),
            kind: "credited" as const,
            rule: t("employee.ledger.premio.rule"),
            ...cells("premio"),
          },
        ]
      : []),
  ];

  const rows: LedgerRow[] = [
    {
      id: "gross",
      name: t("employee.ledger.gross"),
      kind: "plain",
      rule: t("employee.ledger.gross.rule"),
      annual: f.money(b.grossAnnual),
      monthly: f.money(b.grossMonthly),
    },
    {
      id: "inps",
      name: t("employee.ledger.inps"),
      kind: "deducted",
      rule: t(
        b.inpsExemption + b.madreLavoratriceExemption > 0
          ? "employee.ledger.inps.ruleRelief"
          : "employee.ledger.inps.rule",
        { rate: f.percent(standardRate) },
      ),
      ...cells("inps"),
    },
    {
      id: "taxable",
      name: t("employee.ledger.taxable"),
      kind: "subtotal",
      rule: t(adjusted ? "employee.ledger.taxable.ruleAdjusted" : "employee.ledger.taxable.rule"),
      annual: f.money(b.taxableIncome),
      monthly: f.money(taxableMonthly),
    },
    ...(reduced === null ? [] : impatriatiRows(reduced, count, context)),
    {
      id: "irpef",
      name: t("employee.ledger.irpef"),
      kind: "deducted",
      rule: irpefRule,
      ...cells("irpef"),
    },
    {
      id: "regional",
      name: t("employee.ledger.regional"),
      kind: "deducted",
      rule: regionalRule(context),
      ...cells("regional"),
    },
    {
      id: "municipal",
      name: t("employee.ledger.municipal"),
      kind: "deducted",
      rule: municipalRule(context),
      ...cells("municipal"),
    },
    ...credits,
  ];

  const totalRule = adjusted
    ? t("employee.ledger.net.ruleAdjusted", { credits: hasCredits ? "yes" : "no" })
    : t(hasCredits ? "employee.ledger.net.ruleCredits" : "employee.ledger.net.rule");
  const total: LedgerRow = {
    id: "net",
    name: t("employee.ledger.net"),
    kind: "total",
    rule: totalRule,
    annual: f.money(b.netAnnual),
    monthly: f.money(b.netMonthly),
  };
  return { rows, total };
}
