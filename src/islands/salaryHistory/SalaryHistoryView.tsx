import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClientSuspense } from "@/islands/runtime/ClientSuspense.tsx";
import { flushSync } from "react-dom";
import type { ErrorSummaryItem } from "@/components/form/ErrorSummary.tsx";
import type { AfterTone } from "@/components/form/Field.tsx";
import { afterPointerRelease } from "@/components/form/pointer.ts";
import { useRegionText } from "@/components/form/regionText.ts";
import { useBlurErrors } from "@/components/form/useBlurErrors.ts";
import { CalculatorLayout } from "@/components/page/CalculatorLayout.tsx";
import { PageIntro } from "@/components/page/PageIntro.tsx";
import { useSettledAnnouncement } from "@/components/result/LiveStatus.tsx";
import { LATEST_SUPPORTED_YEAR, latestVerification, SUPPORTED_YEARS } from "@/data/index.ts";
import { formatDate, formatNumber, parseMoneyInput } from "@/i18n/numbers.ts";
import { useT } from "@/i18n/react.tsx";
import { percentText } from "@/islands/home/fields.ts";
import { useViewFormat } from "@/islands/home/viewFormat.tsx";
import type { FormControlValue } from "@/islands/runtime/formControls.ts";
import { preloadable } from "@/islands/runtime/preloadable.tsx";
import { useHydratedFormValues } from "@/islands/runtime/useHydratedFormValues.ts";
import { hrefFor } from "@/routePaths.ts";
import {
  checkDraft,
  countOf,
  growthOf,
  municipalRateOf,
  nextYearToAdd,
  type DraftField,
  type DraftTexts,
  type ViewError,
} from "./draft.ts";
import { EntryForm, type EntryGroup } from "./EntryForm.tsx";
import { signedPercent } from "./historyFormat.ts";
import { HistoryResult, loadEntriesTable } from "./HistoryResult.tsx";
import { purchasingPower } from "./purchasingPower.ts";
import { DEFAULT_STATE, MAX_GROSS, MAX_GROWTH_PCT, MIN_GROWTH_PCT } from "./state.ts";
import type { SalaryEntry } from "./storage.ts";
import { useSalaryHistoryController } from "./useSalaryHistoryController.ts";
import { IDS, removeButtonId } from "./viewIds.ts";

const trend = preloadable(() => import("./HistoryTrend.tsx"));
const HistoryTrend = trend.Component;

const TYPING_PAUSE_MS = 700;

type ErrorField = DraftField | "growth";

type LastAction =
  | { readonly kind: "added"; readonly year: number; readonly gross: number }
  | { readonly kind: "removed"; readonly year: number }
  | { readonly kind: "cleared" };

const FIELD_IDS: Readonly<Record<ErrorField, string>> = {
  year: IDS.year,
  gross: IDS.gross,
  municipal: IDS.municipal,
  children: IDS.children,
  others: IDS.others,
  growth: IDS.growth,
};

const GROUP_OF: Readonly<Partial<Record<ErrorField, EntryGroup>>> = {
  municipal: "net",
  children: "family",
  others: "family",
};

const TEXT_BY_NAME: Readonly<Record<string, keyof DraftTexts>> = {
  grossAnnual: "gross",
  municipalTaxRate: "municipal",
  childrenOver21: "children",
  otherDependents: "others",
};

const SETTING_NAMES: ReadonlySet<string> = new Set([
  "contractType",
  "paymentFrequency",
  "regionCode",
]);

function focusById(id: string): void {
  document.getElementById(id)?.focus();
}

