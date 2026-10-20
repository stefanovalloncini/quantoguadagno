import { useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { Icon } from "@/components/icons/Icon.tsx";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement, LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { WorkedSum, type WorkedSumRow } from "@/components/result/Ledger.tsx";
import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { FOI_INDEX } from "@/data/index.ts";
import { formatAmountInput, parseMoneyInput } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { InflationChart } from "./InflationChart.tsx";
import { useNumberField } from "./numberField.ts";
import type { InflationErrorValue, InflationField } from "./state.ts";
import { useInflationController } from "./useInflationController.ts";
import { IDS } from "./viewIds.ts";

export function InflationView() {
  const t = useT();
  const f = useViewFormat();
  const containerRef = useRef<HTMLDivElement>(null);
  const controller = useInflationController();
  const { state, errors, result, derived } = controller;

  const blurErrors = useBlurErrors<InflationField, InflationErrorValue>(errors);
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);

  const adoptField = (name: string, value: string | boolean) => {
    if (typeof value === "string") controller.adoptField(name, value);
  };
  useHydratedFormValues(containerRef, adoptField);

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = Object.keys(errors) as InflationField[];
    if (fromLink.length > 0) touchFields(fromLink);
  }, [errors, interacted, touchFields]);

  const amountField = useNumberField(
    state.amount,
    (value) => formatAmountInput(value, f.locale),
    (raw) => parseMoneyInput(raw, f.locale),
    controller.updateAmount,
  );

  const errorText = (field: InflationField): string | undefined => {
    const error = blurErrors.shown[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const figureState: FigureState = Object.keys(blurErrors.shown).length > 0 ? "stale" : "ready";
  const staleNote = t("inflation.result.stale");
  const barVisible = useBottomBarVisible(figureValue, figureState === "ready");
  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "stale"
        ? staleNote
        : t("inflation.result.announce", {
            amount: f.money(result.nominal),
            fromYear: result.fromYear,
            adjusted: f.money(result.adjusted),
            toYear: result.toYear,
          }),
  );

  const verified = useMemo(() => verifiedLine(f.locale), [f.locale]);
  const provisionalYear = useMemo(() => {
    const from = FOI_INDEX.find((point) => point.year === state.fromYear);
    const to = FOI_INDEX.find((point) => point.year === state.toYear);
    if (to?.provisional === true) return to.year;
    if (from?.provisional === true) return from.year;
    return null;
  }, [state.fromYear, state.toYear]);

  const keepPaceRows: readonly WorkedSumRow[] =
    result.keepPace === null
      ? []
      : [
          {
            id: "needed",
            label: t("inflation.keepPace.needed", { year: result.keepPace.toYear }),
            amount: f.money(result.keepPace.grossNeeded),
          },
          {
            id: "raise",
            label: t("inflation.keepPace.raise"),
            amount: f.signed(result.keepPace.raiseAmount),
          },
        ];
  const keepPaceTotal: WorkedSumRow = {
    id: "rate",
    label: t("inflation.result.cumulative"),
    amount: result.keepPace === null ? "" : f.percent(result.keepPace.raisePercent),
  };

  const yearOptions = derived.availableYears.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  const primary = (
    <>
      <Field
        id={IDS.amount}
        label={t("inflation.form.amount")}
        labelSuffix={t("field.unit.euro")}
        hint={t("inflation.form.amount.hint")}
        error={errorText("amount")}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="amount"
            value={amountField.text}
            onValueChange={(value) => {
              setInteracted(true);
              amountField.onValueChange(value);
            }}
            onFocus={() => {
              amountField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              amountField.onBlur();
              blurErrors.onBlur("amount");
            }}
          />
        )}
      </Field>
      <Field id={IDS.fromYear} label={t("inflation.form.fromYear")} error={errorText("fromYear")}>
        {(control) => (
          <Select<string>
            {...control}
            name="fromYear"
            value={String(state.fromYear)}
            options={yearOptions}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateFromYear(Number(value));
            }}
          />
        )}
      </Field>
      <Field id={IDS.toYear} label={t("inflation.form.toYear")} error={errorText("toYear")}>
        {(control) => (
          <Select<string>
            {...control}
            name="toYear"
            value={String(state.toYear)}
            options={yearOptions}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateToYear(Number(value));
            }}
          />
        )}
      </Field>
    </>
  );

  return (
    <div ref={containerRef}>
      <PageIntro title={t("inflation.title")} lede={t("inflation.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("inflation.result.adjusted", { year: result.toYear })}
                state={figureState}
                staleNote={staleNote}
                valueRef={setFigureValue}
                value={f.money(result.adjusted)}
                sub={t("inflation.result.adjusted.sub", { year: result.fromYear })}
              />
            </div>
            <LiveStatus message={announcement} />
            <NoteLine term={t("inflation.result.cumulative")}>
              {f.percent(result.cumulativeRate)}
            </NoteLine>
            {provisionalYear !== null && (
              <p className="qg-notes__line">
                <span className="qg-status qg-status--provisional">
                  <Icon name="clock" />
                  {t("inflation.result.provisionalBadge")}
                </span>{" "}
                {t("inflation.result.provisional", { year: provisionalYear })}
              </p>
            )}
            <NoteLine>
              {t("inflation.result.note")}
              {verified !== null && (
                <>
                  {" "}
                  <a href={verified.href}>
                    {t("inflation.result.verified", {
                      date: verified.date,
                      dateArticle: verified.dateArticle,
                    })}
                  </a>
                  .
                </>
              )}
            </NoteLine>
          </div>
        }
      />
      {result.keepPace !== null && (
        <section
          className="qg-ledger-block qg-band qg-band--narrow"
          aria-labelledby={IDS.keepPaceHeading}
        >
          <h2 className="qg-heading" id={IDS.keepPaceHeading}>
            {t("inflation.keepPace.title")}
          </h2>
          <WorkedSum rows={keepPaceRows} total={keepPaceTotal} />
          <NoteLine>
            {t("inflation.keepPace.note", { from: result.fromYear, to: result.toYear })}
          </NoteLine>
        </section>
      )}
      {result.frozen !== null && (
        <InflationChart frozen={result.frozen} series={derived.frozenSeries} f={f} />
      )}
      <BottomBar
        label={t("inflation.result.adjusted", { year: result.toYear })}
        value={f.money(result.adjusted)}
        targetId={IDS.resultHeading}
        visible={barVisible}
      />
    </div>
  );
}
