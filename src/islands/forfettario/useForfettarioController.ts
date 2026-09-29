import { useCallback, useMemo, useState } from "react";
import type { ActivityCategory } from "@/data/forfettarioActivities.ts";
import type { SupportedYear } from "@/data/index.ts";
import type { ForfettarioBreakdown, Gestion } from "@/domain/index.ts";
import { useLocale } from "@/i18n/react.tsx";
import { parseNumberText } from "@/islands/home/fields.ts";
import { computeForfettario } from "./compute.ts";
import { deriveForfettario, type ForfettarioDerived } from "./derive.ts";
import {
  forfettarioDefaults,
  isActivityCategory,
  isGestion,
  updateActivity,
  updateCassaManualAmount,
  updateConcurrentEmployeeRal,
  updateEmployeeCosts,
  updateForfettarioDiscount35,
  updateGestion,
  updateHasOtherPension,
  updateIsAnte1996,
  updateIsConcurrentFullTimeEmployee,
  updateMesiAttivita,
  updateNewRegistrantDiscount50,
  updateRevenue,
  updateYear,
  updateYearsOfActivity,
  validateForfettario,
  type ForfettarioFieldErrors,
  type ForfettarioState,
} from "./state.ts";

export interface ForfettarioController {
  readonly state: ForfettarioState;
  readonly errors: ForfettarioFieldErrors;
  readonly result: ForfettarioBreakdown;
  readonly derived: ForfettarioDerived;
  readonly updateRevenue: (raw: string) => void;
  readonly updateActivity: (activity: ActivityCategory) => void;
  readonly updateYear: (year: SupportedYear) => void;
  readonly updateYearsOfActivity: (yearsOfActivity: number) => void;
  readonly updateHasOtherPension: (value: boolean) => void;
  readonly updateEmployeeCosts: (raw: string) => void;
  readonly updateGestion: (gestion: Gestion) => void;
  readonly updateMesiAttivita: (mesiAttivita: number) => void;
  readonly updateIsConcurrentFullTimeEmployee: (value: boolean) => void;
  readonly updateConcurrentEmployeeRal: (raw: string) => void;
  readonly updateForfettarioDiscount35: (value: boolean) => void;
  readonly updateNewRegistrantDiscount50: (value: boolean) => void;
  readonly updateCassaManualAmount: (raw: string) => void;
  readonly updateIsAnte1996: (value: boolean) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function useForfettarioController(): ForfettarioController {
  const locale = useLocale();
  const [state, setState] = useState<ForfettarioState>(() => forfettarioDefaults(locale));

  const errors = useMemo(() => validateForfettario(state, locale), [state, locale]);
  const result = useMemo(() => computeForfettario(state, locale), [state, locale]);
  const derived = useMemo(() => deriveForfettario(state, result), [state, result]);

  const handleRevenue = useCallback((raw: string) => {
    setState((current) => updateRevenue(current, raw));
  }, []);

  const handleActivity = useCallback((activity: ActivityCategory) => {
    setState((current) => updateActivity(current, activity));
  }, []);

  const handleYear = useCallback((year: SupportedYear) => {
    setState((current) => updateYear(current, year));
  }, []);

  const handleYearsOfActivity = useCallback((yearsOfActivity: number) => {
    setState((current) => updateYearsOfActivity(current, yearsOfActivity));
  }, []);

  const handleHasOtherPension = useCallback((value: boolean) => {
    setState((current) => updateHasOtherPension(current, value));
  }, []);

  const handleEmployeeCosts = useCallback((raw: string) => {
    setState((current) => updateEmployeeCosts(current, raw));
  }, []);

  const handleGestion = useCallback((gestion: Gestion) => {
    setState((current) => updateGestion(current, gestion));
  }, []);

  const handleMesiAttivita = useCallback((mesiAttivita: number) => {
    setState((current) => updateMesiAttivita(current, mesiAttivita));
  }, []);

  const handleIsConcurrentFullTimeEmployee = useCallback((value: boolean) => {
    setState((current) => updateIsConcurrentFullTimeEmployee(current, value));
  }, []);

  const handleConcurrentEmployeeRal = useCallback((raw: string) => {
    setState((current) => updateConcurrentEmployeeRal(current, raw));
  }, []);

  const handleForfettarioDiscount35 = useCallback((value: boolean) => {
    setState((current) => updateForfettarioDiscount35(current, value));
  }, []);

  const handleNewRegistrantDiscount50 = useCallback((value: boolean) => {
    setState((current) => updateNewRegistrantDiscount50(current, value));
  }, []);

  const handleCassaManualAmount = useCallback((raw: string) => {
    setState((current) => updateCassaManualAmount(current, raw));
  }, []);

  const handleIsAnte1996 = useCallback((value: boolean) => {
    setState((current) => updateIsAnte1996(current, value));
  }, []);

  const reset = useCallback(() => {
    setState(forfettarioDefaults(locale));
  }, [locale]);

  const adoptField = useCallback(
    (name: string, raw: string) => {
      setState((current) => {
        switch (name) {
          case "revenue":
            return updateRevenue(current, raw);
          case "employeeCosts":
            return updateEmployeeCosts(current, raw);
          case "concurrentEmployeeRal":
            return updateConcurrentEmployeeRal(current, raw);
          case "cassaManualAmount":
            return updateCassaManualAmount(current, raw);
          case "activity":
            return isActivityCategory(raw) ? updateActivity(current, raw) : current;
          case "gestion":
            return isGestion(raw) ? updateGestion(current, raw) : current;
          case "hasOtherPension":
            return updateHasOtherPension(current, raw === "true" || raw === "on");
          case "isConcurrentFullTimeEmployee":
            return updateIsConcurrentFullTimeEmployee(current, raw === "true" || raw === "on");
          case "forfettarioDiscount35":
            return updateForfettarioDiscount35(current, raw === "true" || raw === "on");
          case "newRegistrantDiscount50":
            return updateNewRegistrantDiscount50(current, raw === "true" || raw === "on");
          case "isAnte1996":
            return updateIsAnte1996(current, raw === "true" || raw === "on");
          case "year":
          case "yearsOfActivity":
          case "mesiAttivita": {
            const value = parseNumberText(raw, "integer", locale);
            if (value === null) return current;
            if (name === "year") return updateYear(current, value as SupportedYear);
            if (name === "yearsOfActivity") return updateYearsOfActivity(current, value);
            return updateMesiAttivita(current, value);
          }
          default:
            return current;
        }
      });
    },
    [locale],
  );

  return {
    state,
    errors,
    result,
    derived,
    updateRevenue: handleRevenue,
    updateActivity: handleActivity,
    updateYear: handleYear,
    updateYearsOfActivity: handleYearsOfActivity,
    updateHasOtherPension: handleHasOtherPension,
    updateEmployeeCosts: handleEmployeeCosts,
    updateGestion: handleGestion,
    updateMesiAttivita: handleMesiAttivita,
    updateIsConcurrentFullTimeEmployee: handleIsConcurrentFullTimeEmployee,
    updateConcurrentEmployeeRal: handleConcurrentEmployeeRal,
    updateForfettarioDiscount35: handleForfettarioDiscount35,
    updateNewRegistrantDiscount50: handleNewRegistrantDiscount50,
    updateCassaManualAmount: handleCassaManualAmount,
    updateIsAnte1996: handleIsAnte1996,
    reset,
    adoptField,
  };
}
