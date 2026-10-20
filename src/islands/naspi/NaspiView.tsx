import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { flushSync } from "react-dom";
import { Checkbox } from "@/components/form/Checkbox.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { Field, type FieldMessages } from "@/components/form/Field.tsx";
import { MoneyInput, tidyMoneyText } from "@/components/form/MoneyInput.tsx";
import { afterPointerRelease } from "@/components/form/pointer.ts";
import { NumberInput } from "@/components/form/NumberInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import type { FigureState } from "@/components/result/ResultFigure.tsx";
import { Topics } from "@/components/result/Topics.tsx";
import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { SUPPORTED_YEARS, type RegionCode } from "@/data/index.ts";
import { getNaspiConfig } from "@/domain/index.ts";
import { parseMoneyInput } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { percentText, type FieldError } from "@/islands/home/fields.ts";
import { useComuni } from "@/islands/home/useComune.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import { VISIBLE_NASPI_MONTHS } from "./derive.ts";
import NaspiChart from "./NaspiChart.tsx";
import { loadNaspiExplanations } from "./NaspiLedgers.tsx";
import { NaspiResult, reasonLines } from "./NaspiResult.tsx";
import { roundedToTen } from "./netEstimate.ts";
import {
  checkNetInputs,
  DEFAULT_NASPI_REGION,
  netDefaults,
  residenceOf,
  type NetField,
  type NetInputs,
} from "./netInputs.ts";
import { fullAmountMonths, naspiOutcome, parseWhole, type NaspiOutcome } from "./outcome.ts";
import type { NaspiErrorValue } from "./state.ts";
import { naspiValuesToVerify } from "./trust.ts";
import { useNaspiController } from "./useNaspiController.ts";
import { IDS } from "./viewIds.ts";

const netFields = preloadable(() => import("./NetEstimateFields.tsx"));
const NetEstimateFields = netFields.Component;

const TYPING_PAUSE_MS = 700;

type TextField = "gross" | "weeks" | "age" | "weeksAfter";
type ErrorField = TextField | NetField;
type ViewError = NaspiErrorValue | FieldError;
type ErrorMap = Partial<Record<ErrorField, ViewError>>;

interface Texts {
  readonly gross: string;
  readonly weeks: string;
  readonly age: string;
  readonly weeksAfter: string;
}

const TEXT_BY_NAME: Readonly<Record<string, TextField>> = {
  grossPay4Years: "gross",
  weeksContribution4Years: "weeks",
  age: "age",
  weeksAfterVoluntaryResignation: "weeksAfter",
};

function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(task, { timeout: 3000 });
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const timer = window.setTimeout(task, 1500);
  return () => {
    window.clearTimeout(timer);
  };
}

function withoutEmpty(errors: Readonly<Record<ErrorField, ViewError | undefined>>): ErrorMap {
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error !== undefined));
}

