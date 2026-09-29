import type { ReactNode, Ref } from "react";
import { radioId } from "@/components/form/RadioGroup.tsx";
import type { RegionText } from "@/components/form/regionText.ts";
import { Assumptions, NoteLine, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { LiveStatus } from "@/components/result/LiveStatus.tsx";
import { NextSteps, type NextStep } from "@/components/result/NextSteps.tsx";
import { ResultAnswer } from "@/components/result/ResultAnswer.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { getNaspiConfig, type NaspiIneligibilityReason } from "@/domain/index.ts";
import { useRichT, useT, type TranslateFn } from "@/i18n/react.tsx";
import { Amount, type ViewFormat } from "@/islands/home/viewFormat.tsx";
import { naspiIneligibilityMessageKey } from "./derive.ts";
import { NaspiLedgers } from "./NaspiLedgers.tsx";
import { roundedToTen } from "./netEstimate.ts";
import { fullAmountMonths, type NaspiOutcome } from "./outcome.ts";
import { IDS } from "./viewIds.ts";

export interface NaspiAssumption extends AssumptionItem {
  readonly inNetGroup: boolean;
}

export interface VerifiedLine {
  readonly date: string;
  readonly href: string;
  readonly pending: number;
}

export interface NaspiResultProps {
  readonly outcome: NaspiOutcome | null;
  readonly figureState: FigureState;
  readonly prompt: string;
  readonly staleNote: string;
  readonly announcement: string;
  readonly verified: VerifiedLine | null;
  readonly f: ViewFormat;
  readonly regions: RegionText;
  readonly explained: boolean;
  readonly onExplainedChange: (explained: boolean) => void;
  readonly valueRef: Ref<HTMLParagraphElement>;
  readonly onChange: (item: NaspiAssumption) => void;
}

const STEPS_BY_REASON: Readonly<Record<NaspiIneligibilityReason, readonly string[]>> = {
  "insufficient-weeks": ["naspi.check.statement", "naspi.check.period"],
  "voluntary-resignation-lockout": ["naspi.check.afterResignation", "naspi.check.statement"],
};

export function nextStepsFor(reasons: readonly NaspiIneligibilityReason[]): readonly string[] {
  return [...new Set(reasons.flatMap((reason) => STEPS_BY_REASON[reason]))];
}

export function reasonLines(
  outcome: NaspiOutcome,
  minWeeks: number,
  t: TranslateFn,
): readonly string[] {
  return outcome.breakdown.reasons.map((reason) =>
    t(naspiIneligibilityMessageKey(reason), {
      min: minWeeks,
      weeks: reason === "insufficient-weeks" ? outcome.facts.weeks : outcome.facts.weeksAfter,
    }),
  );
}

export function naspiAssumptions(
  outcome: NaspiOutcome,
  t: TranslateFn,
  f: ViewFormat,
  regions: RegionText,
): readonly NaspiAssumption[] {
  const { facts, breakdown } = outcome;
  const residence = facts.residence;
  const items: NaspiAssumption[] = [
    {
      id: "year",
      text: t("naspi.assume.year", { year: facts.year }),
      changeLabel: t("naspi.assume.year.change"),
      targetId: radioId(IDS.year, String(facts.year)),
      inNetGroup: false,
    },
    {
      id: "gross",
      text: t("naspi.assume.gross", { amount: f.money(facts.gross) }),
      changeLabel: t("naspi.assume.gross.change"),
      targetId: IDS.gross,
      inNetGroup: false,
    },
    {
      id: "weeks",
      text: t("naspi.assume.weeks", { weeks: facts.weeks }),
      changeLabel: t("naspi.assume.weeks.change"),
      targetId: IDS.weeks,
      inNetGroup: false,
    },
    {
      id: "age",
      text: t("naspi.assume.age", { age: facts.age }),
      changeLabel: t("naspi.assume.age.change"),
      targetId: IDS.age,
      inNetGroup: false,
    },
    {
      id: "resignation",
      text: facts.resigned
        ? t("naspi.assume.resignation", { weeks: facts.weeksAfter })
        : t("naspi.assume.noResignation"),
      changeLabel: t("naspi.assume.resignation.change"),
      targetId: facts.resigned ? IDS.weeksAfter : IDS.resigned,
      inNetGroup: false,
    },
  ];
  if (!breakdown.eligible) return items;
  return [
    ...items,
    {
      id: "other",
      text:
        facts.otherIncome > 0
          ? t("naspi.net.recap.other", { amount: f.money(facts.otherIncome), year: facts.year })
          : t("naspi.net.recap.noOther", { year: facts.year }),
      changeLabel: t("naspi.assume.other.change"),
      targetId: IDS.otherIncome,
      inNetGroup: true,
    },
    {
      id: "residence",
      text:
        residence.comune === null
          ? t("naspi.assume.rate", {
              regionIn: regions.within(residence.region),
              rate: f.percent(residence.flatRate),
            })
          : t("naspi.assume.comune", {
              comune: residence.comune.name,
              regionIn: regions.within(residence.region),
            }),
      changeLabel: t("naspi.assume.residence.change"),
      targetId: IDS.region,
      inNetGroup: true,
    },
  ];
}

function TrustNote({
  verified,
  withPending,
}: {
  readonly verified: VerifiedLine | null;
  readonly withPending: boolean;
}) {
  const t = useT();
  const rt = useRichT();
  if (verified === null) return null;
  return (
    <>
      {" "}
      {rt("naspi.note.trust", {
        checked: <a href={verified.href}>{t("naspi.note.verified", { date: verified.date })}</a>,
        pending: withPending && verified.pending > 0 ? "yes" : "no",
        count: verified.pending,
      })}
    </>
  );
}

export function NaspiResult({
  outcome,
  figureState,
  prompt,
  staleNote,
  announcement,
  verified,
  f,
  regions,
  explained,
  onExplainedChange,
  valueRef,
  onChange,
}: NaspiResultProps) {
  const t = useT();
  const rt = useRichT();
  const shown = figureState === "empty" ? null : outcome;
  const eligible = shown?.breakdown.eligible ?? true;
  const minWeeks = shown === null ? 0 : getNaspiConfig(shown.facts.year).minWeeks;

  let summary: ReactNode;
  if (shown !== null && !eligible) {
    summary = (
      <ResultAnswer
        headingId={IDS.resultHeading}
        answer={t("naspi.none.answer")}
        lines={[
          ...reasonLines(shown, minWeeks, t),
          ...(figureState === "stale" ? [staleNote] : []),
        ]}
      />
    );
  } else {
    const breakdown = shown?.breakdown;
    const estimate = shown?.estimate ?? null;
    const schedule = shown?.schedule ?? null;
    const full = breakdown === undefined ? 0 : fullAmountMonths(breakdown);
    const firstNet = schedule?.rows[0]?.net ?? 0;
    summary = (
      <ResultFigure
        headingId={IDS.resultHeading}
        label={t("naspi.result.label")}
        state={breakdown === undefined ? "empty" : figureState}
        prompt={prompt}
        staleNote={staleNote}
        size="small"
        valueRef={valueRef}
        {...(breakdown === undefined || shown === null || schedule === null
          ? {}
          : {
              value: f.money(breakdown.monthlyAmount),
              basis:
                full >= breakdown.durationMonths
                  ? t("naspi.result.basis.all", { months: breakdown.durationMonths })
                  : t("naspi.result.basis.first", { months: full }),
              sub:
                estimate === null
                  ? undefined
                  : estimate.otherIncome > 0
                    ? rt("naspi.result.net.other", {
                        amount: <strong>{f.whole(roundedToTen(firstNet))}</strong>,
                        other: <Amount>{f.money(estimate.otherIncome)}</Amount>,
                        year: shown.facts.year,
                      })
                    : rt("naspi.result.net.alone", {
                        amount: <strong>{f.whole(roundedToTen(firstNet))}</strong>,
                        year: shown.facts.year,
                      }),
              subLines: [
                rt("naspi.result.total", {
                  weeks: breakdown.durationWeeks,
                  months: breakdown.durationMonths,
                  total: <strong>{f.money(schedule.grossTotal)}</strong>,
                }),
              ],
            })}
      />
    );
  }

  const steps: readonly NextStep[] =
    shown === null || eligible
      ? []
      : nextStepsFor(shown.breakdown.reasons).map((key) => ({ id: key, text: t(key) }));

  return (
    <div className="qg-result">
      <div className="qg-result__summary">{summary}</div>
      <LiveStatus message={announcement} />
      {shown !== null && (
        <>
          {steps.length > 0 && (
            <NextSteps headingId={IDS.checkHeading} title={t("naspi.check.title")} steps={steps} />
          )}
          <Assumptions
            headingId={IDS.assumptionsHeading}
            items={naspiAssumptions(shown, t, f, regions)}
            onChange={onChange}
          />
          <NoteLine term={t("result.estimate.term")}>
            {eligible ? t("naspi.note.estimate") : t("naspi.note.decision")}
            <TrustNote verified={verified} withPending={eligible} />
          </NoteLine>
          {eligible && (
            <NaspiLedgers
              outcome={shown}
              f={f}
              regions={regions}
              explained={explained}
              onExplainedChange={onExplainedChange}
            />
          )}
        </>
      )}
    </div>
  );
}
