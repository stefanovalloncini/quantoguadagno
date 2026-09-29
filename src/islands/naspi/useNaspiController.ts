import { useCallback, useMemo, useState } from "react";
import type { SupportedYear } from "@/data/index.ts";
import type { NaspiBreakdown } from "@/domain/index.ts";
import { useLocale } from "@/i18n/react.tsx";
import { parseNumberText } from "@/islands/home/fields.ts";
import { computeNaspi } from "./compute.ts";
import { deriveNaspi, type NaspiDerived } from "./derive.ts";
import {
  NASPI_DEFAULTS,
  updateAge,
  updateGrossPay4Years,
  updateVoluntaryResignationInLast12Months,
  updateWeeksAfterVoluntaryResignation,
  updateWeeksContribution4Years,
  updateYear,
  validateNaspi,
  type NaspiFieldErrors,
  type NaspiState,
} from "./state.ts";

export interface NaspiController {
  readonly state: NaspiState;
  readonly errors: NaspiFieldErrors;
  readonly result: NaspiBreakdown;
  readonly derived: NaspiDerived;
  readonly showAllMonths: boolean;
  readonly updateGrossPay4Years: (raw: string) => void;
  readonly updateWeeksContribution4Years: (weeks: number) => void;
  readonly updateAge: (age: number) => void;
  readonly updateVoluntaryResignationInLast12Months: (value: boolean) => void;
  readonly updateWeeksAfterVoluntaryResignation: (weeks: number) => void;
  readonly updateYear: (year: SupportedYear) => void;
  readonly revealAllMonths: () => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function useNaspiController(): NaspiController {
  const locale = useLocale();
  const [state, setState] = useState<NaspiState>(NASPI_DEFAULTS);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const errors = useMemo(() => validateNaspi(state, locale), [state, locale]);
  const result = useMemo(() => computeNaspi(state, locale), [state, locale]);
  const derived = useMemo(() => deriveNaspi(result, showAllMonths), [result, showAllMonths]);

  const handleGrossPay4Years = useCallback((raw: string) => {
    setState((current) => updateGrossPay4Years(current, raw));
  }, []);

  const handleWeeksContribution4Years = useCallback((weeks: number) => {
    setState((current) => updateWeeksContribution4Years(current, weeks));
  }, []);

  const handleAge = useCallback((age: number) => {
    setState((current) => updateAge(current, age));
  }, []);

  const handleVoluntaryResignationInLast12Months = useCallback((value: boolean) => {
    setState((current) => updateVoluntaryResignationInLast12Months(current, value));
  }, []);

  const handleWeeksAfterVoluntaryResignation = useCallback((weeks: number) => {
    setState((current) => updateWeeksAfterVoluntaryResignation(current, weeks));
  }, []);

  const handleYear = useCallback((year: SupportedYear) => {
    setState((current) => updateYear(current, year));
  }, []);

  const revealAllMonths = useCallback(() => {
    setShowAllMonths(true);
  }, []);

  const reset = useCallback(() => {
    setState(NASPI_DEFAULTS);
    setShowAllMonths(false);
  }, []);

  const adoptField = useCallback(
    (name: string, raw: string) => {
      setState((current) => {
        if (name === "grossPay4Years") return updateGrossPay4Years(current, raw);
        if (name === "voluntaryResignationInLast12Months") {
          return updateVoluntaryResignationInLast12Months(current, raw === "true" || raw === "on");
        }
        if (
          name === "weeksContribution4Years" ||
          name === "age" ||
          name === "weeksAfterVoluntaryResignation" ||
          name === "year"
        ) {
          const value = parseNumberText(raw, "integer", locale);
          if (value === null) return current;
          if (name === "weeksContribution4Years")
            return updateWeeksContribution4Years(current, value);
          if (name === "age") return updateAge(current, value);
          if (name === "weeksAfterVoluntaryResignation") {
            return updateWeeksAfterVoluntaryResignation(current, value);
          }
          return updateYear(current, value as SupportedYear);
        }
        return current;
      });
    },
    [locale],
  );

  return {
    state,
    errors,
    result,
    derived,
    showAllMonths,
    updateGrossPay4Years: handleGrossPay4Years,
    updateWeeksContribution4Years: handleWeeksContribution4Years,
    updateAge: handleAge,
    updateVoluntaryResignationInLast12Months: handleVoluntaryResignationInLast12Months,
    updateWeeksAfterVoluntaryResignation: handleWeeksAfterVoluntaryResignation,
    updateYear: handleYear,
    revealAllMonths,
    reset,
    adoptField,
  };
}
