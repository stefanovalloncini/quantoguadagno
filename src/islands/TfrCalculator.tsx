import { useMemo, useRef, useState } from "react";
import type { AssumptionItem } from "@/components/result/Assumptions.tsx";
import { Assumptions, NoteLine } from "@/components/result/Assumptions.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { Ledger, type LedgerRow } from "@/components/result/Ledger.tsx";
import { useSettledAnnouncement, LiveStatus } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { latestVerification } from "@/data/index.ts";
import { formatDate, parseDecimal } from "@/i18n/numbers.ts";
import { I18nProvider, useFormat, useLocale, useRichT, useT } from "@/i18n/react.tsx";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { hrefFor } from "@/routePaths.ts";
import { formatInflationPoints, formatYearsText, useNumberField } from "./tfr/numberField.ts";
import { ScheduleTable } from "./tfr/ScheduleTable.tsx";
import { MAX_RAL, parseRal, type TfrErrorValue, type TfrFieldErrors } from "./tfr/state.ts";
import { useTfrController } from "./tfr/useTfrController.ts";

const IDS = {
  ral: "ral",
  years: "anni",
  inflationRate: "inflazione",
  result: "risultato",
  resultHeading: "tfr-titolo",
  assumptionsHeading: "tfr-ipotesi-titolo",
  ledgerHeading: "tfr-dettaglio-titolo",
  ledgerToggle: "tfr-spiega",
  scheduleHeading: "tfr-anni-titolo",
} as const;

type TfrField = keyof TfrFieldErrors;

function verifiedLine(locale: "it" | "en") {
  const date = latestVerification();
  if (date === null) return null;
  return { date: formatDate(new Date(date), locale), href: hrefFor("sources", locale) };
}

