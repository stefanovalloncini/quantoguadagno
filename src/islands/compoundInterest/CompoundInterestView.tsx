import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { Assumptions, NoteLine, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement, LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { formatAmountInput, parseDecimal, parseMoneyInput } from "@/i18n/numbers.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { CompoundInterestChart } from "./CompoundInterestChart.tsx";
import { formatPercentPoints, formatYearsText, useNumberField } from "./numberField.ts";
import type { CompoundInterestErrorValue, CompoundInterestField } from "./state.ts";
import { useCompoundInterestController } from "./useCompoundInterestController.ts";
import { IDS } from "./viewIds.ts";

function percentParser(raw: string, locale: "it" | "en"): number | null {
  const points = parseDecimal(raw.trim().replace(/\s*%$/, ""), locale);
  return points === null ? null : points / 100;
}

export function CompoundInterestView() {
  const t = useT();
  const rt = useRichT();
  const f = useViewFormat();
  const containerRef = useRef<HTMLDivElement>(null);
  const controller = useCompoundInterestController();
  const { state, errors, result, derived } = controller;

  const blurErrors = useBlurErrors<CompoundInterestField, CompoundInterestErrorValue>(errors);
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);

  const adoptField = (name: string, value: string | boolean) => {
    if (typeof value === "string") controller.adoptField(name, value);
  };
  useHydratedFormValues(containerRef, adoptField);

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = Object.keys(errors) as CompoundInterestField[];
    if (fromLink.length > 0) touchFields(fromLink);
  }, [errors, interacted, touchFields]);

  const principalField = useNumberField(
    state.principal,
    (value) => formatAmountInput(value, f.locale),
    (raw) => parseMoneyInput(raw, f.locale),
    controller.updatePrincipal,
  );
  const contributionField = useNumberField(
    state.contribution,
    (value) => formatAmountInput(value, f.locale),
    (raw) => parseMoneyInput(raw, f.locale),
    controller.updateContribution,
  );
  const yearsField = useNumberField(
    state.years,
    formatYearsText,
    (raw) => {
      const value = parseDecimal(raw, f.locale);
      return value !== null && Number.isInteger(value) ? value : null;
    },
    controller.updateYears,
  );
  const annualRateField = useNumberField(
    state.annualRate,
    (value) => formatPercentPoints(value, f.locale),
    (raw) => percentParser(raw, f.locale),
    controller.updateAnnualRate,
  );
  const inflationRateField = useNumberField(
    state.inflationRate,
    (value) => formatPercentPoints(value, f.locale),
    (raw) => percentParser(raw, f.locale),
    controller.updateInflationRate,
  );

  const errorText = (field: CompoundInterestField): string | undefined => {
    const error = blurErrors.shown[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const figureState: FigureState = Object.keys(blurErrors.shown).length > 0 ? "stale" : "ready";
  const staleNote = t("compoundInterest.result.stale");
  const figureReady = figureState === "ready";
  const barVisible = useBottomBarVisible(figureValue, figureReady);

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "stale"
        ? staleNote
        : t("compoundInterest.result.announce", {
            amount: f.money(result.finalNominal),
            real: f.money(result.finalReal),
          }),
  );

  const contributionAssumption =
    state.contributionFrequency === "none"
      ? t("compoundInterest.assumptions.contribution.none")
      : t(`compoundInterest.assumptions.contribution.${state.contributionFrequency}`, {
          amount: f.money(state.contribution),
        });

  const assumptionItems: readonly AssumptionItem[] = [
    {
      id: "principal",
      text: t("compoundInterest.assumptions.principal", { amount: f.money(state.principal) }),
      changeLabel: t("compoundInterest.assumptions.principal.change"),
      targetId: IDS.principal,
    },
    {
      id: "annualRate",
      text: t("compoundInterest.assumptions.annualRate", { rate: f.percent(state.annualRate) }),
      changeLabel: t("compoundInterest.assumptions.annualRate.change"),
      targetId: IDS.annualRate,
    },
    {
      id: "years",
      text: t("compoundInterest.assumptions.years", { years: state.years }),
      changeLabel: t("compoundInterest.assumptions.years.change"),
      targetId: IDS.years,
    },
    {
      id: "contribution",
      text: contributionAssumption,
      changeLabel: t("compoundInterest.assumptions.contribution.change"),
      targetId: IDS.contribution,
    },
    {
      id: "compounding",
      text: t("compoundInterest.assumptions.compounding", {
        frequency: t(
          `compoundInterest.form.compoundingFrequency.${state.compoundingFrequency}`,
        ).toLocaleLowerCase(f.locale === "it" ? "it-IT" : "en-US"),
      }),
      changeLabel: t("compoundInterest.assumptions.compounding.change"),
      targetId: IDS.compoundingFrequency,
    },
    {
      id: "inflationRate",
      text: t("compoundInterest.assumptions.inflationRate", {
        rate: f.percent(state.inflationRate),
      }),
      changeLabel: t("compoundInterest.assumptions.inflationRate.change"),
      targetId: IDS.inflationRate,
    },
  ];

  const goTo = (item: AssumptionItem) => {
    document.getElementById(item.targetId)?.focus();
  };

  const primary = (
    <>
      <Field
        id={IDS.principal}
        label={t("compoundInterest.form.principal")}
        labelSuffix={t("field.unit.euro")}
        hint={t("compoundInterest.form.principal.hint")}
        error={errorText("principal")}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="principal"
            value={principalField.text}
            onValueChange={(value) => {
              setInteracted(true);
              principalField.onValueChange(value);
            }}
            onFocus={() => {
              principalField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              principalField.onBlur();
              blurErrors.onBlur("principal");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.annualRate}
        label={t("compoundInterest.form.annualRate")}
        labelSuffix={t("field.unit.percent")}
        hint={t("compoundInterest.form.annualRate.hint")}
        error={errorText("annualRate")}
      >
        {(control) => (
          <NumberInput
            {...control}
            kind="percent"
            name="annualRate"
            value={annualRateField.text}
            onValueChange={(value) => {
              setInteracted(true);
              annualRateField.onValueChange(value);
            }}
            onFocus={() => {
              annualRateField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              annualRateField.onBlur();
              blurErrors.onBlur("annualRate");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.years}
        label={t("compoundInterest.form.years")}
        labelSuffix={t("compoundInterest.form.years.unit")}
        error={errorText("years")}
      >
        {(control) => (
          <div className="qg-field__row">
            <NumberInput
              {...control}
              kind="integer"
              name="years"
              value={yearsField.text}
              onValueChange={(value) => {
                setInteracted(true);
                yearsField.onValueChange(value);
              }}
              onFocus={() => {
                yearsField.onFocus();
                blurErrors.onFocus();
              }}
              onBlur={() => {
                yearsField.onBlur();
                blurErrors.onBlur("years");
              }}
            />
            <span className="qg-input__suffix" aria-hidden="true">
              {t("compoundInterest.form.years.unit")}
            </span>
          </div>
        )}
      </Field>
      <Field
        id={IDS.contribution}
        label={t("compoundInterest.form.contribution")}
        labelSuffix={t("field.unit.euro")}
        hint={t("compoundInterest.form.contribution.hint")}
        error={errorText("contribution")}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="contribution"
            value={contributionField.text}
            onValueChange={(value) => {
              setInteracted(true);
              contributionField.onValueChange(value);
            }}
            onFocus={() => {
              contributionField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              contributionField.onBlur();
              blurErrors.onBlur("contribution");
            }}
          />
        )}
      </Field>
      <RadioGroup
        idPrefix={IDS.contributionFrequency}
        name="contributionFrequency"
        legend={t("compoundInterest.form.contributionFrequency")}
        layout="fill"
        value={state.contributionFrequency}
        options={[
          {
            value: "monthly",
            label: t("compoundInterest.form.contributionFrequency.monthly"),
          },
          { value: "yearly", label: t("compoundInterest.form.contributionFrequency.yearly") },
          { value: "none", label: t("compoundInterest.form.contributionFrequency.none") },
        ]}
        onValueChange={(value) => {
          setInteracted(true);
          controller.updateContributionFrequency(value);
        }}
      />
      <RadioGroup
        idPrefix={IDS.compoundingFrequency}
        name="compoundingFrequency"
        legend={t("compoundInterest.form.compoundingFrequency")}
        layout="fill"
        value={state.compoundingFrequency}
        options={[
          {
            value: "annually",
            label: t("compoundInterest.form.compoundingFrequency.annually"),
          },
          {
            value: "monthly",
            label: t("compoundInterest.form.compoundingFrequency.monthly"),
          },
          { value: "daily", label: t("compoundInterest.form.compoundingFrequency.daily") },
        ]}
        onValueChange={(value) => {
          setInteracted(true);
          controller.updateCompoundingFrequency(value);
        }}
      />
      <Field
        id={IDS.inflationRate}
        label={t("compoundInterest.form.inflationRate")}
        labelSuffix={t("field.unit.percent")}
        hint={t("compoundInterest.form.inflationRate.hint")}
        error={errorText("inflationRate")}
      >
        {(control) => (
          <NumberInput
            {...control}
            kind="percent"
            name="inflationRate"
            value={inflationRateField.text}
            onValueChange={(value) => {
              setInteracted(true);
              inflationRateField.onValueChange(value);
            }}
            onFocus={() => {
              inflationRateField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              inflationRateField.onBlur();
              blurErrors.onBlur("inflationRate");
            }}
          />
        )}
      </Field>
    </>
  );

  return (
    <div ref={containerRef}>
      <PageIntro title={t("compoundInterest.title")} lede={t("compoundInterest.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("compoundInterest.result.finalNominal")}
                state={figureState}
                staleNote={staleNote}
                valueRef={setFigureValue}
                value={f.money(result.finalNominal)}
                sub={rt("compoundInterest.result.finalReal", {
                  amount: <strong>{f.money(result.finalReal)}</strong>,
                })}
                subLines={[
                  t("compoundInterest.result.split", {
                    contributions: f.money(result.totalContributions),
                    interest: f.money(result.totalInterest),
                  }),
                ]}
              />
            </div>
            <LiveStatus message={announcement} />
            <Assumptions
              headingId={IDS.assumptionsHeading}
              items={assumptionItems}
              onChange={goTo}
            />
            <NoteLine>{t("compoundInterest.chart.caption")}</NoteLine>
          </div>
        }
      />
      <CompoundInterestChart
        result={result}
        schedule={derived.schedule}
        nominalSeries={derived.nominalSeries}
        realSeries={derived.realSeries}
        f={f}
        onShowAll={() => {
          controller.setShowAllYears(true);
        }}
      />
      {figureReady && (
        <BottomBar
          label={t("compoundInterest.result.finalNominal")}
          value={f.money(result.finalNominal)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
