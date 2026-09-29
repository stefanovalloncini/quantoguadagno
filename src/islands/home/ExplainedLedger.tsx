import type { ReactNode } from "react";
import {
  Ledger,
  WorkedSum,
  type LedgerProps,
  type WorkedSumRow,
} from "@/components/result/Ledger.tsx";
import type { Bracket } from "@/data/index.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import { regionSummary } from "./derive.ts";
import { impatriatiBase, irpefBaseOf } from "./impatriati.ts";
import { ratesOfRule, type LedgerContext } from "./ledgerRows.tsx";
import { Amount } from "./viewFormat.tsx";

function paragraphs(...texts: readonly ReactNode[]): ReactNode {
  return texts.map((text, index) => <p key={index}>{text}</p>);
}

function bandsText(brackets: readonly Bracket[], income: number, { t, f }: LedgerContext): string {
  const reached = brackets.filter((bracket, index) => index === 0 || income > bracket.min);
  return reached
    .map((bracket, index) => {
      const rate = f.percent(bracket.rate);
      if (index === reached.length - 1)
        return index === 0 ? rate : t("employee.ledger.irpef.bandAbove", { rate });
      return t("employee.ledger.irpef.bandUpTo", { rate, max: f.whole(bracket.max ?? 0) });
    })
    .join(", ");
}

function inpsExplanation(context: LedgerContext): ReactNode {
  const { result, rt, t, f } = context;
  const { breakdown: b, values } = result;
  const config = getTaxConfig(values.taxYear).inps;
  const rates = resolveInpsRates(config, {
    contractType: values.contractType,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    override: values.inpsOverride ?? undefined,
  });
  const text = rt("employee.ledger.inps.explain", {
    article: f.article(rates.standardRate),
    rate: <Amount>{f.percent(rates.standardRate)}</Amount>,
    above: rates.aboveCeilingRate === rates.standardRate ? "no" : "yes",
    aboveArticle: f.article(rates.aboveCeilingRate),
    aboveRate: <Amount>{f.percent(rates.aboveCeilingRate)}</Amount>,
    ceiling: <Amount>{f.whole(config.ceiling)}</Amount>,
  });
  const overCeiling = !values.insuredBefore1996 && b.grossAnnual > config.massimale;
  const massimale = overCeiling
    ? rt("employee.ledger.inps.massimale", {
        massimale: <Amount>{f.whole(config.massimale)}</Amount>,
      })
    : null;
  const relief = b.inpsExemption + b.madreLavoratriceExemption;
  if (relief <= 0) return paragraphs(text, ...(massimale === null ? [] : [massimale]));
  const rows: WorkedSumRow[] = [
    {
      id: "base",
      label: t("employee.ledger.inps.base", { rate: f.percent(rates.standardRate) }),
      amount: f.money(b.inpsContribution + relief),
    },
    ...(b.inpsExemption > 0
      ? [
          {
            id: "exemption",
            label: t("employee.ledger.inps.exemption2024"),
            amount: f.money(-b.inpsExemption),
          },
        ]
      : []),
    ...(b.madreLavoratriceExemption > 0
      ? [
          {
            id: "madre",
            label: t("employee.ledger.inps.madre"),
            amount: f.money(-b.madreLavoratriceExemption),
          },
        ]
      : []),
  ];
  return (
    <>
      {paragraphs(text)}
      <WorkedSum
        rows={rows}
        total={{
          id: "total",
          label: t("employee.ledger.inps"),
          amount: f.money(b.inpsContribution),
        }}
      />
      {massimale !== null && <p>{massimale}</p>}
    </>
  );
}

function taxableExplanation(context: LedgerContext, fringeTaxable: number): ReactNode {
  const { result, t, f } = context;
  const b = result.breakdown;
  if (fringeTaxable <= 0 && b.pensionFundDeduction <= 0) {
    return paragraphs(t("employee.ledger.taxable.explain"));
  }
  const rows: WorkedSumRow[] = [
    { id: "gross", label: t("employee.ledger.gross"), amount: f.money(b.grossAnnual) },
    { id: "inps", label: t("employee.ledger.inps"), amount: f.money(-b.inpsContribution) },
    ...(fringeTaxable > 0
      ? [
          {
            id: "benefits",
            label: t("employee.ledger.taxable.benefits"),
            amount: f.signed(fringeTaxable),
          },
        ]
      : []),
    ...(b.pensionFundDeduction > 0
      ? [
          {
            id: "pension",
            label: t("employee.ledger.taxable.pensionFund"),
            amount: f.money(-b.pensionFundDeduction),
          },
        ]
      : []),
  ];
  return (
    <>
      {paragraphs(t("employee.ledger.taxable.explainAdjusted"))}
      <WorkedSum
        rows={rows}
        total={{
          id: "total",
          label: t("employee.ledger.taxable"),
          amount: f.money(b.taxableIncome),
        }}
      />
    </>
  );
}

