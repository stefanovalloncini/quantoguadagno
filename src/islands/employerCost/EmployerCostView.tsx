import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ComuneField } from "@/components/form/ComuneField.tsx";
import { DetailsGroup, DetailsGroupList } from "@/components/form/DetailsGroup.tsx";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { regionSelectKey, useRegionText } from "@/components/form/regionText.ts";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import type { AssumptionItem } from "@/components/result/Assumptions.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import type { FigureState } from "@/components/result/ResultFigure.tsx";
import { SUPPORTED_YEARS, type RegionCode } from "@/data/index.ts";
import type { ContractType } from "@/domain/employerCostCalculations.ts";
import { useT } from "@/i18n/react.tsx";
import {
  CONTRACT_TYPES,
  DEFAULT_PAYMENT_FREQUENCY,
  DEFAULT_REGION,
  PAYMENT_FREQUENCIES,
} from "@/islands/home/choices.ts";
import { useComuneRestoreHold } from "@/islands/home/useComuneRestoreHold.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { afterMessages, amountAfter, useTyping } from "@/components/form/amountAfter.ts";
import { focusWhenPresent } from "@/islands/inverse/focusWhenPresent.ts";
import { localAssumptionItem, useLocalTax } from "@/islands/inverse/localTax.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { hrefFor } from "@/routePaths.ts";
import { EmployerCostResult } from "./EmployerCostResult.tsx";
import type { EmployerCostErrors, EmployerCostField } from "./state.ts";
import { employerCostToQuery } from "./url.ts";
import { useEmployerCostController, type EmployerCostUpdate } from "./useEmployerCostController.ts";
import { IDS } from "./viewIds.ts";

const NET_ASSUMPTIONS: ReadonlySet<string> = new Set(["region", "comune", "frequency"]);

