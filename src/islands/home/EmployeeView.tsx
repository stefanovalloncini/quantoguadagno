import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ComuneField } from "@/components/form/ComuneField.tsx";
import { afterMessages, amountAfter, useTyping } from "@/components/form/amountAfter.ts";
import { Field, FieldAlt } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import type { FigureState } from "@/components/result/ResultFigure.tsx";
import {
  comunaleRuleFor,
  latestVerification,
  SUPPORTED_YEARS,
  type RegionCode,
} from "@/data/index.ts";
import { formatDate, parseDecimal } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { INVERSE_PARAMS } from "@/queryParams.ts";
import { hrefFor } from "@/routePaths.ts";
import { ExtrasFields, loadGroupFields } from "./ExtrasFields.tsx";
import { InsightsSection } from "./InsightsSection.tsx";
import type { MunicipalMode } from "./ledgerRows.tsx";
import { loadExplainedLedger, ResultPanel } from "./ResultPanel.tsx";
import {
  DEFAULT_MUNICIPAL_RATE,
  type EmployeeErrors,
  type EmployeeField,
  type EmployeeState,
  type EmployeeTextField,
} from "./state.ts";
import { groupRecaps, type Assumption } from "./summaries.ts";
import { valuesToVerify } from "./trust.ts";
import { percentText } from "./fields.ts";
import { employeeToQuery } from "./url.ts";
import type { ComuneLookup } from "./useComune.ts";
import { useComuneRestoreHold } from "./useComuneRestoreHold.ts";
import { useEmployeeController, type EmployeeUpdate } from "./useEmployeeController.ts";
import { useViewFormat } from "./viewFormat.tsx";
import { IDS, VIEW_GROUPS, type ViewGroup } from "./viewIds.ts";

const INVERSE_CONTEXT_KEYS = Object.keys(INVERSE_PARAMS).filter((key) => key !== "n");
const CLOSED_GROUPS = Object.fromEntries(VIEW_GROUPS.map((group) => [group, false])) as Record<
  ViewGroup,
  boolean
>;

function rateDiffersFromDefault(text: string, state: EmployeeState, locale: "it" | "en"): boolean {
  const percent = parseDecimal(text.trim().replace(/\s*%$/, ""), locale);
  return (
    state.comune === null &&
    percent !== null &&
    Math.abs(percent / 100 - DEFAULT_MUNICIPAL_RATE) > 1e-9
  );
}

const FOCUS_ATTEMPTS = 30;

function flatRateOf(lookup: ComuneLookup, year: number): number | null {
  if (lookup.status !== "ready") return null;
  const found = comunaleRuleFor(lookup.comune, year);
  if (found?.rule.rate === undefined) return null;
  return found.rule.rate / 100;
}

function focusWhenPresent(id: string, attempt = 0): void {
  const element = document.getElementById(id);
  if (element !== null) {
    element.focus();
    return;
  }
  if (attempt < FOCUS_ATTEMPTS) {
    window.requestAnimationFrame(() => {
      focusWhenPresent(id, attempt + 1);
    });
  }
}

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

function prefetchOnDemandParts(): void {
  void loadGroupFields();
  void loadExplainedLedger();
}

function verifiedLine(locale: "it" | "en") {
  const date = latestVerification();
  if (date === null) return null;
  return { date: formatDate(new Date(date), locale), href: hrefFor("sources", locale) };
}