function impatriatiExplanation(context: LedgerContext): ReactNode {
  const { result, rt, f } = context;
  const reduced = impatriatiBase(result);
  if (reduced === null) return undefined;
  return paragraphs(
    rt("employee.ledger.impatriatiExempt.explain", {
      rate: <Amount>{f.percent(reduced.exemptionRate)}</Amount>,
      max: <Amount>{f.whole(reduced.maxEligibleIncome)}</Amount>,
    }),
  );
}

function irpefExplanation(context: LedgerContext): ReactNode {
  const { result, t, rt, f } = context;
  const { breakdown: b, values } = result;
  const config = getTaxConfig(values.taxYear);
  const taxedIncome = irpefBaseOf(result);
  const deductions: WorkedSumRow[] = [
    { id: "work", label: t("employee.ledger.irpef.work"), amount: f.money(-b.irpefDeduction) },
    ...(b.dependentsDeduction > 0
      ? [
          {
            id: "dependents",
            label: t("employee.ledger.irpef.dependents"),
            amount: f.money(-b.dependentsDeduction),
          },
        ]
      : []),
    ...(b.expenseDeduction > 0
      ? [
          {
            id: "expenses",
            label: t("employee.ledger.irpef.expenses"),
            amount: f.money(-b.expenseDeduction),
          },
        ]
      : []),
    ...(b.detrazioneAggiuntiva > 0
      ? [
          {
            id: "wedge",
            label: t("employee.ledger.irpef.wedge"),
            amount: f.money(-b.detrazioneAggiuntiva),
          },
        ]
      : []),
  ];
  const rows: WorkedSumRow[] = [
    {
      id: "gross",
      label: t("employee.ledger.irpef.gross", {
        bands: bandsText(config.irpefBrackets, taxedIncome, context),
      }),
      amount: f.money(b.irpefGross),
    },
    ...deductions,
  ];
  const wedge = config.taxWedgeCut?.detrazioneAggiuntiva;
  const notes: ReactNode[] = [];
  if (b.irpefGross - b.totalDeductions < -0.005) notes.push(t("employee.ledger.irpef.incapiente"));
  if (wedge !== undefined && b.detrazioneAggiuntiva > 0) {
    notes.push(
      rt("employee.ledger.irpef.wedgeNote", {
        max: <Amount>{f.whole(wedge.maxDeduction)}</Amount>,
        full: <Amount>{f.whole(wedge.fullDeductionThreshold)}</Amount>,
        end: <Amount>{f.whole(wedge.phaseOutEnd)}</Amount>,
        whole: b.detrazioneAggiuntiva >= wedge.maxDeduction - 0.005 ? "yes" : "no",
        amount: <Amount>{f.money(b.detrazioneAggiuntiva)}</Amount>,
      }),
    );
  }
  if (b.regimeImpatriatiSavings > 0) {
    notes.push(
      rt("employee.ledger.irpef.impatriati", {
        amount: <Amount>{f.money(b.regimeImpatriatiSavings)}</Amount>,
      }),
    );
  }
  return (
    <>
      {paragraphs(t("employee.ledger.irpef.explain"))}
      <WorkedSum
        rows={rows}
        total={{ id: "total", label: t("employee.ledger.irpef"), amount: f.money(b.irpefNet) }}
      />
      {paragraphs(...notes)}
    </>
  );
}

function regionalExplanation(context: LedgerContext): ReactNode {
  const { result, t, rt, f, regions } = context;
  const { breakdown: b, values } = result;
  if (b.irpefNet <= 0)
    return paragraphs(t("employee.ledger.regional.explain"), t("employee.ledger.surchargesNotDue"));
  const summary = regionSummary(values.regionCode, values.taxYear);
  const regionIn = f.capitalize(regions.within(values.regionCode));
  const shape =
    summary.minRate === summary.maxRate
      ? rt("employee.ledger.regional.single", {
          regionIn,
          article: f.article(summary.maxRate),
          rate: <Amount>{f.percent(summary.maxRate)}</Amount>,
        })
      : rt("employee.ledger.regional.range", {
          regionIn,
          fromArticle: f.article(summary.minRate),
          min: <Amount>{f.percent(summary.minRate)}</Amount>,
          toArticle: f.article(summary.maxRate),
          max: <Amount>{f.percent(summary.maxRate)}</Amount>,
        });
  const extras: ReactNode[] = [];
  if (summary.exemptionThreshold !== null) {
    extras.push(
      rt("employee.ledger.regional.exempt", {
        amount: <Amount>{f.whole(summary.exemptionThreshold)}</Amount>,
      }),
    );
  }
  if (summary.flatRate !== null) {
    extras.push(
      rt("employee.ledger.regional.flat", {
        limit: <Amount>{f.whole(summary.flatRate.upToIncome)}</Amount>,
        article: f.article(summary.flatRate.rate),
        rate: <Amount>{f.percent(summary.flatRate.rate)}</Amount>,
      }),
    );
  }
  if (summary.deductions.length > 0) extras.push(t("employee.ledger.regional.deductions"));
  return paragraphs(
    <>
      {t("employee.ledger.regional.explain")} {shape}
    </>,
    ...extras,
  );
}

