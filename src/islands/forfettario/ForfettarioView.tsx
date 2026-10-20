import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { MoneyInput } from "@/components/form/MoneyInput.tsx";
import { RadioGroup } from "@/components/form/RadioGroup.tsx";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { NoteLine } from "@/components/result/Assumptions.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import { Ledger } from "@/components/result/Ledger.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { Icon } from "@/components/icons/Icon.tsx";
import { verifiedLine } from "@/components/result/verifiedLine.ts";
import { SUPPORTED_YEARS } from "@/data/index.ts";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/data/forfettarioActivities.ts";
import { getTaxConfig } from "@/domain/index.ts";
import { useRichT, useT } from "@/i18n/react.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { ExtrasFields, loadGroupFields } from "./ExtrasFields.tsx";
import { forfettarioGroupRecaps } from "./recaps.ts";
import type { ForfettarioState } from "./state.ts";
import { useForfettarioController } from "./useForfettarioController.ts";
import { useViewFormat } from "./viewFormat.tsx";
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

export function ForfettarioView() {
  const t = useT();
  const rt = useRichT();
  const f = useViewFormat();
  const controller = useForfettarioController();
  const { state, result, derived, errors } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<ViewGroup, boolean>>(CLOSED_GROUPS);
  const [explained, setExplained] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const [interacted, setInteracted] = useState(false);
  const blurErrors = useBlurErrors<
    keyof ForfettarioState,
    NonNullable<(typeof errors)[keyof ForfettarioState]>
  >(errors);

  const adoptField = useCallback(
    (name: string, value: string | boolean) => {
      controller.adoptField(name, String(value));
    },
    [controller],
  );
  useHydratedFormValues(containerRef, adoptField);

  useEffect(() => whenIdle(() => void loadGroupFields()), []);

  const handleFieldFocus = useCallback(() => {
    setInteracted(true);
    blurErrors.onFocus();
  }, [blurErrors]);

  const errorText = (field: keyof ForfettarioState): string | undefined => {
    const error = blurErrors.shown[field];
    if (error === undefined) return undefined;
    return typeof error === "string" ? t(error) : t(error.key, { ...error.values });
  };

  const shownFields = Object.keys(blurErrors.shown) as (keyof ForfettarioState)[];
  const staleVisible = shownFields.length > 0;
  const figureState: FigureState = staleVisible ? "stale" : "ready";

  const cfg = getTaxConfig(state.year).forfettario;
  const recaps = useMemo(
    () => forfettarioGroupRecaps(state, derived, t, f),
    [state, derived, t, f],
  );

  const staleNote = t("forfettario.result.staleNote");
  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : figureState === "stale"
        ? staleNote
        : t("forfettario.result.announce", { amount: f.money(result.nettoMensile) }),
  );

  const checked = useMemo(() => verifiedLine(f.locale), [f.locale]);

  const barVisible = useBottomBarVisible(figureValue, figureState === "ready");

  const notice = derived.notice;
  const noticeLimits = {
    revenue: f.whole(cfg.maxRevenue),
    employeeCosts: f.whole(cfg.maxEmployeeCosts),
  };

  const discountText =
    derived.discountRecapKey === null
      ? t("forfettario.breakdown.contributi.explain", { rate: f.percent(result.aliquotaInps) })
      : t("forfettario.breakdown.contributi.explain.discounted", {
          rate: f.percent(result.aliquotaInps),
          discount: f.percent(result.discountApplied),
        });

  const ledgerRows = [
    {
      id: "revenue",
      name: t("forfettario.breakdown.revenue"),
      kind: "plain" as const,
      annual: f.money(result.revenue),
    },
    {
      id: "imponibileLordo",
      name: t("forfettario.breakdown.imponibileLordo"),
      kind: "subtotal" as const,
      rule: t("forfettario.breakdown.imponibileLordo.rule", {
        rate: f.percent(result.coefficient),
      }),
      annual: f.money(result.imponibileLordo),
    },
    {
      id: "contributi",
      name: t(derived.gestionMessageKey),
      kind: "deducted" as const,
      rule: f.percent(result.aliquotaInps),
      explanation: discountText,
      annual: f.money(-result.contributoInps),
    },
    {
      id: "imponibileNetto",
      name: t("forfettario.breakdown.imponibileNetto"),
      kind: "subtotal" as const,
      annual: f.money(result.imponibileNetto),
    },
    {
      id: "impostaSostitutiva",
      name: t("forfettario.breakdown.impostaSostitutiva"),
      kind: "deducted" as const,
      rule: f.percent(result.aliquotaSostitutiva),
      explanation: t("forfettario.breakdown.imposta.explain", {
        rate: f.percent(result.aliquotaSostitutiva),
        phase: t(
          result.phase === "startup"
            ? "forfettario.summary.regimeType.startup"
            : "forfettario.summary.regimeType.standard",
        ),
      }),
      annual: f.money(-result.impostaSostitutiva),
    },
  ];

  const ledgerTotal = {
    id: "net",
    name: t("forfettario.breakdown.net"),
    kind: "total" as const,
    annual: f.money(result.nettoAnnuale),
  };

  const primary = (
    <>
      <Field
        id={IDS.revenue}
        label={t("forfettario.form.revenue")}
        labelSuffix={t("field.unit.euro")}
        hint={t("forfettario.form.revenue.hint")}
        error={errorText("revenue")}
      >
        {(control) => (
          <MoneyInput
            {...control}
            name="revenue"
            value={state.revenue}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateRevenue(value);
            }}
            onFocus={handleFieldFocus}
            onBlur={() => {
              blurErrors.onBlur("revenue");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.activity}
        label={t("forfettario.form.activity")}
        hint={t("forfettario.form.activity.hint")}
        error={errorText("activity")}
      >
        {(control) => (
          <Select<ActivityCategory>
            {...control}
            name="activity"
            value={state.activity}
            options={ACTIVITY_CATEGORIES.map((activity) => ({
              value: activity,
              label: t(`forfettario.activity.${activity}`),
            }))}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateActivity(value);
            }}
          />
        )}
      </Field>
      <RadioGroup
        idPrefix={IDS.year}
        name="year"
        legend={t("forfettario.form.year")}
        hint={t("forfettario.form.year.hint")}
        value={String(state.year)}
        options={SUPPORTED_YEARS.map((year) => ({ value: String(year), label: String(year) }))}
        onValueChange={(value) => {
          const year = SUPPORTED_YEARS.find((option) => String(option) === value);
          if (year !== undefined) {
            setInteracted(true);
            controller.updateYear(year);
          }
        }}
      />
    </>
  );

  const resultPanel = (
    <div className="qg-result">
      <div className="qg-result__summary">
        <ResultFigure
          headingId={IDS.resultHeading}
          label={t("forfettario.summary.monthlyNet")}
          state={figureState}
          value={f.money(result.nettoMensile)}
          basis={t("forfettario.summary.monthlyBasis")}
          sub={rt("forfettario.summary.annualLine", {
            amount: <strong>{f.money(result.nettoAnnuale)}</strong>,
            revenue: f.money(result.revenue),
          })}
          staleNote={staleNote}
          valueRef={setFigureValue}
        />
      </div>
      <p className="qg-visually-hidden" role="status">
        {announcement}
      </p>
      {notice.kind !== "none" && (
        <div className={notice.kind === "ineligible" ? "qg-notice qg-notice--error" : "qg-notice"}>
          <div className="qg-notice__head">
            <Icon name="alert" size="lg" />
            <p className="qg-notice__title">
              {notice.kind === "warning"
                ? t("forfettario.eligibility.warning.term")
                : t("forfettario.eligibility.term")}
            </p>
          </div>
          <div className="qg-notice__body">
            {notice.kind === "warning" ? (
              <p>
                {t("forfettario.eligibility.warning", {
                  percent: notice.percent,
                  limit: noticeLimits.revenue,
                })}
              </p>
            ) : (
              notice.reasons.map((reason, index) => {
                const key = notice.reasonMessageKeys[index];
                if (key === undefined) return null;
                const limit =
                  reason === "revenue-exceeds-limit"
                    ? noticeLimits.revenue
                    : reason === "employee-costs-exceed-limit"
                      ? noticeLimits.employeeCosts
                      : undefined;
                return <p key={reason}>{t(key, limit === undefined ? {} : { limit })}</p>;
              })
            )}
          </div>
        </div>
      )}
      <NoteLine term={t("result.estimate.term")}>
        {t("forfettario.result.estimate")}
        {checked !== null && (
          <>
            {" "}
            {rt("forfettario.result.trust", {
              checked: (
                <a href={checked.href}>
                  {t("forfettario.result.verified", {
                    date: checked.date,
                    dateArticle: checked.dateArticle,
                  })}
                </a>
              ),
            })}
          </>
        )}
      </NoteLine>
      <Ledger
        headingId={IDS.ledgerHeading}
        toggleId={IDS.ledgerToggle}
        title={t("forfettario.ledger.title")}
        caption={t("forfettario.ledger.caption", { year: state.year })}
        columns={{
          term: t("forfettario.ledger.column.term"),
          annual: t("forfettario.ledger.column.annual"),
        }}
        rows={ledgerRows}
        total={ledgerTotal}
        explained={explained}
        onExplainedChange={setExplained}
      />
    </div>
  );

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("forfettario.title")}
        lede={t("forfettario.lede", { limit: f.whole(cfg.maxRevenue) })}
      />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={resultPanel}
        rest={
          <ExtrasFields
            controller={controller}
            errors={blurErrors.shown}
            isArtigianiOrCommercianti={derived.isArtigianiOrCommercianti}
            isCassaManual={derived.isCassaManual}
            recaps={recaps}
            open={openGroups}
            onOpenChange={(group, open) => {
              setOpenGroups((previous) => ({ ...previous, [group]: open }));
            }}
            onFieldFocus={handleFieldFocus}
            onFieldBlur={(field) => {
              blurErrors.onBlur(field as keyof ForfettarioState);
            }}
          />
        }
      />
      <BottomBar
        label={t("forfettario.summary.monthlyNet")}
        value={f.money(result.nettoMensile)}
        targetId={IDS.resultHeading}
        visible={barVisible}
      />
    </div>
  );
}
