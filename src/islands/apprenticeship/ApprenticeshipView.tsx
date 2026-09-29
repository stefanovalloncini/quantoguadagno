import { useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { regionSelectKey, useRegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { Assumptions, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { LiveStatus, useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import type { RegionCode } from "@/data/index.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { NET_PAY_PREFIXES, TrustNote } from "@/islands/inverse/TrustNote.tsx";
import {
  deriveApprenticeship,
  ESTIMATE_MUNICIPAL_TAX_RATE,
  ESTIMATE_PAYMENT_FREQUENCY,
  ESTIMATE_REGION_CODE,
  ESTIMATE_TAX_YEAR,
} from "./derive.ts";
import { ScheduleTable } from "./ScheduleTable.tsx";
import { YEAR_OPTIONS, type ApprenticeshipState } from "./state.ts";
import { useApprenticeshipController } from "./useApprenticeshipController.ts";
import { IDS } from "./viewIds.ts";

type ApprenticeshipField = keyof ApprenticeshipState;

export function ApprenticeshipView() {
  const t = useT();
  const rt = useRichT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useApprenticeshipController();
  const { state, result, errors } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<RegionCode>(ESTIMATE_REGION_CODE);
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const blurErrors = useBlurErrors<
    ApprenticeshipField,
    NonNullable<(typeof errors)[ApprenticeshipField]>
  >(errors);

  useHydratedFormValues(containerRef, controller.adoptField);

  const targetEmpty = state.targetGrossAnnual.trim() === "";
  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = Object.keys(errors) as ApprenticeshipField[];
    if (fromLink.length > 0) touchFields(fromLink);
  }, [errors, interacted, touchFields]);

  const derived = useMemo(() => deriveApprenticeship(result, region), [result, region]);

  const errorText = (field: ApprenticeshipField): string | undefined => {
    const error = blurErrors.shown[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const hasTargetError = errorText("targetGrossAnnual") !== undefined;
  const hasYearsError = errorText("years") !== undefined;
  const figureState: FigureState = targetEmpty
    ? "empty"
    : hasTargetError || hasYearsError
      ? "stale"
      : "ready";
  const figureReady = figureState === "ready" && derived.firstYear !== null;
  const barVisible = useBottomBarVisible(figureValue, figureReady);

  const prompt = t(targetEmpty ? "apprenticeship.result.empty" : "apprenticeship.result.fix");
  const staleNote = hasTargetError
    ? t("apprenticeship.result.staleTarget", { amount: f.money(result.targetGrossAnnual) })
    : t("apprenticeship.result.staleYears");

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "empty"
        ? prompt
        : figureState === "stale"
          ? staleNote
          : derived.firstYear === null
            ? null
            : t("apprenticeship.result.announce", {
                amount: f.money(derived.firstYear.estimatedNetMonthly),
              }),
  );

  const assumptionItems: readonly AssumptionItem[] = [
    {
      id: "target",
      text: t("apprenticeship.assumptions.target", { amount: f.money(result.targetGrossAnnual) }),
      changeLabel: t("apprenticeship.assumptions.target.change"),
      targetId: IDS.target,
    },
    {
      id: "years",
      text: t("apprenticeship.assumptions.years", { years: result.years }),
      changeLabel: t("apprenticeship.assumptions.years.change"),
      targetId: IDS.years,
    },
    {
      id: "region",
      text: t("apprenticeship.assumptions.region", {
        region: regionSelectKey(region),
        name: regions.name(region),
      }),
      changeLabel: t("apprenticeship.assumptions.region.change"),
      targetId: IDS.region,
    },
  ];

  const fixedAssumptions = [
    {
      id: "estimate",
      text: t("apprenticeship.assumptions.fixed", {
        rate: f.percent(ESTIMATE_MUNICIPAL_TAX_RATE),
        count: ESTIMATE_PAYMENT_FREQUENCY,
      }),
    },
  ];

  const focusTarget = (id: string) => {
    document.getElementById(id)?.focus();
  };

  return (
    <div ref={containerRef}>
      <PageIntro title={t("apprenticeship.title")} lede={t("apprenticeship.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={
          <>
            <Field
              id={IDS.target}
              label={t("apprenticeship.form.target")}
              labelSuffix={t("field.unit.euro")}
              hint={t("apprenticeship.form.target.hint")}
              error={errorText("targetGrossAnnual")}
            >
              {(control) => (
                <MoneyInput
                  {...control}
                  name="targetGrossAnnual"
                  value={state.targetGrossAnnual}
                  onValueChange={(value) => {
                    setInteracted(true);
                    controller.updateTargetGrossAnnual(value);
                  }}
                  onFocus={blurErrors.onFocus}
                  onBlur={() => {
                    blurErrors.onBlur("targetGrossAnnual");
                  }}
                />
              )}
            </Field>
            <RadioGroup
              idPrefix={IDS.years}
              name="years"
              legend={t("apprenticeship.form.years")}
              hint={t("apprenticeship.form.years.hint")}
              error={errorText("years")}
              value={String(state.years)}
              options={YEAR_OPTIONS.map((years) => ({
                value: String(years),
                label: String(years),
              }))}
              onValueChange={(value) => {
                setInteracted(true);
                controller.updateYears(Number(value));
              }}
            />
            <Field
              id={IDS.region}
              label={t("apprenticeship.form.region")}
              hint={t("apprenticeship.form.region.hint")}
            >
              {(control) => (
                <Select<RegionCode>
                  {...control}
                  name="region"
                  value={region}
                  options={regions.options}
                  onValueChange={(value) => {
                    setInteracted(true);
                    setRegion(value);
                  }}
                />
              )}
            </Field>
          </>
        }
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("apprenticeship.result.firstYear")}
                state={figureState}
                prompt={prompt}
                staleNote={staleNote}
                valueRef={setFigureValue}
                {...(derived.firstYear === null
                  ? {}
                  : {
                      value: f.money(derived.firstYear.estimatedNetMonthly),
                      sub:
                        derived.lastYear !== null &&
                        derived.lastYear.year !== derived.firstYear.year
                          ? rt("apprenticeship.result.sub", {
                              year: derived.lastYear.year,
                              amount: (
                                <strong>
                                  {f.whole(Math.round(derived.lastYear.estimatedNetMonthly))}
                                </strong>
                              ),
                            })
                          : undefined,
                    })}
              />
            </div>
            <LiveStatus message={announcement} />
            {figureState !== "empty" && (
              <>
                <Assumptions
                  headingId={IDS.assumptionsHeading}
                  items={assumptionItems}
                  fixed={fixedAssumptions}
                  onChange={(item) => {
                    focusTarget(item.targetId);
                  }}
                />
                <TrustNote
                  ns="apprenticeship"
                  locale={f.locale}
                  scope={{
                    prefixes: NET_PAY_PREFIXES,
                    region,
                    year: ESTIMATE_TAX_YEAR,
                    withComune: false,
                  }}
                />
              </>
            )}
          </div>
        }
        rest={
          <ScheduleTable
            headingId={IDS.scheduleHeading}
            rows={derived.schedule}
            region={region}
            f={f}
          />
        }
      />
      {derived.firstYear !== null && (
        <BottomBar
          label={t("apprenticeship.result.label")}
          value={f.money(derived.firstYear.estimatedNetMonthly)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
