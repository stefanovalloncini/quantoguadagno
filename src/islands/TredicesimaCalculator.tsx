import { useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { Assumptions, NoteLine, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { Ledger, type LedgerRow } from "@/components/result/Ledger.tsx";
import { LiveStatus, useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { countUnverified, latestVerification, SUPPORTED_YEARS } from "@/data/index.ts";
import type { TredicesimaResult } from "@/domain/index.ts";
import { formatDate, formatMoney, formatPercent, parseMoneyInput } from "@/i18n/numbers.ts";
import { I18nProvider, useLocale, useRichT, useT, type TranslateFn } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import type { IslandProps } from "@/islands/runtime/props.ts";
import { hrefFor } from "@/routePaths.ts";
import {
  MENSILITA_OPTIONS,
  type TredicesimaErrorValue,
  type TredicesimaState,
} from "./tredicesima/state.ts";
import { useTredicesimaController } from "./tredicesima/useTredicesimaController.ts";

const IDS = {
  result: "risultato-tredicesima",
  resultHeading: "tredicesima-titolo",
  assumptionsHeading: "tredicesima-ipotesi-titolo",
  ledgerHeading: "tredicesima-dettaglio-titolo",
  ledgerToggle: "tredicesima-spiega",
  ral: "tredicesima-ral",
  mensilita: "tredicesima-mensilita",
  taxYear: "tredicesima-anno",
} as const;

const PARAMETERS_USED = ["irpef.brackets", "inps.employee.rate"] as const;

type TredicesimaField = keyof TredicesimaState;

function errorText(t: TranslateFn, error: TredicesimaErrorValue | undefined): string | undefined {
  if (error === undefined) return undefined;
  if (typeof error === "string") return t(error);
  return t(error.key, { ...error.values });
}

function focusWhenPresent(id: string): void {
  document.getElementById(id)?.focus();
}

function verifiedLine(locale: "it" | "en") {
  const date = latestVerification();
  if (date === null) return null;
  return { date: formatDate(new Date(date), locale), href: hrefFor("sources", locale) };
}

interface LastGood {
  readonly result: TredicesimaResult;
  readonly ral: number;
}

function TredicesimaView() {
  const t = useT();
  const rt = useRichT();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const controller = useTredicesimaController();
  const { state, errors, result, derived } = controller;
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);

  const blurErrors = useBlurErrors<TredicesimaField, NonNullable<TredicesimaErrorValue>>(errors);
  useHydratedFormValues(containerRef, controller.adoptField);

  const [lastGood, setLastGood] = useState<LastGood>(() => ({
    result,
    ral: parseMoneyInput(state.ral, locale) ?? 0,
  }));
  if (errors.ral === undefined && result !== lastGood.result) {
    setLastGood({ result, ral: parseMoneyInput(state.ral, locale) ?? 0 });
  }

  const ralEmpty = state.ral.trim() === "";
  const stale = !ralEmpty && errors.ral !== undefined;
  const shown = stale ? lastGood.result : result;
  const figureState: FigureState = ralEmpty ? "empty" : stale ? "stale" : "ready";

  const staleNote = t("tredicesima.result.stale", {
    ral: formatMoney(lastGood.ral, locale),
  });
  const prompt = t("tredicesima.result.empty");

  const announcement = useSettledAnnouncement(
    !interacted || figureState === "empty"
      ? null
      : figureState === "stale"
        ? staleNote
        : t("tredicesima.result.announce", { amount: formatMoney(shown.net, locale) }),
  );

  const checked = verifiedLine(locale);
  const pending = countUnverified(state.taxYear, PARAMETERS_USED);

  const items: readonly AssumptionItem[] = [
    {
      id: "year",
      text: t("tredicesima.assumption.year", { year: state.taxYear }),
      changeLabel: t("tredicesima.change.year"),
      targetId: `${IDS.taxYear}-${String(state.taxYear)}`,
    },
    {
      id: "mensilita",
      text: t("tredicesima.assumption.mensilita", { mensilita: String(state.mensilita) }),
      changeLabel: t("tredicesima.change.mensilita"),
      targetId: `${IDS.mensilita}-${String(state.mensilita)}`,
    },
  ];

  const rows: LedgerRow[] = [
    {
      id: "gross",
      name: t("tredicesima.breakdown.gross"),
      kind: "plain",
      rule: t("tredicesima.ledger.gross.rule", { mensilita: state.mensilita }),
      annual: formatMoney(shown.gross, locale),
    },
    {
      id: "inps",
      name: t("tredicesima.breakdown.inps"),
      kind: "deducted",
      rule: t("tredicesima.ledger.inps.rule", {
        rate: formatPercent(shown.gross > 0 ? shown.inps / shown.gross : 0, locale, 2),
      }),
      annual: formatMoney(-shown.inps, locale),
    },
    {
      id: "taxable",
      name: t("tredicesima.ledger.taxable"),
      kind: "subtotal",
      rule: t("tredicesima.ledger.taxable.rule"),
      annual: formatMoney(shown.taxable, locale),
    },
    {
      id: "irpef",
      name: t("tredicesima.breakdown.irpef"),
      kind: "deducted",
      rule: t("tredicesima.ledger.irpef.rule", {
        rate: formatPercent(shown.marginalRate, locale, 0),
      }),
      annual: formatMoney(-shown.irpef, locale),
    },
  ];

  const total: LedgerRow = {
    id: "net",
    name: t("tredicesima.breakdown.net"),
    kind: "total",
    annual: formatMoney(shown.net, locale),
  };

  const [explained, setExplained] = useState(false);
  const barVisible = useBottomBarVisible(figureValue, figureState !== "empty");

  return (
    <div ref={containerRef}>
      <PageIntro title={t("tredicesima.title")} lede={t("tredicesima.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={
          <>
            <Field
              id={IDS.ral}
              label={t("tredicesima.form.ral")}
              labelSuffix={t("field.unit.euro")}
              hint={t("tredicesima.form.ral.hint")}
              error={errorText(t, blurErrors.shown.ral)}
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
            <RadioGroup
              idPrefix={IDS.mensilita}
              name="mensilita"
              legend={t("tredicesima.form.mensilita")}
              hint={t("tredicesima.form.mensilita.hint")}
              error={errorText(t, blurErrors.shown.mensilita)}
              value={String(state.mensilita)}
              options={MENSILITA_OPTIONS.map((mensilita) => ({
                value: String(mensilita),
                label: t(
                  mensilita === 14
                    ? "tredicesima.form.mensilita.option14"
                    : "tredicesima.form.mensilita.option13",
                ),
              }))}
              onValueChange={(value) => {
                setInteracted(true);
                const mensilita = Number(value);
                if (mensilita === 13 || mensilita === 14) controller.updateMensilita(mensilita);
              }}
            />
            <RadioGroup
              idPrefix={IDS.taxYear}
              name="taxYear"
              legend={t("tredicesima.form.taxYear")}
              value={String(state.taxYear)}
              options={SUPPORTED_YEARS.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              onValueChange={(value) => {
                setInteracted(true);
                const year = SUPPORTED_YEARS.find((option) => String(option) === value);
                if (year !== undefined) controller.updateTaxYear(year);
              }}
            />
          </>
        }
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("tredicesima.result.net")}
                state={figureState}
                prompt={prompt}
                staleNote={staleNote}
                valueRef={setFigureValue}
                {...(figureState === "empty"
                  ? {}
                  : {
                      value: formatMoney(shown.net, locale),
                      sub: t("tredicesima.result.net.sub", {
                        rate: formatPercent(shown.effectiveRate, locale, 2),
                      }),
                    })}
              />
            </div>
            <LiveStatus message={announcement} />
            {figureState !== "empty" && (
              <>
                {derived.showCombinedTotal && (
                  <p className="qg-figure__aside">
                    {t("tredicesima.result.netTotal", {
                      amount: formatMoney(shown.netTotal, locale),
                    })}
                  </p>
                )}
                <Assumptions
                  headingId={IDS.assumptionsHeading}
                  items={items}
                  onChange={(item) => {
                    focusWhenPresent(item.targetId);
                  }}
                />
                <NoteLine term={t("result.estimate.term")}>
                  {t("tredicesima.result.estimate")} {t("tredicesima.result.note")}
                  {checked !== null && (
                    <>
                      {" "}
                      {rt("tredicesima.result.trust", {
                        checked: (
                          <a href={checked.href}>
                            {t("tredicesima.result.verified", { date: checked.date })}
                          </a>
                        ),
                        pending: pending > 0 ? "yes" : "no",
                        count: pending,
                      })}
                    </>
                  )}
                </NoteLine>
                <Ledger
                  headingId={IDS.ledgerHeading}
                  toggleId={IDS.ledgerToggle}
                  title={t("tredicesima.ledger.title")}
                  caption={t("tredicesima.ledger.caption", { year: state.taxYear })}
                  columns={{
                    term: t("tredicesima.ledger.column.term"),
                    annual: t("tredicesima.ledger.column.amount"),
                  }}
                  rows={rows}
                  total={total}
                  explained={explained}
                  onExplainedChange={setExplained}
                />
              </>
            )}
          </div>
        }
      />
      {figureState !== "empty" && (
        <BottomBar
          label={t("tredicesima.result.net")}
          value={formatMoney(shown.net, locale)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}

export default function TredicesimaCalculator({ locale, messages }: IslandProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <TredicesimaView />
    </I18nProvider>
  );
}
