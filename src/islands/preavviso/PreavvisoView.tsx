import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Field } from "@/components/form/Field.tsx";
import { Select } from "@/components/form/Select.tsx";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { BottomBar, useBottomBarVisible } from "@/components/result/BottomBar.tsx";
import { LiveStatus, useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import { ResultFigure, type FigureState } from "@/components/result/ResultFigure.tsx";
import { Assumptions, NoteLine, type AssumptionItem } from "@/components/result/Assumptions.tsx";
import { Topics } from "@/components/result/Topics.tsx";
import { CCNL_IDS, CCNL_SOURCES, CCNL_TABLE, type CcnlId } from "@/data/index.ts";
import { useFormat, useRichT, useT } from "@/i18n/react.tsx";
import type { MessageKey } from "@/i18n/messages/preavviso/it.ts";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { DateField } from "./DateField.tsx";
import { isCcnlId, PREAVVISO_DEFAULTS, type PreavvisoState } from "./state.ts";
import { localIsoDate } from "./today.ts";
import { usePreavvisoController } from "./usePreavvisoController.ts";

const IDS = {
  ccnl: "preavviso-ccnl",
  livello: "preavviso-livello",
  hireDate: "preavviso-hire-date",
  resignationDate: "preavviso-resignation-date",
  result: "preavviso-result",
  resultHeading: "preavviso-result-heading",
  assumptionsHeading: "preavviso-assumptions-heading",
  tableHeading: "preavviso-table-heading",
  faqHeading: "preavviso-faq-heading",
};

const FAQ_TOPICS = [
  "obbligatorio",
  "mancato",
  "calendarOrWork",
  "ferie",
  "malattia",
  "prova",
] as const;

function focusWhenPresent(id: string): void {
  document.getElementById(id)?.focus();
}

export function PreavvisoView() {
  const t = useT();
  const rt = useRichT();
  const f = useFormat();
  const controller = usePreavvisoController();
  const { state, result, derived } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);
  const [figureValue, setFigureValue] = useState<HTMLParagraphElement | null>(null);
  const blurErrors = useBlurErrors<keyof PreavvisoState, MessageKey>(controller.errors);

  const adoptField = controller.adoptField;
  const adoptTypedField = useCallback(
    (name: string, value: string | boolean) => {
      if (typeof value === "string") adoptField(name, value);
    },
    [adoptField],
  );
  useHydratedFormValues(containerRef, adoptTypedField);

  const updateResignationDate = controller.updateResignationDate;
  useLayoutEffect(() => {
    if (state.resignationDate !== PREAVVISO_DEFAULTS.resignationDate) return;
    updateResignationDate(localIsoDate(new Date()));
  }, [state.resignationDate, updateResignationDate]);

  const ccnl = isCcnlId(state.ccnlId) ? CCNL_TABLE[state.ccnlId] : CCNL_TABLE.commercio;
  const livello = ccnl.livelli.find((candidate) => candidate.id === state.livelloId);
  const bandKey = derived.bandMessageKey;

  const errorText = (field: keyof PreavvisoState): string | undefined => {
    const error = blurErrors.shown[field];
    return error === undefined ? undefined : t(error);
  };

  const figureState: FigureState = result === null ? "empty" : "ready";
  const barVisible = useBottomBarVisible(figureValue, figureState === "ready");

  const announcement = useSettledAnnouncement(
    !interacted
      ? null
      : result === null
        ? t("preavviso.result.fix")
        : [
            t("preavviso.days", { count: result.noticeDays }),
            t("preavviso.result.exitDate", { date: f.date(result.exitDate) }),
          ].join(" "),
  );

  const assumptions: readonly AssumptionItem[] = [
    {
      id: "ccnl",
      text: t("preavviso.assumptions.ccnl", { ccnl: ccnl.label, livello: livello?.label ?? "" }),
      changeLabel: t("preavviso.assumptions.change.ccnl"),
      targetId: IDS.ccnl,
    },
    {
      id: "dates",
      text: t("preavviso.assumptions.dates", {
        hire: f.date(new Date(state.hireDate)),
        resignation: f.date(new Date(state.resignationDate)),
      }),
      changeLabel: t("preavviso.assumptions.change.dates"),
      targetId: IDS.hireDate,
    },
  ];

  const source = CCNL_SOURCES[ccnl.id].preavviso;

  const onDateChange = (field: "hireDate" | "resignationDate", value: string) => {
    setInteracted(true);
    if (field === "hireDate") controller.updateHireDate(value);
    else controller.updateResignationDate(value);
  };

  const primary = (
    <>
      <Field id={IDS.ccnl} label={t("preavviso.form.ccnl")} error={errorText("ccnlId")}>
        {(control) => (
          <Select<CcnlId>
            {...control}
            name="ccnlId"
            value={isCcnlId(state.ccnlId) ? state.ccnlId : "commercio"}
            options={CCNL_IDS.map((id) => ({ value: id, label: CCNL_TABLE[id].label }))}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateCcnlId(value);
            }}
            onBlur={() => {
              blurErrors.onBlur("ccnlId");
            }}
          />
        )}
      </Field>
      <Field id={IDS.livello} label={t("preavviso.form.livello")} error={errorText("livelloId")}>
        {(control) => (
          <Select
            {...control}
            name="livelloId"
            value={state.livelloId}
            options={ccnl.livelli.map((option) => ({ value: option.id, label: option.label }))}
            onValueChange={(value) => {
              setInteracted(true);
              controller.updateLivelloId(value);
            }}
            onBlur={() => {
              blurErrors.onBlur("livelloId");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.hireDate}
        label={t("preavviso.form.hireDate")}
        hint={t("preavviso.form.hireDate.hint")}
      >
        {(control) => (
          <DateField
            {...control}
            name="hireDate"
            value={state.hireDate}
            onValueChange={(value) => {
              onDateChange("hireDate", value);
            }}
            onFocus={blurErrors.onFocus}
            onBlur={() => {
              blurErrors.onBlur("hireDate");
            }}
          />
        )}
      </Field>
      <Field
        id={IDS.resignationDate}
        label={t("preavviso.form.resignationDate")}
        hint={t("preavviso.form.resignationDate.hint")}
        error={errorText("resignationDate")}
      >
        {(control) => (
          <DateField
            {...control}
            name="resignationDate"
            value={state.resignationDate}
            onValueChange={(value) => {
              onDateChange("resignationDate", value);
            }}
            onFocus={blurErrors.onFocus}
            onBlur={() => {
              blurErrors.onBlur("resignationDate");
            }}
          />
        )}
      </Field>
    </>
  );

  return (
    <div ref={containerRef}>
      <PageIntro title={t("preavviso.title")} lede={t("preavviso.lede")} />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={primary}
        result={
          <div className="qg-result">
            <div className="qg-result__summary">
              <ResultFigure
                headingId={IDS.resultHeading}
                label={t("preavviso.result.noticeDays")}
                state={figureState}
                prompt={t("preavviso.result.fix")}
                valueRef={setFigureValue}
                {...(result === null || bandKey === null
                  ? {}
                  : {
                      value: t("preavviso.days", { count: result.noticeDays }),
                      basis: t("preavviso.result.exitDate", { date: f.date(result.exitDate) }),
                      sub: t("preavviso.result.band", {
                        band: t(bandKey),
                        livello: result.livelloLabel,
                      }),
                    })}
              />
            </div>
            <LiveStatus message={announcement} />
            {result !== null && derived.daysNoteKey !== null && (
              <p className="qg-figure__aside">{t(derived.daysNoteKey)}</p>
            )}
            <Assumptions
              headingId={IDS.assumptionsHeading}
              items={assumptions}
              onChange={(item) => {
                focusWhenPresent(item.targetId);
              }}
            />
            <NoteLine>
              {rt("preavviso.result.source", {
                ref: source.url === undefined ? source.ref : <a href={source.url}>{source.ref}</a>,
              })}
            </NoteLine>
          </div>
        }
      />
      <section className="qg-section qg-band qg-band--narrow" aria-labelledby={IDS.tableHeading}>
        <h2 className="qg-heading" id={IDS.tableHeading}>
          {t("preavviso.table.title")}
        </h2>
        <table
          className="qg-table qg-table--compact qg-table--stack qg-table--cell-current"
          role="table"
        >
          <caption className="qg-visually-hidden">{t("preavviso.table.caption")}</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">
                {t("preavviso.table.livello")}
              </th>
              {ccnl.bands.map((band) => (
                <th scope="col" role="columnheader" className="qg-table__num" key={band}>
                  {t(`preavviso.result.band.${band}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {derived.noticeTable.map((row) => {
              const current = row.livelloId === state.livelloId;
              return (
                <tr role="row" key={row.livelloId} aria-current={current ? true : undefined}>
                  <th scope="row" role="rowheader" className="qg-table__primary">
                    {row.livelloLabel}
                    {row.workingDays && (
                      <span className="qg-visually-hidden">
                        {t("preavviso.table.workingDaysSuffix")}
                      </span>
                    )}
                  </th>
                  {ccnl.bands.map((band) => {
                    const entry = row.notice.find((candidate) => candidate.band === band);
                    const mine = current && result?.band === band;
                    return (
                      <td
                        role="cell"
                        className={
                          mine
                            ? "qg-table__num qg-table__pair qg-table__mine"
                            : "qg-table__num qg-table__pair"
                        }
                        data-label={t(`preavviso.result.band.${band}`)}
                        key={band}
                      >
                        {entry === undefined ? null : t("preavviso.days", { count: entry.days })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <Topics
        headingId={IDS.faqHeading}
        title={t("preavviso.faq.title")}
        topics={FAQ_TOPICS.map((id) => ({
          id: `preavviso-faq-${id}`,
          summary: t(`preavviso.faq.${id}.q`),
          body: t(`preavviso.faq.${id}.a`),
        }))}
      />
      {result !== null && (
        <BottomBar
          label={t("preavviso.result.noticeDays")}
          value={t("preavviso.days", { count: result.noticeDays })}
          targetId={IDS.resultHeading}
          visible={barVisible}
        />
      )}
    </div>
  );
}