function TfrCalculatorContent() {
  const t = useT();
  const rt = useRichT();
  const f = useFormat();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const controller = useTfrController();
  const { state, errors, result, derived, showAllYears } = controller;

  const blurErrors = useBlurErrors<TfrField, TfrErrorValue>(errors);
  const ralEmpty = state.ral.trim() === "";
  const shown = useMemo(
    () =>
      ralEmpty
        ? Object.fromEntries(Object.entries(blurErrors.shown).filter(([field]) => field !== "ral"))
        : blurErrors.shown,
    [blurErrors.shown, ralEmpty],
  );

  useHydratedFormValues(containerRef, controller.adoptField);

  const yearsField = useNumberField(
    state.years,
    formatYearsText,
    (raw) => parseDecimal(raw, locale),
    controller.updateYears,
  );
  const inflationField = useNumberField(
    state.inflationRate,
    (value) => formatInflationPoints(value, locale),
    (raw) => {
      const points = parseDecimal(raw, locale);
      return points === null ? null : points / 100;
    },
    controller.updateInflationRate,
  );

  const [explained, setExplained] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const [interacted, setInteracted] = useState(false);

  const errorText = (field: TfrField): string | undefined => {
    const error = shown[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const shownFields = Object.keys(shown).filter((field) => shown[field as TfrField] !== undefined);
  const figureState: FigureState = ralEmpty ? "empty" : shownFields.length > 0 ? "stale" : "ready";
  const prompt = t(ralEmpty ? "tfr.result.empty" : "tfr.result.fix");

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "empty"
        ? prompt
        : figureState === "stale"
          ? t("tfr.result.stale")
          : t("tfr.result.announce", { amount: f.money(result.finalStock), years: state.years }),
  );

  const goTo = (targetId: string) => {
    document.getElementById(targetId)?.focus();
  };

  const ralValue = Math.min(Math.max(parseRal(state, locale) ?? 0, 0), MAX_RAL);
  const assumptionItems: readonly AssumptionItem[] = [
    {
      id: "ral",
      text: t("tfr.assumption.ral", { amount: f.money(ralValue) }),
      changeLabel: t("tfr.change.ral"),
      targetId: IDS.ral,
    },
    {
      id: "years",
      text: t("tfr.assumption.years", { count: state.years }),
      changeLabel: t("tfr.change.years"),
      targetId: IDS.years,
    },
    {
      id: "inflation",
      text: t("tfr.assumption.inflation", { rate: f.percent(state.inflationRate, 2) }),
      changeLabel: t("tfr.change.inflation"),
      targetId: IDS.inflationRate,
    },
  ];

  const ledgerRows: readonly LedgerRow[] = [
    {
      id: "quote",
      name: t("tfr.breakdown.quote"),
      kind: "plain",
      annual: f.money(result.totalQuote),
      explanation: t("tfr.breakdown.quote.explain"),
    },
    {
      id: "revaluation",
      name: t("tfr.breakdown.revaluation"),
      kind: "plain",
      annual: f.money(result.totalRevaluation),
      explanation: t("tfr.breakdown.revaluation.explain"),
    },
  ];
  const ledgerTotal: LedgerRow = {
    id: "total",
    name: t("tfr.result.stock"),
    kind: "total",
    annual: f.money(result.finalStock),
  };

  const verified = useMemo(() => verifiedLine(locale), [locale]);
  const figureReady = figureState !== "empty";
  const barVisible = useBottomBarVisible(figureValue, figureReady);

  const primary = (
    <>
      <Field
        id={IDS.ral}
        label={t("tfr.ral.label")}
        labelSuffix={t("field.unit.euro")}
        hint={t("tfr.ral.hint")}
        error={errorText("ral")}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="ral"
            value={state.ral}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateRal(value);
            }}
            onFocus={blurErrors.onFocus}
            onBlur={() => {
              blurErrors.onBlur("ral");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.years}
        label={t("tfr.form.years")}
        hint={t("tfr.form.years.hint")}
        error={errorText("years")}
      >
        {(control) => (
          <NumberInput
            {...control}
            kind="integer"
            name="years"
            value={yearsField.text}
            onValueChange={(raw) => {
              setInteracted(true);
              yearsField.onValueChange(raw);
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
        )}
      </Field>
      <Field
        id={IDS.inflationRate}
        label={t("tfr.form.inflation")}
        labelSuffix={t("field.unit.percent")}
        hint={t("tfr.form.inflation.hint")}
        error={errorText("inflationRate")}
      >
        {(control) => (
          <NumberInput
            {...control}
            kind="percent"
            name="inflationRate"
            value={inflationField.text}
            onValueChange={(raw) => {
              setInteracted(true);
              inflationField.onValueChange(raw);
            }}
            onFocus={() => {
              inflationField.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              inflationField.onBlur();
              blurErrors.onBlur("inflationRate");
            }}
          />
        )}
      </Field>
    </>
  );

  return (
    <div ref={containerRef}>
      <PageIntro title={t("tfr.title")} lede={t("tfr.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("tfr.result.stock")}
                state={figureState}
                prompt={prompt}
                staleNote={t("tfr.result.stale")}
                valueRef={setFigureValue}
                {...(figureState === "empty"
                  ? {}
                  : {
                      value: f.money(result.finalStock),
                      sub: rt("tfr.result.stock.sub", {
                        amount: <strong>{f.money(result.annualQuota)}</strong>,
                      }),
                    })}
              />
            </div>
            <LiveStatus message={announcement} />
            {figureState !== "empty" && (
              <>
                <Assumptions
                  headingId={IDS.assumptionsHeading}
                  items={assumptionItems}
                  onChange={(item) => {
                    goTo(item.targetId);
                  }}
                />
                <NoteLine term={t("result.estimate.term")}>
                  {t("tfr.result.note")}
                  {verified !== null && (
                    <>
                      {" "}
                      <a href={verified.href}>
                        {t("tfr.result.verified", { date: verified.date })}
                      </a>
                      .
                    </>
                  )}
                </NoteLine>
                <Ledger
                  headingId={IDS.ledgerHeading}
                  toggleId={IDS.ledgerToggle}
                  title={t("tfr.ledger.title")}
                  caption={t("tfr.ledger.caption", { years: state.years })}
                  columns={{
                    term: t("tfr.ledger.column.term"),
                    annual: t("tfr.ledger.column.total"),
                  }}
                  rows={ledgerRows}
                  total={ledgerTotal}
                  explained={explained}
                  onExplainedChange={setExplained}
                />
              </>
            )}
          </div>
        }
      />
      {figureState !== "empty" && (
        <ScheduleTable
          headingId={IDS.scheduleHeading}
          rows={derived.visibleSchedule}
          hasMoreYears={derived.hasMoreYears}
          showAllYears={showAllYears}
          onReveal={controller.revealAllYears}
        />
      )}
      {figureReady && (
        <BottomBar
          label={t("tfr.result.stock")}
          value={f.money(result.finalStock)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}

export default function TfrCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <TfrCalculatorContent />
    </I18nProvider>
  );
}
