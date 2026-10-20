import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComuneFieldProps } from "@/components/form/ComuneField.tsx";
import { Field } from "@/components/form/Field.tsx";
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
import type { FieldError } from "@/islands/home/fields.ts";
import { useComuneRestoreHold } from "@/islands/home/useComuneRestoreHold.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { useLocalTax } from "@/islands/inverse/localTax.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { ComparisonBand } from "./ComparisonBand.tsx";
import { ExtrasFields, loadGroupFields } from "./ExtrasFields.tsx";
import { OrdinarioResult } from "./OrdinarioResult.tsx";
import { OrdinarioTopics } from "./OrdinarioTopics.tsx";
import { ordinarioRecaps } from "./recaps.ts";
import { isRevenueEmpty, type OrdinarioField } from "./state.ts";
import { useOrdinarioController, type OrdinarioUpdate } from "./useOrdinarioController.ts";
import { IDS, VIEW_GROUPS, type ViewGroup } from "./viewIds.ts";

const CLOSED_GROUPS = Object.fromEntries(VIEW_GROUPS.map((group) => [group, false])) as Record<
  ViewGroup,
  boolean
>;

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

export function OrdinarioView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useOrdinarioController();
  const { state, result, stale } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<ViewGroup, boolean>>(CLOSED_GROUPS);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const blurErrors = useBlurErrors<OrdinarioField, FieldError>(controller.errors);
  const shown = blurErrors.shown;
  const revenueEmpty = isRevenueEmpty(state);

  useHydratedFormValues(containerRef, controller.adoptField);
  useComuneRestoreHold(state.comune, controller.comune);

  useEffect(() => whenIdle(() => void loadGroupFields()), []);

  const touchFields = blurErrors.touch;
  useEffect(() => {
    if (interacted) return;
    const fromLink = Object.keys(controller.errors) as OrdinarioField[];
    if (fromLink.length > 0) touchFields(fromLink);
  }, [controller.errors, interacted, touchFields]);

  const controllerUpdate = controller.update;
  const update = useCallback<OrdinarioUpdate>(
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

  const errorGroups = {
    comune: shown.municipalRate !== undefined,
    previdenza: shown.months !== undefined || shown.cassaAmount !== undefined,
  };
  const errorKey = `${String(errorGroups.comune)}-${String(errorGroups.previdenza)}`;
  const [openedForErrors, setOpenedForErrors] = useState("false-false");
  if (errorKey !== openedForErrors) {
    setOpenedForErrors(errorKey);
    setOpenGroups((previous) => ({
      ...previous,
      ...(errorGroups.comune ? { comune: true } : {}),
      ...(errorGroups.previdenza ? { previdenza: true } : {}),
    }));
  }

  const staleVisible = stale && Object.keys(shown).length > 0;
  const figureState: FigureState =
    revenueEmpty || result === null ? "empty" : staleVisible ? "stale" : "ready";
  const barVisible = useBottomBarVisible(figureValue, figureState === "ready");
  const prompt = t(revenueEmpty ? "ordinario.result.empty" : "ordinario.result.fix");
  const staleNote = t("ordinario.result.stale");

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "empty"
        ? prompt
        : figureState === "stale"
          ? staleNote
          : result === null
            ? null
            : t("ordinario.result.announce", {
                amount: f.money(result.breakdown.netAnnual),
                monthly: f.money(result.breakdown.netMonthly),
              }),
  );

  const errorText = (field: OrdinarioField): string | undefined => {
    const error = shown[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };

  const comuneName = result?.municipal.kind === "comune" ? result.municipal.comune.name : null;
  const recaps = useMemo(
    () => ordinarioRecaps(state, { mode: local.mode, name: comuneName }, t, f),
    [state, local.mode, comuneName, t, f],
  );

  const moneyField = (field: "revenue" | "costs", id: string) => (
    <Field
      id={id}
      label={t(`ordinario.${field}.label`)}
      labelSuffix={t("field.unit.euro")}
      hint={t(`ordinario.${field}.hint`)}
      error={errorText(field)}
    >
      {(control) => (
        <MoneyInput
          {...control}
          name={field}
          value={state[field]}
          onValueChange={(value) => {
            update(field, value);
          }}
          onFocus={blurErrors.onFocus}
          onBlur={() => {
            blurErrors.onBlur(field);
          }}
        />
      )}
    </Field>
  );

  const primary = (
    <>
      {moneyField("revenue", IDS.revenue)}
      {moneyField("costs", IDS.costs)}
      <RadioGroup
        idPrefix={IDS.year}
        name="year"
        legend={t("ordinario.year.legend")}
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year !== undefined) update("year", year);
        }}
      />
      <Field id={IDS.region} label={t("ordinario.region.label")} hint={t("ordinario.region.hint")}>
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

  const manualRateError = errorText("municipalRate");
  const comune: ComuneFieldProps = {
    id: IDS.comune,
    rateId: IDS.municipalRate,
    region: state.region,
    year: state.year,
    list: controller.comuni,
    selection: controller.comune,
    manual: local.manual,
    manualRate: state.municipalRate,
    ...(manualRateError === undefined ? {} : { manualRateError }),
    onLoad: controller.loadComuni,
    onSelect: (id) => {
      update("comune", id);
    },
    onSwitchRegion: local.onSwitchRegion,
    onManualChange: local.onManualChange,
    onManualRateChange: local.onManualRateChange,
    onManualRateFocus: blurErrors.onFocus,
    onManualRateBlur: () => {
      blurErrors.onBlur("municipalRate");
    },
  };

  return (
    <div ref={containerRef}>
      <PageIntro title={t("ordinario.title")} lede={t("ordinario.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        restLabelledBy={IDS.extrasHeading}
        primary={primary}
        result={
          <OrdinarioResult
            result={result}
            figureState={figureState}
            prompt={prompt}
            staleNote={staleNote}
            announcement={announcement}
            municipalMode={local.mode}
            regions={regions}
            f={f}
            valueRef={setFigureValue}
          />
        }
        rest={
          <ExtrasFields
            comune={comune}
            recaps={recaps}
            open={openGroups}
            onOpenChange={(group, open) => {
              setOpenGroups((previous) => ({ ...previous, [group]: open }));
            }}
            state={state}
            errors={shown}
            f={f}
            update={update}
            onFieldFocus={blurErrors.onFocus}
            onFieldBlur={(field) => {
              blurErrors.onBlur(field);
            }}
          />
        }
      />
      {result !== null && figureState !== "empty" && <ComparisonBand result={result} f={f} />}
      <OrdinarioTopics year={state.year} f={f} />
      {result !== null && (
        <BottomBar
          label={t("ordinario.result.label")}
          value={f.money(result.breakdown.netAnnual)}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