export function SalaryHistoryView() {
  const t = useT();
  const f = useViewFormat();
  const regions = useRegionText();
  const controller = useSalaryHistoryController();
  const { state, entries, result } = controller;
  const containerRef = useRef<HTMLDivElement>(null);
  const [texts, setTexts] = useState<DraftTexts>(() => ({
    gross: "",
    municipal: percentText(state.draft.settings.municipalTaxRate, f.locale),
    children: "0",
    others: "0",
  }));
  const [growthText, setGrowthText] = useState(() => formatNumber(state.growthPct, f.locale));
  const [open, setOpen] = useState<Record<EntryGroup, boolean>>({ net: false, family: false });
  const [requireGross, setRequireGross] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [grossFocused, setGrossFocused] = useState(false);
  const [grossSettled, setGrossSettled] = useState(true);
  const [seeded, setSeeded] = useState(false);

  if (!seeded && entries.length > 0) {
    setSeeded(true);
    const settings = result.lastSettings;
    controller.updateDraftSettings(settings);
    if (entries.some((entry) => entry.year === state.draft.year)) {
      controller.updateDraft({ year: nextYearToAdd(state.draft.year, entries) });
    }
    setTexts((previous) => ({
      ...previous,
      municipal: percentText(settings.municipalTaxRate, f.locale),
      children: String(settings.dependents?.childrenOver21 ?? 0),
      others: String(settings.dependents?.otherDependents ?? 0),
    }));
  }

  useEffect(() => {
    void loadEntriesTable();
    void trend.load();
  }, []);

  useEffect(() => {
    if (grossSettled) return undefined;
    const timer = window.setTimeout(() => {
      setGrossSettled(true);
    }, TYPING_PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [texts.gross, grossSettled]);

  const draftErrors = checkDraft(texts, state.draft.year, entries, f.locale);
  const growthInvalid = growthOf(growthText, f.locale) === null;
  const { gross: grossDraftError, ...otherDraftErrors } = draftErrors;
  const cleanErrors: Partial<Record<ErrorField, ViewError>> = {
    ...otherDraftErrors,
    ...(grossDraftError === undefined || (texts.gross.trim() === "" && !requireGross)
      ? {}
      : { gross: grossDraftError }),
    ...(growthInvalid
      ? {
          growth: {
            key: "field.error.percentRange",
            values: { min: MIN_GROWTH_PCT, max: MAX_GROWTH_PCT },
          },
        }
      : {}),
  };
  const blurErrors = useBlurErrors<ErrorField, ViewError>(cleanErrors);
  const message = (error: ViewError) => t(error.key, { ...error.values });
  const shownText = (field: ErrorField): string | undefined => {
    const error = blurErrors.shown[field];
    return error === undefined ? undefined : message(error);
  };

  const pushText = (field: keyof DraftTexts, text: string) => {
    if (field === "gross") {
      const value = parseMoneyInput(text, f.locale);
      if (value !== null && value >= 1 && value <= MAX_GROSS) {
        controller.updateDraft({ grossAnnual: value });
      }
    }
    if (field === "municipal") {
      const rate = municipalRateOf(text, f.locale);
      if (rate !== null) controller.updateDraftSettings({ municipalTaxRate: rate });
    }
    if (field === "children" || field === "others") {
      const count = countOf(text);
      if (count === null) return;
      controller.updateDependents(
        field === "children" ? { childrenOver21: count } : { otherDependents: count },
      );
    }
  };

  const updateText = (field: keyof DraftTexts, text: string) => {
    if (field === "gross") setGrossSettled(false);
    setTexts((previous) => ({ ...previous, [field]: text }));
    pushText(field, text);
  };

  const updateGrowth = (text: string) => {
    setGrowthText(text);
    const growth = growthOf(text, f.locale);
    if (growth !== null) controller.updateGrowthPct(growth);
  };

  const {
    updateDraft,
    updateDraftSettings,
    updateDependents,
    updateGrowthPct,
    updateHorizon,
    adoptField,
  } = controller;
  const adopt = useCallback(
    (name: string, value: FormControlValue) => {
      const field = TEXT_BY_NAME[name];
      if (field !== undefined && typeof value === "string") {
        setTexts((previous) => ({ ...previous, [field]: value }));
        if (field === "gross") {
          const gross = parseMoneyInput(value, f.locale);
          if (gross !== null && gross >= 1 && gross <= MAX_GROSS)
            updateDraft({ grossAnnual: gross });
        }
        if (field === "municipal") {
          const rate = municipalRateOf(value, f.locale);
          if (rate !== null) updateDraftSettings({ municipalTaxRate: rate });
        }
        if (field === "children" || field === "others") {
          const count = countOf(value);
          if (count !== null) {
            updateDependents(
              field === "children" ? { childrenOver21: count } : { otherDependents: count },
            );
          }
        }
        return;
      }
      if (name === "year" || name === "horizon") {
        const number = Number(value);
        if (!Number.isInteger(number)) return;
        if (name === "year") updateDraft({ year: number });
        else updateHorizon(number);
        return;
      }
      if (name === "note" && typeof value === "string") updateDraft({ note: value });
      if (name === "growthPct" && typeof value === "string") {
        setGrowthText(value);
        const growth = growthOf(value, f.locale);
        if (growth !== null) updateGrowthPct(growth);
      }
      if (name === "companySize" && typeof value === "boolean") {
        if (value) updateDraftSettings({ companySize: "large" });
        else adoptField("companySize", "");
      }
      if (name === "hasSpouse" && typeof value === "boolean")
        updateDependents({ hasSpouse: value });
      if (SETTING_NAMES.has(name) && typeof value === "string") adoptField(name, value);
    },
    [
      f.locale,
      updateDraft,
      updateDraftSettings,
      updateDependents,
      updateGrowthPct,
      updateHorizon,
      adoptField,
    ],
  );
  useHydratedFormValues(containerRef, adopt);

  const power = useMemo(() => purchasingPower(result.rows), [result.rows]);

  const announcementText = (): string | null => {
    if (lastAction === null) return null;
    if (lastAction.kind === "cleared") return t("history.announce.cleared");
    if (lastAction.kind === "removed")
      return t("history.announce.removed", { year: lastAction.year });
    const added = t("history.announce.added", {
      year: lastAction.year,
      amount: f.whole(lastAction.gross),
    });
    if (power.kind !== "change") return added;
    return `${added} ${t("history.announce.change", {
      first: power.first.entry.year,
      last: power.last.entry.year,
      change: signedPercent(power.realChange, f.locale, 1),
    })}`;
  };
  const announcement = useSettledAnnouncement(announcementText());

  const verified = useMemo(() => {
    const date = latestVerification();
    if (date === null) return null;
    return { date: formatDate(new Date(date), f.locale), href: hrefFor("sources", f.locale) };
  }, [f.locale]);

  const summary: readonly ErrorSummaryItem[] =
    attempt === 0
      ? []
      : (Object.keys(cleanErrors) as ErrorField[])
          .filter((field) => field !== "growth")
          .flatMap((field) => {
            const error = cleanErrors[field];
            return error === undefined
              ? []
              : [{ fieldId: FIELD_IDS[field], message: message(error) }];
          });

  const onSubmit = () => {
    const errors = checkDraft(texts, state.draft.year, entries, f.locale);
    const fields = Object.keys(errors) as DraftField[];
    if (fields.length > 0) {
      setRequireGross(true);
      blurErrors.touch(fields);
      setOpen((previous) => {
        const next = { ...previous };
        for (const field of fields) {
          const group = GROUP_OF[field];
          if (group !== undefined) next[group] = true;
        }
        return next;
      });
      setAttempt((previous) => previous + 1);
      return;
    }
    const gross = parseMoneyInput(texts.gross, f.locale) ?? state.draft.grossAnnual;
    const year = state.draft.year;
    controller.addEntry();
    controller.updateDraft({ year: nextYearToAdd(year, entries) });
    setTexts((previous) => ({ ...previous, gross: "" }));
    setRequireGross(false);
    setAttempt(0);
    setLastAction({ kind: "added", year, gross });
  };

  const onRemove = (entry: SalaryEntry) => {
    const index = entries.findIndex((candidate) => candidate.id === entry.id);
    const neighbour = entries[index + 1] ?? entries[index - 1] ?? null;
    flushSync(() => {
      controller.removeEntry(entry.id);
      setLastAction({ kind: "removed", year: entry.year });
    });
    focusById(neighbour === null ? IDS.formHeading : removeButtonId(neighbour.id));
  };

  const grossValue = parseMoneyInput(texts.gross, f.locale);
  const grossAfter: { readonly text: string; readonly tone: AfterTone } | null =
    grossValue !== null && grossValue > 0 && grossFocused && shownText("gross") === undefined
      ? { text: t("history.form.gross.readAs", { amount: f.money(grossValue) }), tone: "quiet" }
      : null;

  const formErrors: Partial<Record<DraftField, string>> = {};
  for (const field of ["year", "gross", "municipal", "children", "others"] as const) {
    const text = shownText(field);
    if (text !== undefined) formErrors[field] = text;
  }

  return (
    <div ref={containerRef}>
      <PageIntro
        title={t("history.title")}
        lede={t("history.lede", {
          target: result.targetYear,
          firstTax: SUPPORTED_YEARS[0] ?? LATEST_SUPPORTED_YEAR,
        })}
      />
      <CalculatorLayout
        resultId={IDS.result}
        resultLabelledBy={IDS.resultHeading}
        primary={
          <EntryForm
            attempt={attempt}
            draft={state.draft}
            texts={texts}
            errors={formErrors}
            summary={summary}
            grossAfter={grossAfter}
            open={open}
            f={f}
            regions={regions}
            onOpenChange={(group, next) => {
              setOpen((previous) => ({ ...previous, [group]: next }));
            }}
            onYearChange={(year) => {
              controller.updateDraft({ year });
            }}
            onTextChange={updateText}
            onNoteChange={(note) => {
              controller.updateDraft({ note });
            }}
            onSettingsChange={(patch) => {
              controller.updateDraftSettings(patch);
            }}
            onLargeCompanyChange={(large) => {
              if (large) controller.updateDraftSettings({ companySize: "large" });
              else controller.adoptField("companySize", "");
            }}
            onDependentsChange={controller.updateDependents}
            onFieldFocus={blurErrors.onFocus}
            onFieldBlur={(field) => {
              blurErrors.onBlur(field);
            }}
            onGrossFocus={() => {
              setGrossFocused(true);
              blurErrors.onFocus();
            }}
            onGrossBlur={() => {
              afterPointerRelease(() => {
                setGrossFocused(false);
                setGrossSettled(true);
              });
              blurErrors.onBlur("gross");
            }}
            onSubmit={onSubmit}
          />
        }
        result={
          <HistoryResult
            power={power}
            announcement={announcement}
            verified={verified}
            targetYear={result.targetYear}
            firstTaxYear={SUPPORTED_YEARS[0] ?? LATEST_SUPPORTED_YEAR}
            rows={result.rows}
            confirming={confirming}
            f={f}
            onRemove={onRemove}
            onClearRequest={() => {
              flushSync(() => {
                setConfirming(true);
              });
              focusById(IDS.clearQuestion);
            }}
            onClearConfirm={() => {
              flushSync(() => {
                controller.clear();
                setConfirming(false);
                setLastAction({ kind: "cleared" });
              });
              focusById(IDS.formHeading);
            }}
            onClearCancel={() => {
              flushSync(() => {
                setConfirming(false);
              });
              focusById(IDS.clear);
            }}
          />
        }
      />
      {entries.length > 0 && (
        <ClientSuspense fallback={null}>
          <HistoryTrend
            rows={result.rows}
            projection={result.projection}
            base={result.latestSupportedEntry}
            targetYear={result.targetYear}
            firstTaxYear={SUPPORTED_YEARS[0] ?? LATEST_SUPPORTED_YEAR}
            taxYear={LATEST_SUPPORTED_YEAR}
            horizon={state.horizon}
            growthText={growthText}
            growthError={shownText("growth")}
            growthStale={growthInvalid}
            startingGrowth={DEFAULT_STATE.growthPct}
            f={f}
            onGrowthChange={updateGrowth}
            onGrowthFocus={blurErrors.onFocus}
            onGrowthBlur={() => {
              blurErrors.onBlur("growth");
            }}
            onHorizonChange={(years) => {
              controller.updateHorizon(years);
            }}
          />
        </ClientSuspense>
      )}
    </div>
  );
}
