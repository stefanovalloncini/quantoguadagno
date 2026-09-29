import { useCallback, useMemo, useState } from "react";
import type { DependentsInput } from "@/domain/index.ts";
import { FOI_LATEST_YEAR } from "@/data/index.ts";
import { useLocale } from "@/i18n/react.tsx";
import { useStoredState } from "@/islands/runtime/useStoredState.ts";
import {
  adjustedRows,
  lastSettings,
  latestSupportedEntry,
  netSeries,
  nominalSeries,
  projectionBundle,
  projectionSeries,
  realChangeSinceFirst,
  tableRows,
  type AdjustedEntry,
  type ChartPoint,
  type ProjectionBundle,
  type TableRow,
} from "./derive.ts";
import {
  adoptField as adoptFieldState,
  DEFAULT_STATE,
  patchDraft,
  patchDependents,
  patchSettings,
  resetDraftAfterSubmit,
  updateGrowthPct,
  updateHorizon,
  validate,
  validateDraft,
  type SalaryHistoryDraft,
  type SalaryHistoryErrors,
  type SalaryHistoryState,
} from "./state.ts";
import {
  buildEntry,
  makeId,
  sortEntriesByYear,
  SALARY_HISTORY_CODEC,
  type SalaryEntry,
  type SalaryEntrySettings,
} from "./storage.ts";

export interface SalaryHistoryDerived {
  readonly realChangeSinceFirst: number | null;
  readonly nominalSeries: readonly ChartPoint[];
  readonly netSeries: readonly ChartPoint[];
  readonly projectionSeries: readonly ChartPoint[];
  readonly bandUpperSeries: readonly ChartPoint[];
  readonly bandLowerSeries: readonly ChartPoint[];
  readonly tableRows: readonly TableRow[];
}

export interface SalaryHistoryResult {
  readonly rows: readonly AdjustedEntry[];
  readonly targetYear: number;
  readonly lastSettings: SalaryEntrySettings;
  readonly latestSupportedEntry: SalaryEntry | null;
  readonly projection: ProjectionBundle;
}

export interface SalaryHistoryController {
  readonly state: SalaryHistoryState;
  readonly errors: SalaryHistoryErrors;
  readonly entries: readonly SalaryEntry[];
  readonly result: SalaryHistoryResult;
  readonly derived: SalaryHistoryDerived;
  readonly updateDraft: (
    patch: Partial<Pick<SalaryHistoryDraft, "year" | "grossAnnual" | "note">>,
  ) => void;
  readonly updateDraftSettings: (patch: Partial<SalaryEntrySettings>) => void;
  readonly updateDependents: (patch: Partial<DependentsInput>) => void;
  readonly updateHorizon: (value: number) => void;
  readonly updateGrowthPct: (value: number) => void;
  readonly addEntry: () => void;
  readonly removeEntry: (id: string) => void;
  readonly clear: () => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function useSalaryHistoryController(): SalaryHistoryController {
  const locale = useLocale();
  const [entries, setEntries] = useStoredState(SALARY_HISTORY_CODEC);
  const [state, setState] = useState<SalaryHistoryState>(DEFAULT_STATE);

  const sorted = useMemo(() => sortEntriesByYear(entries), [entries]);
  const targetYear = FOI_LATEST_YEAR;
  const rows = useMemo(() => adjustedRows(sorted, targetYear), [sorted, targetYear]);
  const latestEntry = useMemo(() => latestSupportedEntry(rows), [rows]);
  const projection = useMemo(
    () => projectionBundle(latestEntry, state.horizon, state.growthPct),
    [latestEntry, state.horizon, state.growthPct],
  );

  const errors = useMemo(() => validate(state), [state]);

  const result = useMemo<SalaryHistoryResult>(
    () => ({
      rows,
      targetYear,
      lastSettings: lastSettings(sorted),
      latestSupportedEntry: latestEntry,
      projection,
    }),
    [rows, sorted, targetYear, latestEntry, projection],
  );

  const derived = useMemo<SalaryHistoryDerived>(
    () => ({
      realChangeSinceFirst: realChangeSinceFirst(rows),
      nominalSeries: nominalSeries(rows),
      netSeries: netSeries(rows),
      projectionSeries: projectionSeries(projection.expected),
      bandUpperSeries: projectionSeries(projection.high),
      bandLowerSeries: projectionSeries(projection.low),
      tableRows: tableRows(rows),
    }),
    [rows, projection],
  );

  const addEntry = useCallback(() => {
    if (Object.keys(validateDraft(state.draft)).length > 0) return;
    const entry = buildEntry(state.draft, makeId(), new Date().toISOString());
    setEntries((current) => sortEntriesByYear([...current, entry]));
    setState((current) => resetDraftAfterSubmit(current));
  }, [state.draft, setEntries]);

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((current) => current.filter((entry) => entry.id !== id));
    },
    [setEntries],
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  const adoptField = useCallback(
    (name: string, raw: string) => {
      setState((current) => adoptFieldState(current, name, raw, locale));
    },
    [locale],
  );

  return {
    state,
    errors,
    entries: sorted,
    result,
    derived,
    updateDraft: useCallback(
      (patch: Partial<Pick<SalaryHistoryDraft, "year" | "grossAnnual" | "note">>) => {
        setState((current) => patchDraft(current, patch));
      },
      [],
    ),
    updateDraftSettings: useCallback((patch: Partial<SalaryEntrySettings>) => {
      setState((current) => patchSettings(current, patch));
    }, []),
    updateDependents: useCallback((patch: Partial<DependentsInput>) => {
      setState((current) => patchDependents(current, patch));
    }, []),
    updateHorizon: useCallback((value: number) => {
      setState((current) => updateHorizon(current, value));
    }, []),
    updateGrowthPct: useCallback((value: number) => {
      setState((current) => updateGrowthPct(current, value));
    }, []),
    addEntry,
    removeEntry,
    clear,
    reset: useCallback(() => {
      setState(DEFAULT_STATE);
    }, []),
    adoptField,
  };
}