export function NaspiView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useNaspiController();
  const { state } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [texts, setTexts] = useState<Texts>(() => ({
    gross: tidyMoneyText(state.grossPay4Years, f.locale),
    weeks: String(state.weeksContribution4Years),
    age: String(state.age),
    weeksAfter: "",
  }));
  const [net, setNet] = useState<NetInputs>(() => netDefaults(f.locale));
  const [groupOpen, setGroupOpen] = useState(false);
  const [explained, setExplained] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [settled, setSettled] = useState(true);
  const [grossFocused, setGrossFocused] = useState(false);
  const [lastValid, setLastValid] = useState<NaspiOutcome | null>(null);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const comuni = useComuni(net.region, net.comune);

  const grossValue = parseMoneyInput(texts.gross, f.locale);
  const checkedNet = useMemo(() => checkNetInputs(net, f.locale), [net, f.locale]);
  const residence = residenceOf(net, comuni.selected, checkedNet.flatRate, state.year);
  const liveErrors = withoutEmpty({
    gross: texts.gross.trim() === "" ? undefined : controller.errors.grossPay4Years,
    weeks: controller.errors.weeksContribution4Years,
    age: controller.errors.age,
    weeksAfter: state.voluntaryResignationInLast12Months
      ? controller.errors.weeksAfterVoluntaryResignation
      : undefined,
    otherIncome: checkedNet.errors.otherIncome,
    municipalRate: checkedNet.errors.municipalRate,
  });
  const blurErrors = useBlurErrors<ErrorField, ViewError>(liveErrors);
  const grossEmpty =
    texts.gross.trim() === "" ||
    (liveErrors.gross === undefined && grossValue !== null && grossValue <= 0);
  const valid = Object.keys(liveErrors).length === 0 && !grossEmpty;
  const current = valid
    ? naspiOutcome(
        {
          year: state.year,
          gross: grossValue ?? 0,
          weeks: state.weeksContribution4Years,
          age: state.age,
          resigned: state.voluntaryResignationInLast12Months,
          weeksAfter: state.weeksAfterVoluntaryResignation,
          otherIncome: checkedNet.otherIncome,
          residence,
        },
        controller.result,
      )
    : null;

  useEffect(() => {
    return whenIdle(() => {
      void netFields.load();
      void loadNaspiExplanations();
    });
  }, []);

  useEffect(() => {
    if (settled) return undefined;
    const timer = window.setTimeout(() => {
      setSettled(true);
    }, TYPING_PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [texts, net, settled]);

  const keep = () => {
    setInteracted(true);
    setLastValid((previous) => current ?? previous);
  };

  const pushText = (field: TextField, text: string) => {
    if (field === "gross") controller.updateGrossPay4Years(text);
    if (field === "weeks") controller.updateWeeksContribution4Years(parseWhole(text) ?? Number.NaN);
    if (field === "age") controller.updateAge(parseWhole(text) ?? Number.NaN);
    if (field === "weeksAfter")
      controller.updateWeeksAfterVoluntaryResignation(parseWhole(text) ?? 0);
  };

  const updateText = (field: TextField, text: string) => {
    keep();
    setSettled(false);
    setTexts((previous) => ({ ...previous, [field]: text }));
    pushText(field, text);
  };

  const updateNet = (change: (previous: NetInputs) => NetInputs, typing = false) => {
    keep();
    if (typing) setSettled(false);
    setNet(change);
  };

  const {
    updateGrossPay4Years,
    updateWeeksContribution4Years,
    updateAge,
    updateWeeksAfterVoluntaryResignation,
    updateYear,
    updateVoluntaryResignationInLast12Months,
  } = controller;
  const adopt = useCallback(
    (name: string, value: FormControlValue) => {
      const field = TEXT_BY_NAME[name];
      if (field !== undefined && typeof value === "string") {
        setTexts((previous) => ({ ...previous, [field]: value }));
        if (field === "gross") updateGrossPay4Years(value);
        if (field === "weeks") updateWeeksContribution4Years(parseWhole(value) ?? Number.NaN);
        if (field === "age") updateAge(parseWhole(value) ?? Number.NaN);
        if (field === "weeksAfter") updateWeeksAfterVoluntaryResignation(parseWhole(value) ?? 0);
        return;
      }
      if (name === "voluntaryResignationInLast12Months") {
        updateVoluntaryResignationInLast12Months(value === true);
        return;
      }
      if (name === "year") {
        const year = SUPPORTED_YEARS.find((option) => String(option) === value);
        if (year !== undefined) updateYear(year);
      }
    },
    [
      updateGrossPay4Years,
      updateWeeksContribution4Years,
      updateAge,
      updateWeeksAfterVoluntaryResignation,
      updateYear,
      updateVoluntaryResignationInLast12Months,
    ],
  );
  useHydratedFormValues(containerRef, adopt);

  const shownErrors = blurErrors.shown;
  const errorText = (field: ErrorField): string | undefined => {
    const error = shownErrors[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const staleVisible =
    current === null && lastValid !== null && (Object.keys(shownErrors).length > 0 || settled);
  const figureState: FigureState = grossEmpty
    ? "empty"
    : current !== null
      ? "ready"
      : lastValid === null
        ? "empty"
        : staleVisible
          ? "stale"
          : "ready";
  const outcome = current ?? lastValid;
  const prompt = t(grossEmpty ? "naspi.result.empty" : "naspi.result.fix");
  const staleNote = t("naspi.result.stale");
  const eligible = outcome?.breakdown.eligible ?? true;
  const figureReady = figureState === "ready" && outcome !== null && eligible;
  const barVisible = useBottomBarVisible(figureValue, figureReady);

  const announcementText = (): string | null => {
    if (!interacted) return null;
    if (figureState === "empty") return prompt;
    if (figureState === "stale") return staleNote;
    if (outcome === null) return null;
    const { breakdown, schedule } = outcome;
    if (!breakdown.eligible || schedule === null) {
      const min = getNaspiConfig(outcome.facts.year).minWeeks;
      return t("naspi.result.announce.none", { reason: reasonLines(outcome, min, t).join(" ") });
    }
    const full = fullAmountMonths(breakdown);
    return t("naspi.result.announce", {
      amount: f.money(breakdown.monthlyAmount),
      basis:
        full >= breakdown.durationMonths
          ? t("naspi.result.basis.all", { months: breakdown.durationMonths })
          : t("naspi.result.basis.first", { months: full }),
      net: f.whole(roundedToTen(schedule.rows[0]?.net ?? 0)),
      total: f.money(schedule.grossTotal),
    });
  };
  const announcement = useSettledAnnouncement(announcementText());

  const verified = useMemo(() => verifiedLine(f.locale), [f.locale]);
  const pending = naspiValuesToVerify(
    outcome?.facts.year ?? state.year,
    eligible ? (outcome?.facts.residence.region ?? net.region) : null,
  );

  const readAs = t("naspi.gross.readAs", { amount: f.money(grossValue ?? 0) });
  const weeksForAverage = parseWhole(texts.weeks);
  const grossAfter = ((): FieldMessages => {
    if (grossValue === null || grossValue <= 0 || shownErrors.gross !== undefined) return {};
    const monthly =
      weeksForAverage === null || !Number.isFinite(weeksForAverage) || weeksForAverage <= 0
        ? null
        : t("naspi.gross.monthly", {
            amount: f.money(
              (grossValue / weeksForAverage) * getNaspiConfig(state.year).weeklyToMonthlyCoef,
            ),
            weeks: weeksForAverage,
          });
    if (!grossFocused) return monthly === null ? {} : { after: monthly, afterTone: "quiet" };
    if (monthly === null) return { after: readAs, afterTone: "quiet" };
    return settled
      ? { after: monthly, afterTone: "quiet", afterReserve: [readAs] }
      : { after: readAs, afterTone: "quiet", afterReserve: [monthly] };
  })();

  const recap = t("naspi.net.recap", {
    other:
      checkedNet.otherIncome > 0
        ? t("naspi.net.recap.other", { amount: f.money(checkedNet.otherIncome), year: state.year })
        : t("naspi.net.recap.noOther", { year: state.year }),
    residence:
      residence.comune === null
        ? t("naspi.net.recap.rate", {
            region: regions.name(net.region),
            rate: f.percent(residence.flatRate),
          })
        : t("naspi.net.recap.comune", {
            comune: residence.comune.name,
            region: regions.name(net.region),
          }),
  });
  const recapSet =
    checkedNet.otherIncome > 0 ||
    net.comune !== null ||
    net.manual ||
    net.region !== DEFAULT_NASPI_REGION;

  const onFieldBlur = (field: ErrorField) => {
    blurErrors.onBlur(field);
  };

  const primary = (
    <>
      <RadioGroup
        idPrefix={IDS.year}
        name="year"
        legend={t("naspi.year.legend")}
        hint={t("naspi.year.hint")}
        layout="fill"
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year === undefined) return;
          keep();
          controller.updateYear(year);
        }}
      />
      <Field
        id={IDS.gross}
        label={t("naspi.gross.label")}
        labelSuffix={t("field.unit.euro")}
        hint={t("naspi.gross.hint")}
        error={errorText("gross")}
        {...grossAfter}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="grossPay4Years"
            value={texts.gross}
            onValueChange={(value) => {
              updateText("gross", value);
            }}
            onFocus={() => {
              setGrossFocused(true);
              blurErrors.onFocus();
            }}
            onBlur={() => {
              afterPointerRelease(() => {
                setGrossFocused(false);
                setSettled(true);
              });
              onFieldBlur("gross");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.weeks}
        label={t("naspi.weeks.label")}
        hint={t("naspi.weeks.hint")}
        error={errorText("weeks")}
      >
        {(control) => (
          <div className="qg-field__row">
            <NumberInput
              {...control}
              kind="integer"
              name="weeksContribution4Years"
              value={texts.weeks}
              onValueChange={(value) => {
                updateText("weeks", value);
              }}
              onFocus={blurErrors.onFocus}
              onBlur={() => {
                onFieldBlur("weeks");
              }}
            />
            <span className="qg-input__suffix" aria-hidden="true">
              {t("naspi.weeks.unit")}
            </span>
          </div>
        )}
      </Field>
      <Field
        id={IDS.age}
        label={t("naspi.age.label")}
        labelSuffix={t("naspi.age.hiddenUnit")}
        hint={t("naspi.age.hint")}
        error={errorText("age")}
      >
        {(control) => (
          <div className="qg-field__row">
            <NumberInput
              {...control}
              kind="integer"
              name="age"
              value={texts.age}
              onValueChange={(value) => {
                updateText("age", value);
              }}
              onFocus={blurErrors.onFocus}
              onBlur={() => {
                onFieldBlur("age");
              }}
            />
            <span className="qg-input__suffix" aria-hidden="true">
              {t("naspi.age.unit")}
            </span>
          </div>
        )}
      </Field>
      <Checkbox
        id={IDS.resigned}
        name="voluntaryResignationInLast12Months"
        label={t("naspi.resigned.label")}
        hint={t("naspi.resigned.hint")}
        checked={state.voluntaryResignationInLast12Months}
        onCheckedChange={(checked) => {
          keep();
          controller.updateVoluntaryResignationInLast12Months(checked);
        }}
      >
        <Field
          id={IDS.weeksAfter}
          label={t("naspi.weeksAfter.label")}
          hint={t("naspi.weeksAfter.hint")}
          error={errorText("weeksAfter")}
        >
          {(control) => (
            <div className="qg-field__row">
              <NumberInput
                {...control}
                kind="integer"
                name="weeksAfterVoluntaryResignation"
                value={texts.weeksAfter}
                onValueChange={(value) => {
                  updateText("weeksAfter", value);
                }}
                onFocus={blurErrors.onFocus}
                onBlur={() => {
                  onFieldBlur("weeksAfter");
                }}
              />
              <span className="qg-input__suffix" aria-hidden="true">
                {t("naspi.weeks.unit")}
              </span>
            </div>
          )}
        </Field>
      </Checkbox>
    </>
  );

  const rest = eligible ? (
    <section className="qg-section" aria-labelledby={IDS.extrasHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.extrasHeading}>
          {t("naspi.extras.title")}
        </h2>
        <p className="qg-section__hint">{t("naspi.extras.hint")}</p>
      </div>
      <DetailsGroupList>
        <DetailsGroup
          id={IDS.netGroup}
          title={t("naspi.net.title")}
          recap={recap}
          recapSet={recapSet}
          open={groupOpen}
          onOpenChange={setGroupOpen}
        >
          {groupOpen && (
            <ClientSuspense fallback={null}>
              <NetEstimateFields
                year={state.year}
                inputs={net}
                list={comuni.list}
                selection={comuni.selected}
                otherIncomeError={errorText("otherIncome")}
                municipalRateError={errorText("municipalRate")}
                onOtherIncomeChange={(text) => {
                  updateNet((previous) => ({ ...previous, otherIncome: text }), true);
                }}
                onRegionChange={(region: RegionCode) => {
                  updateNet((previous) => ({ ...previous, region, comune: null }));
                }}
                onComuneChange={(id) => {
                  updateNet((previous) => ({ ...previous, comune: id }));
                }}
                onSwitchRegion={(region, id) => {
                  updateNet((previous) => ({ ...previous, region, comune: id }));
                }}
                onManualChange={(manual) => {
                  updateNet((previous) => {
                    if (manual) {
                      const rule = residence.comune?.rule;
                      return {
                        ...previous,
                        manual,
                        comuneBeforeManual: previous.comune,
                        municipalRate:
                          rule?.rate === undefined
                            ? previous.municipalRate
                            : percentText(rule.rate / 100, f.locale),
                      };
                    }
                    return {
                      ...previous,
                      manual,
                      comune: previous.comune ?? previous.comuneBeforeManual,
                    };
                  });
                }}
                onManualRateChange={(text) => {
                  updateNet(
                    (previous) => ({
                      ...previous,
                      municipalRate: text,
                      comune: null,
                      comuneBeforeManual: previous.comune ?? previous.comuneBeforeManual,
                    }),
                    true,
                  );
                }}
                onLoadComuni={comuni.load}
                onFieldFocus={blurErrors.onFocus}
                onFieldBlur={onFieldBlur}
              />
            </ClientSuspense>
          )}
        </DetailsGroup>
      </DetailsGroupList>
    </section>
  ) : undefined;

  const showChart = outcome !== null && eligible && figureState !== "empty";

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("naspi.title")}
        lede={t("naspi.lede", {
          first: SUPPORTED_YEARS[0] ?? state.year,
          last: SUPPORTED_YEARS.at(-1) ?? state.year,
        })}
      />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <NaspiResult
            outcome={outcome}
            figureState={figureState}
            prompt={prompt}
            staleNote={staleNote}
            announcement={announcement}
            verified={verified === null ? null : { ...verified, pending }}
            f={f}
            regions={regions}
            explained={explained}
            onExplainedChange={setExplained}
            valueRef={setFigureValue}
          />
        }
        {...(rest === undefined ? {} : { rest })}
      />
      {showChart && (
        <NaspiChart
          outcome={outcome}
          f={f}
          showAll={controller.showAllMonths}
          visibleMonths={VISIBLE_NASPI_MONTHS}
          onShowAll={() => {
            flushSync(() => {
              controller.revealAllMonths();
            });
            document.getElementById(IDS.table)?.focus();
          }}
        />
      )}
      <Topics
        headingId={IDS.topicsHeading}
        title={t("naspi.topics.title")}
        topics={[
          {
            id: "chi-ha-diritto",
            summary: t("naspi.topic.who"),
            body: <p>{t("naspi.topic.who.body")}</p>,
          },
          {
            id: "durata",
            summary: t("naspi.topic.duration"),
            body: <p>{t("naspi.topic.duration.body")}</p>,
          },
          { id: "irpef", summary: t("naspi.topic.tax"), body: <p>{t("naspi.topic.tax.body")}</p> },
          {
            id: "lavoro",
            summary: t("naspi.topic.work"),
            body: <p>{t("naspi.topic.work.body")}</p>,
          },
        ]}
      />
      {figureReady && (
        <BottomBar
          label={t("naspi.bar.label")}
          value={f.money(outcome.breakdown.monthlyAmount)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
