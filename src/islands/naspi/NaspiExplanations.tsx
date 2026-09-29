import type { ReactNode } from "react";
import { WorkedSum, type LedgerRow } from "@/components/result/Ledger.tsx";
import { getNaspiConfig, getTaxConfig } from "@/domain/index.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { Amount } from "@/islands/home/viewFormat.tsx";
import {
  isComuneExempt,
  isFlatIrpef,
  NaspiLedgerBlock,
  type NaspiLedgerParts,
  type NaspiLedgersProps,
} from "./NaspiLedgers.tsx";
import { MONTHS_IN_TAX_YEAR, roundedToTen } from "./netEstimate.ts";
import { signedPercent } from "./outcome.ts";

export interface NaspiExplanationsProps extends NaspiLedgersProps {
  readonly parts: NaspiLedgerParts;
}

function withExplanations(
  rows: readonly LedgerRow[],
  explanations: Readonly<Record<string, ReactNode>>,
): readonly LedgerRow[] {
  return rows.map((row) => ({ ...row, explanation: explanations[row.id] }));
}

export default function NaspiExplanations({
  outcome,
  f,
  regions,
  explained,
  onExplainedChange,
  parts,
}: NaspiExplanationsProps) {
  const t = useT();
  const rt = useRichT();
  const { facts, breakdown, estimate, schedule } = outcome;
  if (estimate === null || schedule === null) return null;
  const config = getNaspiConfig(facts.year);
  const year = facts.year;
  const money = (value: number) => <Amount>{f.money(value)}</Amount>;
  const reference = breakdown.referenceMonthlyPay;
  const months = schedule.months;
  const uncapped =
    reference <= config.soglia
      ? config.pctBase * reference
      : config.pctBase * config.soglia + config.pctMarginal * (reference - config.soglia);
  const first = breakdown.capped
    ? rt("naspi.ledger.first.explain.capped", {
        threshold: money(config.soglia),
        uncapped: money(uncapped),
        year,
        cap: money(config.massimale),
      })
    : reference <= config.soglia
      ? rt("naspi.ledger.first.explain.base", {
          reference: money(reference),
          threshold: money(config.soglia),
          year,
          cap: money(config.massimale),
        })
      : rt("naspi.ledger.first.explain.split", {
          threshold: money(config.soglia),
          base: money(config.pctBase * config.soglia),
          extra: money(config.pctMarginal * (reference - config.soglia)),
          year,
          cap: money(config.massimale),
        });

  const amountExplanations: Record<string, ReactNode> = {
    reference: (
      <p>
        {rt("naspi.ledger.reference.explain", { gross: money(facts.gross), weeks: facts.weeks })}
      </p>
    ),
    first: <p>{first}</p>,
    duration: (
      <p>
        {t("naspi.ledger.duration.explain", {
          weeks: facts.weeks,
          duration: breakdown.durationWeeks,
          months,
          capped: breakdown.durationWeeks >= config.maxDurationWeeks ? "yes" : "no",
        })}
      </p>
    ),
    reduction: (
      <p>
        {breakdown.durationMonths >= breakdown.decalageStartMonth
          ? t("naspi.ledger.reduction.explain", {
              start: breakdown.decalageStartMonth,
              rate: f.percent(config.decalageRate),
            })
          : t("naspi.ledger.reduction.none")}
      </p>
    ),
    total: <p>{t("naspi.ledger.total.explain", { months })}</p>,
  };

  const income = estimate.naspiIncome;
  const withOther = estimate.otherIncome > 0;
  const firstBracket = getTaxConfig(year).irpefBrackets[0];
  const comune = facts.residence.comune;
  const totalIncome = estimate.withNaspi.income;
  const localExplain = (own: ReactNode): ReactNode =>
    estimate.withNaspi.irpefNet <= 0
      ? t("naspi.estimate.local.none")
      : withOther
        ? rt("naspi.estimate.local.withOther", { total: money(totalIncome) })
        : own;
  const municipal =
    comune === null
      ? localExplain(
          t("naspi.estimate.municipal.explain.rate", {
            rate: f.percent(facts.residence.flatRate),
            article: f.article(facts.residence.flatRate),
          }),
        )
      : isComuneExempt(outcome)
        ? rt("naspi.estimate.municipal.explain.exempt", {
            income: money(totalIncome),
            comune: comune.name,
          })
        : localExplain(
            rt("naspi.estimate.municipal.explain.comune", {
              comune: comune.name,
              year,
              income: money(totalIncome),
            }),
          );
  const firstNet = schedule.rows[0]?.net ?? 0;
  const share = estimate.share;

  const netExplanations: Record<string, ReactNode> = {
    gross: (
      <p>
        {withOther
          ? rt("naspi.estimate.gross.other", { other: money(estimate.otherIncome), year })
          : t("naspi.estimate.gross.alone", { year })}
        {months > MONTHS_IN_TAX_YEAR && <> {t("naspi.estimate.gross.later")}</>}
      </p>
    ),
    irpef: (
      <>
        <p>{t("naspi.estimate.irpef.explain")}</p>
        {withOther ? (
          <WorkedSum
            rows={[
              {
                id: "with",
                label: rt("naspi.estimate.irpef.withOther", { income: money(totalIncome) }),
                amount: f.money(estimate.withNaspi.irpefNet),
              },
              {
                id: "without",
                label: t("naspi.estimate.irpef.otherOnly"),
                amount: f.money(-estimate.withoutNaspi.irpefNet),
              },
            ]}
            total={{
              id: "share",
              label: t("naspi.estimate.irpef.share"),
              amount: f.money(estimate.irpef),
            }}
          />
        ) : (
          <WorkedSum
            rows={[
              {
                id: "gross",
                label:
                  isFlatIrpef(outcome) && firstBracket !== undefined
                    ? rt("naspi.estimate.irpef.gross.flat", {
                        rate: f.percent(firstBracket.rate),
                        income: money(income),
                      })
                    : rt("naspi.estimate.irpef.gross.bands", { income: money(income) }),
                amount: f.money(estimate.withNaspi.irpefGross),
              },
              {
                id: "deduction",
                label: t("naspi.estimate.irpef.deduction"),
                amount: f.money(-estimate.withNaspi.workDeduction),
              },
            ]}
            total={{
              id: "net",
              label: t("naspi.estimate.irpef.net"),
              amount: f.money(estimate.irpef),
            }}
          />
        )}
      </>
    ),
    regional: (
      <p>
        {localExplain(
          rt("naspi.estimate.regional.explain", {
            regionOf: regions.of(facts.residence.region),
            year,
            income: money(income),
          }),
        )}
      </p>
    ),
    municipal: <p>{municipal}</p>,
    net: (
      <p>
        {rt("naspi.estimate.net.explain", {
          months: Math.max(1, Math.min(breakdown.decalageStartMonth - 1, months)),
          amount: money(breakdown.monthlyAmount),
          article: f.article(share),
          share: <Amount>{signedPercent(share, f.locale, 2)}</Amount>,
          net: money(firstNet),
          rounded: <Amount>{f.whole(roundedToTen(firstNet))}</Amount>,
        })}
      </p>
    ),
  };

  return (
    <NaspiLedgerBlock
      parts={{
        ...parts,
        amountRows: withExplanations(parts.amountRows, amountExplanations),
        amountTotal: { ...parts.amountTotal, explanation: amountExplanations.total },
        netRows: withExplanations(parts.netRows, netExplanations),
        netTotal: { ...parts.netTotal, explanation: netExplanations.net },
      }}
      explained={explained}
      onExplainedChange={onExplainedChange}
    />
  );
}
