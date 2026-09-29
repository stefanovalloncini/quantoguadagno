import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { Checkbox } from "@/components/form/Checkbox.tsx";
import type { RegionText } from "@/components/form/regionText.ts";
import { LedgerTable, type LedgerRow } from "@/components/result/Ledger.tsx";
import { getNaspiConfig, getTaxConfig, regionalRules } from "@/domain/index.ts";
import { useT, type TranslateFn } from "@/i18n/react.tsx";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import { MONTHS_IN_TAX_YEAR } from "./netEstimate.ts";
import { signedPercent, type NaspiOutcome } from "./outcome.ts";
import { IDS } from "./viewIds.ts";

export interface NaspiLedgersProps {
  readonly outcome: NaspiOutcome;
  readonly f: ViewFormat;
  readonly regions: RegionText;
  readonly explained: boolean;
  readonly onExplainedChange: (explained: boolean) => void;
}

export interface NaspiLedgerParts {
  readonly year: number;
  readonly period: string;
  readonly amountRows: readonly LedgerRow[];
  readonly amountTotal: LedgerRow;
  readonly netRows: readonly LedgerRow[];
  readonly netTotal: LedgerRow;
}

function regionalRates(outcome: NaspiOutcome, income: number): readonly number[] {
  const rules = regionalRules(outcome.facts.residence.region, outcome.facts.year);
  if (rules.flatRate !== undefined && income <= rules.flatRate.upToIncome) {
    return [rules.flatRate.rate];
  }
  const rates = rules.taxBrackets
    .filter((bracket, index) => index === 0 || bracket.min < income)
    .map((bracket) => bracket.rate);
  return [...new Set(rates)];
}

export function isFlatIrpef(outcome: NaspiOutcome): boolean {
  const { estimate } = outcome;
  if (estimate === null || estimate.otherIncome > 0) return false;
  const first = getTaxConfig(outcome.facts.year).irpefBrackets[0];
  return first !== undefined && (first.max ?? Infinity) >= estimate.naspiIncome;
}

export function isComuneExempt(outcome: NaspiOutcome): boolean {
  const comune = outcome.facts.residence.comune;
  const income = outcome.estimate?.withNaspi.income ?? 0;
  return comune?.rule.exemption !== undefined && income <= comune.rule.exemption;
}

