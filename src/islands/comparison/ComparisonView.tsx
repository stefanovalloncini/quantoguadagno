import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { DetailsGroup } from "@/components/form/DetailsGroup.tsx";
import { useRegionText } from "@/components/form/regionText.ts";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import type { FigureState } from "@/components/result/ResultFigure.tsx";
import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { comunaleRuleFor } from "@/data/index.ts";
import { parseDecimal } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { percentText, type FieldError } from "@/islands/home/fields.ts";
import type { MunicipalMode } from "@/islands/home/ledgerRows.tsx";
import { valuesToVerify } from "@/islands/home/trust.ts";
import type { ComuneLookup } from "@/islands/home/useComune.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import type { ComuneControls } from "./ConditionFields.tsx";
import type { OfferResult } from "./compute.ts";
import { OfferSection, type OfferResultState } from "./OfferSection.tsx";
import {
  DEFAULT_MUNICIPAL_RATE,
  GROSS_FIELDS,
  OFFER_IDS,
  type ComparisonField,
  type ConditionsState,
  type ConditionUpdate,
  type OfferId,
} from "./state.ts";
import { groupRecaps, type SummaryContext } from "./summaries.ts";
import { useComparisonController } from "./useComparisonController.ts";
import { verdictLabel, verdictValue, VerdictPanel } from "./VerdictPanel.tsx";
import { CONDITION_GROUPS, GROUP_IDS, IDS, type ConditionGroup } from "./viewIds.ts";

const conditionFields = preloadable(() => import("./ConditionFields.tsx"));
const ConditionFields = conditionFields.Component;

const TYPING_PAUSE_MS = 700;

const GROUP_TITLES: Readonly<Record<ConditionGroup, string>> = {
  residence: "comparison.group.residence",
  contract: "comparison.group.contract",
  dependents: "comparison.group.dependents",
};