export function EmployeeView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useEmployeeController();
  const { state, result, stale, derived, hints, links } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<ViewGroup, boolean>>(CLOSED_GROUPS);
  const [manualChoice, setManualChoice] = useState<boolean | null>(null);
  const [comuneBeforeManual, setComuneBeforeManual] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const typing = useTyping(state.gross);
  const grossSettled = typing.settled;
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const blurErrors = useBlurErrors<
    EmployeeField,
    NonNullable<(typeof controller.errors)[EmployeeField]>
  >(controller.errors);
  const grossEmpty = state.gross.trim() === "";
  const shown = useMemo<EmployeeErrors>(
    () =>
      grossEmpty
        ? Object.fromEntries(
            Object.entries(blurErrors.shown).filter(([field]) => field !== "gross"),
          )
        : blurErrors.shown,
    [blurErrors.shown, grossEmpty],
  );

  useHydratedFormValues(containerRef, controller.adoptField);
  useComuneRestoreHold(state.comune, controller.comune);

  useEffect(() => whenIdle(prefetchOnDemandParts), []);

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = (Object.keys(controller.errors) as EmployeeField[]).filter(
      (field) => field !== "gross" || !grossEmpty,
    );
    if (fromLink.length > 0) touchFields(fromLink);
  }, [controller.errors, interacted, grossEmpty, touchFields]);

  const controllerUpdate = controller.update;
  const update = useCallback<EmployeeUpdate>(
    (field, value) => {
      setInteracted(true);
      controllerUpdate(field, value);
    },
    [controllerUpdate],
  );

  const manual = manualChoice ?? rateDiffersFromDefault(state.municipalRate, state, f.locale);
  const municipalMode: MunicipalMode =
    state.comune !== null ? "comune" : manual ? "manual" : "none";
  const shownFields = Object.keys(shown).filter(
    (field) => shown[field as EmployeeField] !== undefined,
  );
  const liveErrorFields = Object.keys(controller.errors).filter(
    (field) => field !== "gross" || !grossEmpty,
  );
  const staleVisible =
    stale && liveErrorFields.length > 0 && (shownFields.length > 0 || grossSettled);
  const figureState: FigureState =
    grossEmpty || result === null ? "empty" : staleVisible ? "stale" : "ready";
  const figureReady = figureState === "ready" && result !== null;
  const barVisible = useBottomBarVisible(figureValue, figureReady);

  const staleNote =
    controller.errors.gross !== undefined && result !== null
      ? t("employee.result.staleGross", { gross: f.money(result.input.grossAnnual) })
      : t("employee.result.staleOther");
  const prompt = t(grossEmpty ? "employee.result.empty" : "employee.result.fix");

  const errorText = (field: EmployeeField): string | undefined => {
    const error = shown[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };

  const goTo = useCallback((targetId: string, group: ViewGroup | undefined) => {
    if (group !== undefined) {
      flushSync(() => {
        setOpenGroups((previous) => ({ ...previous, [group]: true }));
      });
    }
    focusWhenPresent(targetId);
  }, []);

  const onAssumptionChange = (item: Assumption) => {
    goTo(item.targetId, item.group);
  };

  const grossAfter =
    shown.gross === undefined
      ? amountAfter({
          raw: state.gross,
          typing,
          count: state.paymentFrequency,
          keyPrefix: "employee.gross",
          t,
          f,
        })
      : null;

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "empty"
        ? prompt
        : figureState === "stale"
          ? staleNote
          : result === null
            ? null
            : [
                t("employee.result.announce", {
                  amount: f.money(result.breakdown.netMonthly),
                  count: result.values.paymentFrequency,
                }),
                ...(grossAfter?.tone === "note" ? [grossAfter.text] : []),
              ].join(" "),
  );

  const sharedQuery = employeeToQuery(state, f.locale);
  const inverseHref = hrefFor(
    "inverse",
    f.locale,
    Object.fromEntries(INVERSE_CONTEXT_KEYS.map((key) => [key, sharedQuery[key]])),
  );
  const checked = useMemo(() => verifiedLine(f.locale), [f.locale]);
  const pending = useMemo(() => (result === null ? 0 : valuesToVerify(result.values)), [result]);
  const verified = checked === null ? null : { ...checked, pending };
  const recaps =
    result === null
      ? null
      : groupRecaps(result.values, derived?.groups ?? activeFallback, {
          t,
          f,
          regions,
          municipalMode,
        });

  const onFieldBlur = (field: EmployeeTextField) => {
    blurErrors.onBlur(field);
  };

  const primary = (
    <>
      <Field
        id={IDS.gross}
        label={t("employee.gross.label")}
        labelSuffix={t("field.unit.euro")}
        hint={t("employee.gross.hint")}
        error={errorText("gross")}
        {...afterMessages(grossAfter)}
        alt={
          <FieldAlt>
            {t("employee.gross.netQuestion")}{" "}
            <a href={inverseHref}>{t("employee.gross.netLink")}</a>
          </FieldAlt>
        }
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="gross"
            value={state.gross}
            onValueChange={(value) => {
              typing.onType();
              update("gross", value);
            }}
            onFocus={() => {
              typing.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              typing.onBlur();
              blurErrors.onBlur("gross");
            }}
          />
        )}
      </Field>
      <RadioGroup
        idPrefix={IDS.year}
        name="year"
        legend={t("employee.year.legend")}
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year !== undefined) update("year", year);
        }}
      />
      <Field id={IDS.region} label={t("employee.region.label")}>
        {(control) => (
          <Select<RegionCode>
            {...control}
            name="region"
            value={state.region}
            options={regions.options}
            onValueChange={(value) => {
              update("region", value);
            }}
          />
        )}
      </Field>
    </>
  );

  const comuneField = (
    <ComuneField
      id={IDS.comune}
      rateId={IDS.municipalRate}
      region={state.region}
      year={state.year}
      list={controller.comuni}
      selection={controller.comune}
      manual={manual}
      manualRate={state.municipalRate}
      manualRateError={errorText("municipalRate")}
      onLoad={controller.loadComuni}
      onSelect={(id) => {
        update("comune", id);
      }}
      onSwitchRegion={(region, id) => {
        update("region", region);
        update("comune", id);
      }}
      onManualChange={(next) => {
        setManualChoice(next);
        if (next) {
          setComuneBeforeManual(state.comune);
          const flat = flatRateOf(controller.comune, state.year);
          if (flat !== null) controllerUpdate("municipalRate", percentText(flat, f.locale));
        } else if (state.comune === null && comuneBeforeManual !== null) {
          update("comune", comuneBeforeManual);
        }
      }}
      onManualRateChange={(value) => {
        update("municipalRate", value);
        if (state.comune !== null) update("comune", null);
      }}
      onManualRateFocus={blurErrors.onFocus}
      onManualRateBlur={() => {
        blurErrors.onBlur("municipalRate");
      }}
    />
  );

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("employee.title")}
        lede={t("employee.lede", {
          first: SUPPORTED_YEARS[0] ?? state.year,
          last: SUPPORTED_YEARS.at(-1) ?? state.year,
        })}
      />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        restLabelledBy={IDS.extrasHeading}
        primary={primary}
        result={
          <ResultPanel
            result={result}
            figureState={figureState}
            staleNote={staleNote}
            prompt={prompt}
            municipalMode={municipalMode}
            links={links}
            announcement={announcement}
            verified={verified}
            regions={regions}
            f={f}
            valueRef={setFigureValue}
            onChange={onAssumptionChange}
          />
        }
        rest={
          <>
            <div className="qg-section__intro">
              <h2 className="qg-heading" id={IDS.extrasHeading}>
                {t("employee.extras.title")}
              </h2>
              <p className="qg-section__hint">{t("employee.extras.hint")}</p>
            </div>
            {recaps === null ? (
              comuneField
            ) : (
              <ExtrasFields
                state={state}
                hints={hints}
                notices={derived?.notices ?? null}
                recaps={recaps}
                errors={shown}
                open={openGroups}
                f={f}
                comuneField={comuneField}
                onOpenChange={(group, open) => {
                  setOpenGroups((previous) => ({ ...previous, [group]: open }));
                }}
                update={update}
                onFieldFocus={blurErrors.onFocus}
                onFieldBlur={onFieldBlur}
              />
            )}
          </>
        }
      />
      {result !== null && derived !== null && figureState !== "empty" && (
        <InsightsSection result={result} derived={derived} f={f} />
      )}
      {result !== null && (
        <BottomBar
          label={t("employee.result.label")}
          value={f.money(result.breakdown.netMonthly)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}

const activeFallback = {
  contract: false,
  dependents: false,
  expenses: false,
  specialConditions: false,
  premio: false,
  fringe: false,
};