export function naspiLedgerParts(
  outcome: NaspiOutcome,
  t: TranslateFn,
  f: ViewFormat,
  regions: RegionText,
): NaspiLedgerParts | null {
  const { facts, breakdown, estimate, schedule } = outcome;
  if (estimate === null || schedule === null) return null;
  const config = getNaspiConfig(facts.year);
  const year = facts.year;
  const reference = breakdown.referenceMonthlyPay;
  const months = schedule.months;
  const firstRule = breakdown.capped
    ? t("naspi.ledger.first.rule.capped", { year })
    : reference <= config.soglia
      ? t("naspi.ledger.first.rule.base")
      : t("naspi.ledger.first.rule.split", { threshold: f.money(config.soglia) });
  const firstBracket = getTaxConfig(year).irpefBrackets[0];
  const comune = facts.residence.comune;
  const totalIncome = estimate.withNaspi.income;
  const municipalRule =
    comune === null
      ? t("naspi.estimate.municipal.rule.rate", { rate: f.percent(facts.residence.flatRate) })
      : isComuneExempt(outcome) && comune.rule.exemption !== undefined
        ? t("naspi.estimate.municipal.rule.exempt", {
            comune: comune.name,
            amount: f.whole(comune.rule.exemption),
          })
        : t("naspi.estimate.municipal.rule.comune", {
            comune: comune.name,
            rate: comune.rule.rate === undefined ? "" : f.percent(comune.rule.rate / 100),
          });
  const firstYear = months > MONTHS_IN_TAX_YEAR;

  return {
    year,
    period: firstYear ? t("naspi.estimate.period.first") : t("naspi.estimate.period", { months }),
    amountRows: [
      {
        id: "reference",
        name: t("naspi.ledger.reference"),
        rule: t("naspi.ledger.reference.rule"),
        kind: "plain",
        annual: f.money(reference),
      },
      {
        id: "first",
        name: t("naspi.ledger.first"),
        rule: firstRule,
        kind: "plain",
        annual: f.money(breakdown.monthlyAmount),
      },
      {
        id: "duration",
        name: t("naspi.ledger.duration"),
        rule: t("naspi.ledger.duration.rule"),
        kind: "plain",
        annual: t("naspi.ledger.duration.value", { weeks: breakdown.durationWeeks }),
      },
      {
        id: "reduction",
        name: t("naspi.ledger.reduction"),
        rule: t("naspi.ledger.reduction.rule", { start: breakdown.decalageStartMonth }),
        kind: "plain",
        annual: t("naspi.ledger.reduction.value", {
          rate: signedPercent(-config.decalageRate, f.locale, 0),
        }),
      },
    ],
    amountTotal: {
      id: "total",
      name: t("naspi.ledger.total"),
      rule: t("naspi.ledger.total.rule", { months }),
      kind: "total",
      annual: f.money(schedule.grossTotal),
    },
    netRows: [
      {
        id: "gross",
        name: t("naspi.estimate.gross"),
        rule: firstYear
          ? t("naspi.estimate.gross.rule.first")
          : t("naspi.estimate.gross.rule", { months }),
        kind: "plain",
        annual: f.money(estimate.naspiIncome),
      },
      {
        id: "irpef",
        name: t("naspi.estimate.irpef"),
        rule:
          isFlatIrpef(outcome) && firstBracket !== undefined
            ? t("naspi.estimate.irpef.rule.flat", { rate: f.percent(firstBracket.rate) })
            : t("naspi.estimate.irpef.rule.bands"),
        kind: estimate.irpef > 0 ? "deducted" : "plain",
        annual: f.money(-estimate.irpef),
      },
      {
        id: "regional",
        name: t("naspi.estimate.regional"),
        rule: t("naspi.estimate.regional.rule", {
          region: regions.name(facts.residence.region),
          rates: f.list(regionalRates(outcome, totalIncome).map((rate) => f.percent(rate))),
        }),
        kind: estimate.regional > 0 ? "deducted" : "plain",
        annual: f.money(-estimate.regional),
      },
      {
        id: "municipal",
        name: t("naspi.estimate.municipal"),
        rule: municipalRule,
        kind: estimate.municipal > 0 ? "deducted" : "plain",
        annual: f.money(-estimate.municipal),
      },
    ],
    netTotal: {
      id: "net",
      name: t("naspi.estimate.net"),
      rule: t("naspi.estimate.net.rule", { share: signedPercent(estimate.share, f.locale, 2) }),
      kind: "total",
      annual: f.money(estimate.net),
    },
  };
}

export interface NaspiLedgerBlockProps {
  readonly parts: NaspiLedgerParts;
  readonly explained: boolean;
  readonly onExplainedChange: (explained: boolean) => void;
}

export function NaspiLedgerBlock({ parts, explained, onExplainedChange }: NaspiLedgerBlockProps) {
  const t = useT();
  return (
    <section className="qg-ledger-block" aria-labelledby={IDS.ledgerHeading}>
      <h2 className="qg-heading" id={IDS.ledgerHeading}>
        {t("naspi.ledger.title")}
      </h2>
      <Checkbox
        id={IDS.ledgerToggle}
        label={t("ledger.explain")}
        checked={explained}
        onCheckedChange={onExplainedChange}
      />
      <LedgerTable
        caption={t("naspi.ledger.caption", { year: parts.year })}
        columns={{ term: t("naspi.ledger.term"), annual: t("naspi.ledger.value") }}
        rows={parts.amountRows}
        total={parts.amountTotal}
        explained={explained}
      />
      <h3 className="qg-subheading" id={IDS.estimateHeading}>
        {t("naspi.estimate.title")}
      </h3>
      <LedgerTable
        caption={t("naspi.estimate.caption", { year: parts.year })}
        columns={{ term: t("naspi.ledger.term"), annual: parts.period }}
        rows={parts.netRows}
        total={parts.netTotal}
        explained={explained}
      />
    </section>
  );
}

const explainedLedgers = preloadable(() => import("./NaspiExplanations.tsx"));
const ExplainedLedgers = explainedLedgers.Component;

export const loadNaspiExplanations = explainedLedgers.load;

export function NaspiLedgers(props: NaspiLedgersProps) {
  const t = useT();
  const parts = naspiLedgerParts(props.outcome, t, props.f, props.regions);
  if (parts === null) return null;
  const plain = (
    <NaspiLedgerBlock
      parts={parts}
      explained={props.explained}
      onExplainedChange={props.onExplainedChange}
    />
  );
  if (!props.explained) return plain;
  return (
    <ClientSuspense fallback={plain}>
      <ExplainedLedgers {...props} parts={parts} />
    </ClientSuspense>
  );
}