const CLOSED_GROUPS: Readonly<Record<ConditionGroup, boolean>> = {
  residence: false,
  contract: false,
  dependents: false,
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

function rateDiffersFromDefault(conditions: ConditionsState, locale: "it" | "en"): boolean {
  const percent = parseDecimal(conditions.municipalRate.trim().replace(/\s*%$/, ""), locale);
  return (
    conditions.comune === null &&
    percent !== null &&
    Math.abs(percent / 100 - DEFAULT_MUNICIPAL_RATE) > 1e-9
  );
}

function flatRateOf(lookup: ComuneLookup, year: number): number | null {
  if (lookup.status !== "ready") return null;
  const found = comunaleRuleFor(lookup.comune, year);
  if (found?.rule.rate === undefined) return null;
  return found.rule.rate / 100;
}

export function ComparisonView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useComparisonController();
  const { state, derived } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState(CLOSED_GROUPS);
  const [manualChoice, setManualChoice] = useState<boolean | null>(null);
  const [comuneBeforeManual, setComuneBeforeManual] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [focusedGross, setFocusedGross] = useState<OfferId | null>(null);
  const [editedGross, setEditedGross] = useState(false);
  const [settled, setSettled] = useState(true);
  const blurErrors = useBlurErrors<ComparisonField, FieldError>(controller.errors);

  useHydratedFormValues(containerRef, controller.adoptField);

  useEffect(
    () =>
      whenIdle(() => {
        void conditionFields.load();
      }),
    [],
  );

  useEffect(() => {
    if (settled) return undefined;
    const timer = window.setTimeout(() => {
      setSettled(true);
    }, TYPING_PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state.offers, settled]);

  const grossEmpty = {
    a: state.offers.a.gross.trim() === "",
    b: state.offers.b.gross.trim() === "",
  };
  const anyEmpty = grossEmpty.a || grossEmpty.b;
  const shown = useMemo<Partial<Record<ComparisonField, FieldError>>>(() => {
    const emptyFields = new Set<ComparisonField>(
      OFFER_IDS.filter((id) => state.offers[id].gross.trim() === "").map((id) => GROSS_FIELDS[id]),
    );
    return Object.fromEntries(
      Object.entries(blurErrors.shown).filter(
        ([field]) => !emptyFields.has(field as ComparisonField),
      ),
    );
  }, [blurErrors.shown, state.offers]);
  const errorText = (field: ComparisonField): string | undefined => {
    const error = shown[field];
    return error === undefined ? undefined : t(error.key, { ...error.values });
  };
  const shownCount = Object.keys(shown).length;

  const manual = manualChoice ?? rateDiffersFromDefault(state.conditions, f.locale);
  const municipalMode: MunicipalMode =
    state.conditions.comune !== null ? "comune" : manual ? "manual" : "none";
  const context: SummaryContext = { t, f, regions, municipalMode };

  const staleVisible = controller.stale && (shownCount > 0 || settled);
  const figureState: FigureState =
    anyEmpty || controller.result === null ? "empty" : staleVisible ? "stale" : "ready";

  const offerState = (id: OfferId): OfferResultState => {
    if (grossEmpty[id] || controller.offers[id] === null) return "empty";
    return controller.staleOffers[id] && (shownCount > 0 || settled) ? "stale" : "ready";
  };

  const prompt = t(anyEmpty ? "comparison.verdict.empty" : "comparison.verdict.fix");
  const staleNote = t("comparison.verdict.stale");
  const readyMessage = (() => {
    if (derived === null) return null;
    const label = verdictLabel(derived.verdict, t);
    return derived.verdict.winner === "equal"
      ? t("comparison.announce.tie", { verdict: label, amount: verdictValue(derived.verdict, f) })
      : t("comparison.announce.winner", {
          verdict: label,
          amount: f.money(derived.verdict.netAnnualGap),
          monthly: f.money(derived.verdict.averageMonthlyGap),
        });
  })();
  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "empty"
        ? prompt
        : figureState === "stale"
          ? staleNote
          : readyMessage,
  );

  const checked = useMemo(() => verifiedLine(f.locale), [f.locale]);
  const recapSource: OfferResult | null = controller.offers.a ?? controller.offers.b;
  const pending = useMemo(
    () => (recapSource === null ? 0 : valuesToVerify(recapSource.values)),
    [recapSource],
  );
  const recaps = recapSource === null ? null : groupRecaps(recapSource, context);

  const updateCondition = controller.updateCondition;
  const update = useCallback<ConditionUpdate>(
    (field, value) => {
      setInteracted(true);
      updateCondition(field, value);
    },
    [updateCondition],
  );

  const comuneControls: ComuneControls = {
    list: controller.comuni,
    selection: controller.comune,
    manual,
    manualRateError: errorText("municipalRate"),
    onLoad: controller.loadComuni,
    onSelect: (id) => {
      update("comune", id);
    },
    onSwitchRegion: (region, id) => {
      update("region", region);
      update("comune", id);
    },
    onManualChange: (next) => {
      setManualChoice(next);
      if (next) {
        setComuneBeforeManual(state.conditions.comune);
        const flat = flatRateOf(controller.comune, state.conditions.year);
        if (flat !== null) updateCondition("municipalRate", percentText(flat, f.locale));
      } else if (state.conditions.comune === null && comuneBeforeManual !== null) {
        update("comune", comuneBeforeManual);
      }
    },
    onManualRateChange: (value) => {
      update("municipalRate", value);
      if (state.conditions.comune !== null) update("comune", null);
    },
    onManualRateFocus: blurErrors.onFocus,
    onManualRateBlur: () => {
      blurErrors.onBlur("municipalRate");
    },
  };

  return (
    <div ref={containerRef}>
      <PageIntro title={t("comparison.title")} lede={t("comparison.lede")} />
      <div className="qg-compare">
        <section className="qg-section" aria-labelledby={IDS.conditionsHeading}>
          <div className="qg-section__intro">
            <h2 className="qg-heading" id={IDS.conditionsHeading}>
              {t("comparison.conditions.title")}
            </h2>
            <p className="qg-section__hint">{t("comparison.conditions.hint")}</p>
          </div>
          <div className="qg-groups qg-compare__conditions">
            {CONDITION_GROUPS.map((group) => (
              <DetailsGroup
                key={group}
                id={GROUP_IDS[group]}
                title={t(GROUP_TITLES[group])}
                recap={recaps?.[group].text ?? ""}
                recapSet={recaps?.[group].set ?? false}
                open={openGroups[group]}
                onOpenChange={(open) => {
                  setOpenGroups((previous) => ({ ...previous, [group]: open }));
                }}
              >
                {openGroups[group] && (
                  <ClientSuspense fallback={null}>
                    <ConditionFields
                      group={group}
                      conditions={state.conditions}
                      errors={{
                        childrenOver21: errorText("childrenOver21"),
                        otherDependents: errorText("otherDependents"),
                      }}
                      comune={comuneControls}
                      f={f}
                      update={update}
                      onFieldFocus={blurErrors.onFocus}
                      onFieldBlur={blurErrors.onBlur}
                    />
                  </ClientSuspense>
                )}
              </DetailsGroup>
            ))}
          </div>
        </section>
        <div className="qg-compare__offers">
          {OFFER_IDS.map((id) => (
            <OfferSection
              key={id}
              id={id}
              offer={state.offers[id]}
              result={controller.offers[id]}
              resultState={offerState(id)}
              staleText={t(
                controller.errors[GROSS_FIELDS[id]] === undefined
                  ? "comparison.offer.staleShared"
                  : "comparison.offer.stale",
              )}
              error={errorText(GROSS_FIELDS[id])}
              editing={focusedGross === id && editedGross}
              f={f}
              onGrossChange={(value) => {
                setInteracted(true);
                setSettled(false);
                setEditedGross(true);
                controller.updateOffer(id, "gross", value);
              }}
              onGrossFocus={() => {
                setFocusedGross(id);
                setEditedGross(false);
                blurErrors.onFocus();
              }}
              onGrossBlur={() => {
                setFocusedGross(null);
                setEditedGross(false);
                setSettled(true);
                blurErrors.onBlur(GROSS_FIELDS[id]);
              }}
              onFrequencyChange={(value) => {
                setInteracted(true);
                controller.updateOffer(id, "paymentFrequency", value);
              }}
            />
          ))}
        </div>
        <VerdictPanel
          offers={controller.result}
          verdict={derived?.verdict ?? null}
          rows={derived?.rows ?? []}
          figureState={figureState}
          prompt={prompt}
          announcement={announcement}
          verified={checked === null ? null : { ...checked, pending }}
          context={context}
        />
      </div>
    </div>
  );
}