export function EmployerCostView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useEmployerCostController();
  const { state, result, stale, derived } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);
  const [netOpen, setNetOpen] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const typing = useTyping(state.gross);
  const blurErrors = useBlurErrors<
    EmployerCostField,
    NonNullable<EmployerCostErrors[EmployerCostField]>
  >(controller.errors);
  const grossEmpty = state.gross.trim() === "";
  const liveErrorFields = (Object.keys(controller.errors) as EmployerCostField[]).filter(
    (field) => field !== "gross" || !grossEmpty,
  );
  const shown = useMemo<EmployerCostErrors>(
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

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = (Object.keys(controller.errors) as EmployerCostField[]).filter(
      (field) => field !== "gross" || !grossEmpty,
    );
    if (fromLink.length > 0) touchFields(fromLink);
  }, [controller.errors, interacted, grossEmpty, touchFields]);

  const controllerUpdate = controller.update;
  const update = useCallback<EmployerCostUpdate>(
    (field, value) => {
      setInteracted(true);
      controllerUpdate(field, value);
    },
    [controllerUpdate],
  );

  const local = useLocalTax(state, controller.comune, f.locale, {
    region: (region) => {
      update("region", region);
    },
    comune: (id) => {
      update("comune", id);
    },
    municipalRate: (text) => {
      update("municipalRate", text);
    },
  });

  const staleVisible =
    stale && liveErrorFields.length > 0 && (Object.keys(shown).length > 0 || typing.settled);
  const figureState: FigureState =
    grossEmpty || result === null ? "empty" : staleVisible ? "stale" : "ready";
  const barVisible = useBottomBarVisible(figureValue, figureState === "ready" && derived !== null);

  const staleNote =
    controller.errors.gross !== undefined && result !== null
      ? t("employerCost.result.staleGross", { gross: f.money(result.values.grossAnnual) })
      : t("employerCost.result.staleOther");
  const prompt = t(grossEmpty ? "employerCost.result.empty" : "employerCost.result.fix");

  const netError = shown.municipalRate !== undefined;
  const [openedForError, setOpenedForError] = useState(false);
  if (netError !== openedForError) {
    setOpenedForError(netError);
    if (netError) setNetOpen(true);
  }

  const errorText = (field: EmployerCostField): string | undefined => {
    const error = shown[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };

  const after =
    shown.gross === undefined
      ? amountAfter({
          raw: state.gross,
          typing,
          count: state.paymentFrequency,
          keyPrefix: "employerCost.gross",
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
          : derived === null
            ? null
            : [
                t("employerCost.result.announce", {
                  amount: f.money(derived.ledger.total),
                  gross: f.money(derived.grossAnnual),
                }),
                ...(after?.tone === "note" ? [after.text] : []),
              ].join(" "),
  );

  const query = employerCostToQuery(state, f.locale);
  const printHref = hrefFor("printPayslip", f.locale, {
    ...query,
    l: result === null ? query.l : Math.round(result.values.grossAnnual),
  });

  const costAssumptions: readonly AssumptionItem[] =
    result === null
      ? []
      : [
          {
            id: "year",
            text: t("employerCost.assumption.year", { year: result.values.taxYear }),
            changeLabel: t("employerCost.change.year"),
            targetId: `${IDS.year}-${String(result.values.taxYear)}`,
          },
          {
            id: "contract",
            text: t("employerCost.assumption.contract", { type: result.values.contractType }),
            changeLabel: t("employerCost.change.contract"),
            targetId: IDS.contract,
          },
        ];
  const netAssumptions: readonly AssumptionItem[] =
    result === null
      ? []
      : [
          {
            id: "region",
            text: t("employerCost.assumption.region", {
              region: regionSelectKey(result.values.regionCode),
              name: regions.name(result.values.regionCode),
            }),
            changeLabel: t("employerCost.change.region"),
            targetId: IDS.region,
          },
          localAssumptionItem(
            result.municipal,
            local.mode,
            { comune: IDS.comune, municipalRate: IDS.municipalRate },
            "employerCost",
            t,
            f,
          ),
          {
            id: "frequency",
            text: t("employerCost.assumption.frequency", {
              count: result.values.paymentFrequency,
            }),
            changeLabel: t("employerCost.change.frequency"),
            targetId: `${IDS.frequency}-${String(result.values.paymentFrequency)}`,
          },
        ];

  const primary = (
    <>
      <Field
        id={IDS.gross}
        label={t("employerCost.gross.label")}
        labelSuffix={t("field.unit.euro")}
        hint={t("employerCost.gross.hint")}
        error={errorText("gross")}
        {...afterMessages(after)}
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
        legend={t("employerCost.year.legend")}
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year !== undefined) update("year", year);
        }}
      />
      <Field id={IDS.contract} label={t("employerCost.contract.label")}>
        {(control) => (
          <Select<ContractType>
            {...control}
            name="contractType"
            value={state.contractType}
            options={CONTRACT_TYPES.map((type) => ({
              value: type,
              label: t(`employerCost.contract.${type}`),
            }))}
            onValueChange={(value) => {
              update("contractType", value);
            }}
          />
        )}
      </Field>
    </>
  );

  const netRecap = [
    regions.name(result?.values.regionCode ?? state.region),
    result?.municipal.kind === "comune"
      ? result.municipal.comune.name
      : result?.municipal.kind === "manual" && local.mode === "manual"
        ? t("employerCost.recap.rateManual", { rate: f.percent(result.municipal.rate) })
        : t("employerCost.recap.rateDefault"),
    t("employerCost.assumption.frequency", {
      count: result?.values.paymentFrequency ?? state.paymentFrequency,
    }),
  ].join(", ");
  const netRecapSet =
    state.region !== DEFAULT_REGION ||
    local.mode !== "none" ||
    state.paymentFrequency !== DEFAULT_PAYMENT_FREQUENCY;

  const rest = (
    <section className="qg-section" aria-labelledby={IDS.extrasHeading}>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.extrasHeading}>
          {t("employerCost.extras.title")}
        </h2>
        <p className="qg-section__hint">{t("employerCost.extras.hint")}</p>
      </div>
      <DetailsGroupList>
        <DetailsGroup
          id={IDS.netGroup}
          title={t("employerCost.group.net")}
          recap={netRecap}
          recapSet={netRecapSet}
          open={netOpen}
          onOpenChange={setNetOpen}
        >
          <Field id={IDS.region} label={t("employerCost.region.label")}>
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
          <ComuneField
            id={IDS.comune}
            rateId={IDS.municipalRate}
            region={state.region}
            year={state.year}
            list={controller.comuni}
            selection={controller.comune}
            manual={local.manual}
            manualRate={state.municipalRate}
            manualRateError={errorText("municipalRate")}
            onLoad={controller.loadComuni}
            onSelect={(id) => {
              update("comune", id);
            }}
            onSwitchRegion={local.onSwitchRegion}
            onManualChange={local.onManualChange}
            onManualRateChange={local.onManualRateChange}
            onManualRateFocus={blurErrors.onFocus}
            onManualRateBlur={() => {
              blurErrors.onBlur("municipalRate");
            }}
          />
          <RadioGroup
            idPrefix={IDS.frequency}
            name="paymentFrequency"
            legend={t("employerCost.frequency.legend")}
            hint={t("employerCost.frequency.hint")}
            layout="fill"
            value={String(state.paymentFrequency)}
            options={PAYMENT_FREQUENCIES.map((count) => ({
              value: String(count),
              label: String(count),
            }))}
            onValueChange={(value) => {
              const count = PAYMENT_FREQUENCIES.find((option) => String(option) === value);
              if (count !== undefined) update("paymentFrequency", count);
            }}
          />
        </DetailsGroup>
      </DetailsGroupList>
    </section>
  );

  const onAssumptionChange = (item: AssumptionItem) => {
    if (NET_ASSUMPTIONS.has(item.id)) {
      flushSync(() => {
        setNetOpen(true);
      });
    }
    focusWhenPresent(item.targetId);
  };

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("employerCost.title")}
        lede={t("employerCost.lede", {
          first: SUPPORTED_YEARS[0] ?? state.year,
          last: SUPPORTED_YEARS.at(-1) ?? state.year,
        })}
      />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <EmployerCostResult
            result={result}
            derived={derived}
            figureState={figureState}
            staleNote={staleNote}
            prompt={prompt}
            costAssumptions={costAssumptions}
            netAssumptions={netAssumptions}
            printHref={printHref}
            announcement={announcement}
            f={f}
            valueRef={setFigureValue}
            onChange={onAssumptionChange}
          />
        }
        rest={rest}
      />
      {derived !== null && (
        <BottomBar
          label={t("employerCost.result.label")}
          value={f.money(derived.ledger.total)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