function municipalExplanation(context: LedgerContext): ReactNode {
  const { result, t, rt, f, municipalMode } = context;
  const { breakdown: b, municipal } = result;
  const lead = t("employee.ledger.municipal.explain");
  if (b.irpefNet <= 0) return paragraphs(lead, t("employee.ledger.surchargesNotDue"));
  if (municipal.kind === "manual") {
    const key =
      municipalMode === "manual"
        ? "employee.ledger.municipal.manual"
        : "employee.ledger.municipal.none";
    return paragraphs(
      <>
        {lead}{" "}
        {rt(key, {
          article: f.article(municipal.rate),
          rate: <Amount>{f.percent(municipal.rate)}</Amount>,
        })}
      </>,
    );
  }
  const rates = ratesOfRule(municipal.rule).map((rate) => rate / 100);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const exemption = municipal.rule.exemption ?? 0;
  const name = municipal.comune.name;
  const exemptValues = {
    exempt: exemption > 0 ? "yes" : "no",
    amount: <Amount>{f.whole(exemption)}</Amount>,
  };
  const shape =
    max === 0
      ? t("employee.ledger.municipal.zero", { name })
      : min === max
        ? rt("employee.ledger.municipal.flat", {
            name,
            article: f.article(max),
            rate: <Amount>{f.percent(max)}</Amount>,
            ...exemptValues,
          })
        : rt("employee.ledger.municipal.range", {
            name,
            fromArticle: f.article(min),
            min: <Amount>{f.percent(min)}</Amount>,
            toArticle: f.article(max),
            max: <Amount>{f.percent(max)}</Amount>,
            ...exemptValues,
          });
  const under =
    max > 0 && exemption > 0 && b.municipalTax === 0 && irpefBaseOf(result) <= exemption;
  return paragraphs(
    <>
      {lead} {shape}
    </>,
    ...(under ? [t("employee.ledger.municipal.underThreshold")] : []),
  );
}

function creditExplanations(context: LedgerContext): Readonly<Record<string, ReactNode>> {
  const { result, t, rt, f } = context;
  const { breakdown: b, values } = result;
  const config = getTaxConfig(values.taxYear);
  const sommaMax = config.taxWedgeCut?.sommaAggiuntiva.at(-1)?.maxIncome ?? 0;
  const trattamento = config.trattamentoIntegrativo;
  return {
    somma: paragraphs(
      rt("employee.ledger.somma.explain", { max: <Amount>{f.whole(sommaMax)}</Amount> }),
    ),
    trattamento: paragraphs(
      rt("employee.ledger.trattamento.explain", {
        max: <Amount>{f.whole(trattamento.maxAnnualBonus)}</Amount>,
        full: <Amount>{f.whole(trattamento.fullBonusThreshold)}</Amount>,
        partial: <Amount>{f.whole(trattamento.partialBonusThreshold)}</Amount>,
      }),
    ),
    premio: (
      <>
        {paragraphs(t("employee.ledger.premio.explain"))}
        <WorkedSum
          rows={[
            { id: "gross", label: t("employee.ledger.premio.gross"), amount: f.money(b.pdrGross) },
            { id: "inps", label: t("employee.ledger.premio.inps"), amount: f.money(-b.pdrInps) },
            {
              id: "tax",
              label: t("employee.ledger.premio.tax", {
                rate: f.percent(config.pdrSostitutiva.rate),
              }),
              amount: f.money(-b.pdrTax),
            },
          ]}
          total={{ id: "net", label: t("employee.ledger.premio.net"), amount: f.money(b.pdrNet) }}
        />
      </>
    ),
  };
}

export function explanationsFor(context: LedgerContext): Readonly<Record<string, ReactNode>> {
  const { result, t, rt, f } = context;
  const b = result.breakdown;
  return {
    gross: paragraphs(t("employee.ledger.gross.explain")),
    inps: inpsExplanation(context),
    taxable: taxableExplanation(context, b.fringeBenefits?.taxableAmount ?? 0),
    impatriatiExempt: impatriatiExplanation(context),
    irpef: irpefExplanation(context),
    regional: regionalExplanation(context),
    municipal: municipalExplanation(context),
    ...creditExplanations(context),
    net: paragraphs(
      rt("employee.ledger.net.explain", {
        annual: <Amount>{f.money(b.netAnnual)}</Amount>,
        monthly: <Amount>{f.money(b.netMonthly)}</Amount>,
        count: result.values.paymentFrequency,
      }),
    ),
  };
}

export interface ExplainedLedgerProps extends LedgerProps {
  readonly context: LedgerContext;
}

export default function ExplainedLedger({ context, rows, total, ...ledger }: ExplainedLedgerProps) {
  const explanations = explanationsFor(context);
  return (
    <Ledger
      {...ledger}
      rows={rows.map((row) => ({ ...row, explanation: explanations[row.id] }))}
      total={{ ...total, explanation: explanations[total.id] }}
    />
  );
}
