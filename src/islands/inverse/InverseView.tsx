import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComuneField } from "@/components/form/ComuneField.tsx";
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
import { SUPPORTED_YEARS, type RegionCode } from "@/data/index.ts";
import { useT } from "@/i18n/react.tsx";
import { PAYMENT_FREQUENCIES } from "@/islands/home/choices.ts";
import { useComuneRestoreHold } from "@/islands/home/useComuneRestoreHold.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import type { QueryValues } from "@/islands/runtime/query.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { hrefFor } from "@/routePaths.ts";
import { afterMessages, amountAfter, useTyping } from "@/components/form/amountAfter.ts";
import { ContractGroup } from "./ContractGroup.tsx";
import { InverseResult } from "./InverseResult.tsx";
import { useLocalTax } from "./localTax.ts";
import type { InverseErrors, InverseField } from "./state.ts";
import { inverseToQuery } from "./url.ts";
import { useInverseController, type InverseUpdate } from "./useInverseController.ts";
import { IDS } from "./viewIds.ts";

export function InverseView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useInverseController();
  const { state, result, stale, derived } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [contractOpen, setContractOpen] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const typing = useTyping(state.targetNetAnnual);
  const blurErrors = useBlurErrors<InverseField, NonNullable<InverseErrors[InverseField]>>(
    controller.errors,
  );
  const targetEmpty = state.targetNetAnnual.trim() === "";
  const liveErrorFields = (Object.keys(controller.errors) as InverseField[]).filter(
    (field) => field !== "targetNetAnnual" || !targetEmpty,
  );
  const shown = useMemo<InverseErrors>(
    () =>
      targetEmpty
        ? Object.fromEntries(
            Object.entries(blurErrors.shown).filter(([field]) => field !== "targetNetAnnual"),
          )
        : blurErrors.shown,
    [blurErrors.shown, targetEmpty],
  );

  useHydratedFormValues(containerRef, controller.adoptField);
  useComuneRestoreHold(state.comune, controller.comune);

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = (Object.keys(controller.errors) as InverseField[]).filter(
      (field) => field !== "targetNetAnnual" || !targetEmpty,
    );
    if (fromLink.length > 0) touchFields(fromLink);
  }, [controller.errors, interacted, targetEmpty, touchFields]);

  const controllerUpdate = controller.update;
  const update = useCallback<InverseUpdate>(
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

  const shownFields = Object.keys(shown);
  const staleVisible =
    stale && liveErrorFields.length > 0 && (shownFields.length > 0 || typing.settled);
  const figureState: FigureState =
    targetEmpty || result === null ? "empty" : staleVisible ? "stale" : "ready";
  const barVisible = useBottomBarVisible(figureValue, figureState === "ready" && result !== null);

  const staleNote =
    controller.errors.targetNetAnnual !== undefined && result !== null
      ? t("inverse.result.staleTarget", { amount: f.money(result.values.targetNetAnnual) })
      : t("inverse.result.staleOther");
  const prompt = t(targetEmpty ? "inverse.result.empty" : "inverse.result.fix");

  const errorText = (field: InverseField): string | undefined => {
    const error = shown[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };

  const after =
    shown.targetNetAnnual === undefined
      ? amountAfter({
          raw: state.targetNetAnnual,
          typing,
          count: state.paymentFrequency,
          keyPrefix: "inverse.target",
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
                t("inverse.result.announce", {
                  amount: f.money(result.breakdown.grossAnnual),
                  target: f.money(result.values.targetNetAnnual),
                }),
                ...(after?.tone === "note" ? [after.text] : []),
              ].join(" "),
  );

  const context: QueryValues = { ...inverseToQuery(state, f.locale), n: undefined };
  const gross = result === null ? null : Math.round(result.breakdown.grossAnnual);
  const links = {
    print: hrefFor("printPayslip", f.locale, { ...context, l: gross }),
    employerCost: hrefFor("employerCost", f.locale, {
      l: gross,
      y: context.y,
      t: context.t,
      r: context.r,
      k: context.k,
      c: context.c,
      m: context.m,
    }),
  };

  const primary = (
    <>
      <Field
        id={IDS.target}
        label={t("inverse.target.label")}
        labelSuffix={t("field.unit.euro")}
        hint={t("inverse.target.hint")}
        error={errorText("targetNetAnnual")}
        {...afterMessages(after)}
        alt={
          <FieldAlt>
            {t("inverse.target.grossQuestion")}{" "}
            <a href={hrefFor("home", f.locale, context)}>{t("inverse.target.grossLink")}</a>
          </FieldAlt>
        }
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="targetNetAnnual"
            value={state.targetNetAnnual}
            onValueChange={(value) => {
              typing.onType();
              update("targetNetAnnual", value);
            }}
            onFocus={() => {
              typing.onFocus();
              blurErrors.onFocus();
            }}
            onBlur={() => {
              typing.onBlur();
              blurErrors.onBlur("targetNetAnnual");
            }}
          />
        )}
      </Field>
      <RadioGroup
        idPrefix={IDS.year}
        name="year"
        legend={t("inverse.year.legend")}
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year !== undefined) update("year", year);
        }}
      />
      <Field id={IDS.region} label={t("inverse.region.label")}>
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

  const rest = (
    <>
      <div className="qg-section__intro">
        <h2 className="qg-heading" id={IDS.extrasHeading}>
          {t("inverse.extras.title")}
        </h2>
        <p className="qg-section__hint">{t("inverse.extras.hint")}</p>
      </div>
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
        legend={t("inverse.frequency.legend")}
        hint={t("inverse.frequency.hint")}
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
      <ContractGroup
        state={state}
        open={contractOpen}
        f={f}
        onOpenChange={setContractOpen}
        update={update}
      />
    </>
  );

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("inverse.title")}
        lede={t("inverse.lede", {
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
          <InverseResult
            result={result}
            derived={derived}
            figureState={figureState}
            staleNote={staleNote}
            prompt={prompt}
            municipalMode={local.mode}
            links={links}
            announcement={announcement}
            regions={regions}
            f={f}
            valueRef={setFigureValue}
          />
        }
        rest={rest}
      />
      {result !== null && (
        <BottomBar
          label={t("inverse.result.label")}
          value={f.money(result.breakdown.grossAnnual)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
