import type { ReactNode } from "react";
import type { RegionText } from "@/components/form/regionText.ts";
import { WorkedSum, type LedgerRow } from "@/components/result/Ledger.tsx";
import type { Bracket, ComunaleRule } from "@/data/index.ts";
import { getAutonomiConfig, getTaxConfig } from "@/domain/taxConfig.ts";
import type { RichTranslateFn, TranslateFn } from "@/i18n/react.tsx";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import { regionSummary } from "@/islands/home/regionSummary.ts";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import type { OrdinarioResult } from "./compute.ts";

export interface LedgerContext {
  readonly result: OrdinarioResult;
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

function paragraphs(...texts: readonly ReactNode[]): ReactNode {
  return texts.map((text, index) => <p key={index}>{text}</p>);
}

function ratesOfRule(rule: ComunaleRule): readonly number[] {
  return rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
}

function rangeText(rates: readonly number[], f: ViewFormat): string {
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  if (min === max) return f.percent(max);
  return `${f.percent(min).replace("%", "")}–${f.percent(max)}`;
}

function bandsText(brackets: readonly Bracket[], income: number, { t, f }: LedgerContext): string {
  const reached = brackets.filter((bracket, index) => index === 0 || income > bracket.min);
  return reached
    .map((bracket, index) => {
      const rate = f.percent(bracket.rate);
      if (index === reached.length - 1) {
        return index === 0 ? rate : t("ordinario.ledger.irpef.bandAbove", { rate });
      }
      return t("ordinario.ledger.irpef.bandUpTo", { rate, max: f.whole(bracket.max ?? 0) });
    })
    .join(", ");
}

function contributionRow(context: LedgerContext): LedgerRow {
  const { result, t, rt, f } = context;
  const { breakdown: b, values } = result;
  const autonomi = getAutonomiConfig(values.taxYear);
  const base = {
    id: "contributions",
    name: t(`ordinario.ledger.contributions.${values.gestion}`),
    kind: "deducted" as const,
    annual: f.money(-b.contributions),
  };
  if (values.gestion === "gestione-separata") {
    const { massimale } = autonomi.gestionSeparata;
    const rate = f.percent(b.contributionRate);
    return {
      ...base,
      rule: t(
        b.income > massimale
          ? "ordinario.ledger.contributions.capped"
          : "ordinario.ledger.contributions.rate",
        { rate },
      ),
      explanation: paragraphs(
        rt("ordinario.ledger.contributions.separata", {
          article: f.article(b.contributionRate),
          rate: <Amount>{rate}</Amount>,
          massimale: <Amount>{f.whole(massimale)}</Amount>,
        }),
        ...(values.hasOtherPension ? [t("ordinario.ledger.contributions.reduced")] : []),
      ),
    };
  }
  if (values.gestion === "cassa-professionale") {
    return {
      ...base,
      rule: t("ordinario.ledger.contributions.typed"),
      explanation: paragraphs(t("ordinario.ledger.contributions.cassa")),
    };
  }
  const g = autonomi[values.gestion];
  const minimale = f.whole(g.minimaleReddito);
  return {
    ...base,
    rule:
      b.income > g.minimaleReddito
        ? t("ordinario.ledger.contributions.overMinimum", { rate: f.percent(g.rate), minimale })
        : t("ordinario.ledger.contributions.minimum"),
    explanation: paragraphs(
      rt("ordinario.ledger.contributions.minimumExplain", {
        fixed: <Amount>{f.money(b.fixedContribution)}</Amount>,
        months: values.months,
        minimale: <Amount>{minimale}</Amount>,
      }),
      rt("ordinario.ledger.contributions.overExplain", {
        article: f.article(g.rate),
        rate: <Amount>{f.percent(g.rate)}</Amount>,
        band: <Amount>{f.whole(g.band1Ceiling)}</Amount>,
        higherArticle: f.article(g.rateOver1stBand),
        higherRate: <Amount>{f.percent(g.rateOver1stBand)}</Amount>,
        massimale: <Amount>{f.whole(g.massimale)}</Amount>,
      }),
    ),
  };
}

function irpefRow(context: LedgerContext): LedgerRow {
  const { result, t, rt, f } = context;
  const { breakdown: b, values } = result;
  const brackets = getTaxConfig(values.taxYear).irpefBrackets;
  const rule =
    b.irpefGross === 0
      ? t("ordinario.ledger.irpef.ruleZero")
      : b.deductionUsed > 0
        ? t("ordinario.ledger.irpef.rule", {
            gross: f.money(b.irpefGross),
            deduction: f.money(b.deductionUsed),
          })
        : t("ordinario.ledger.irpef.ruleNoDeduction");
  const lost = b.deductionDue - b.deductionUsed > 0.005;
  return {
    id: "irpef",
    name: t("ordinario.ledger.irpef"),
    kind: "deducted",
    rule,
    annual: f.money(-b.irpefNet),
    explanation: (
      <>
        {paragraphs(
          rt("ordinario.ledger.irpef.explain", {
            income: <Amount>{f.money(Math.max(0, b.income))}</Amount>,
          }),
        )}
        <WorkedSum
          rows={[
            {
              id: "gross",
              label: t("ordinario.ledger.irpef.gross", {
                bands: bandsText(brackets, b.taxableIncome, context),
              }),
              amount: f.money(b.irpefGross),
            },
            {
              id: "deduction",
              label: t("ordinario.ledger.irpef.deduction"),
              amount: f.money(-b.deductionUsed),
            },
          ]}
          total={{ id: "net", label: t("ordinario.ledger.irpef"), amount: f.money(b.irpefNet) }}
        />
        {lost &&
          paragraphs(
            rt("ordinario.ledger.irpef.lost", {
              due: <Amount>{f.money(b.deductionDue)}</Amount>,
            }),
          )}
      </>
    ),
  };
}

function regionalRow(context: LedgerContext): LedgerRow {
  const { result, t, f, regions } = context;
  const { breakdown: b, values } = result;
  const name = regions.name(values.regionCode);
  const summary = regionSummary(values.regionCode, values.taxYear);
  const exemption = summary.exemptionThreshold;
  const exempt = exemption !== null && b.regionalTax === 0 && b.taxableIncome <= exemption;
  const rule =
    b.irpefNet <= 0
      ? t("ordinario.ledger.notDue", { name })
      : exempt
        ? t("ordinario.ledger.exempt", { name, amount: f.whole(exemption) })
        : `${name}, ${rangeText(summary.rates, f)}`;
  return {
    id: "regional",
    name: t("ordinario.ledger.regional"),
    kind: "deducted",
    rule,
    annual: f.money(-b.regionalTax),
    explanation: paragraphs(
      t("ordinario.ledger.regional.explain"),
      ...(b.irpefNet <= 0 ? [t("ordinario.ledger.surchargesNotDue")] : []),
    ),
  };
}

function municipalRule(context: LedgerContext): string {
  const { result, t, f, municipalMode } = context;
  const { breakdown: b, municipal } = result;
  if (municipal.kind === "manual") {
    const key =
      municipalMode === "manual"
        ? "ordinario.ledger.municipal.manual"
        : "ordinario.ledger.municipal.none";
    return t(key, { rate: f.percent(municipal.rate) });
  }
  const name = municipal.comune.name;
  const rates = ratesOfRule(municipal.rule).map((rate) => rate / 100);
  if (Math.max(...rates) === 0) return t("ordinario.ledger.municipal.zero", { name });
  if (b.irpefNet <= 0) return t("ordinario.ledger.notDue", { name });
  const exemption = municipal.rule.exemption ?? 0;
  if (exemption > 0 && b.municipalTax === 0 && b.taxableIncome <= exemption) {
    return t("ordinario.ledger.exempt", { name, amount: f.whole(exemption) });
  }
  return `${name}, ${rangeText(rates, f)}`;
}

function municipalRow(context: LedgerContext): LedgerRow {
  const { result, t } = context;
  const { breakdown: b } = result;
  return {
    id: "municipal",
    name: t("ordinario.ledger.municipal"),
    kind: "deducted",
    rule: municipalRule(context),
    annual: context.f.money(-b.municipalTax),
    explanation: paragraphs(
      t("ordinario.ledger.municipal.explain"),
      ...(b.irpefNet <= 0 ? [t("ordinario.ledger.surchargesNotDue")] : []),
    ),
  };
}

export function buildOrdinarioLedger(context: LedgerContext): LedgerModel {
  const { result, t, rt, f } = context;
  const { breakdown: b } = result;
  const rows: LedgerRow[] = [
    {
      id: "revenue",
      name: t("ordinario.ledger.revenue"),
      kind: "plain",
      rule: t("ordinario.ledger.revenue.rule"),
      annual: f.money(b.revenue),
      explanation: paragraphs(t("ordinario.ledger.revenue.explain")),
    },
    {
      id: "costs",
      name: t("ordinario.ledger.costs"),
      kind: "deducted",
      annual: f.money(-b.costs),
      explanation: paragraphs(t("ordinario.ledger.costs.explain")),
    },
    {
      id: "income",
      name: t("ordinario.ledger.income"),
      kind: "subtotal",
      rule: t("ordinario.ledger.income.rule"),
      annual: f.money(b.income),
      explanation: paragraphs(
        t("ordinario.ledger.income.explain"),
        ...(b.income < 0 ? [t("ordinario.ledger.income.loss")] : []),
      ),
    },
    contributionRow(context),
    {
      id: "taxable",
      name: t("ordinario.ledger.taxable"),
      kind: "subtotal",
      rule: t("ordinario.ledger.taxable.rule"),
      annual: f.money(b.taxableIncome),
      explanation: paragraphs(
        t("ordinario.ledger.taxable.explain"),
        ...(b.taxableIncome === 0 ? [t("ordinario.ledger.taxable.zero")] : []),
      ),
    },
    irpefRow(context),
    regionalRow(context),
    municipalRow(context),
  ];
  const total: LedgerRow = {
    id: "net",
    name: t("ordinario.ledger.net"),
    kind: "total",
    rule: t("ordinario.ledger.net.rule"),
    annual: f.money(b.netAnnual),
    explanation: paragraphs(
      rt("ordinario.ledger.net.explain", {
        monthly: <Amount>{f.money(b.netMonthly)}</Amount>,
      }),
    ),
  };
  return { rows, total };
}
