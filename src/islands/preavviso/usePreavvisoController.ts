import { useCallback, useMemo, useState } from "react";
import { CCNL_TABLE, type CcnlId } from "@/data/index.ts";
import type { PreavvisoBreakdown } from "@/domain/index.ts";
import { computePreavviso } from "./compute.ts";
import { derivePreavviso, type PreavvisoDerived } from "./derive.ts";
import {
  isCcnlId,
  PREAVVISO_DEFAULTS,
  updateCcnlId,
  updateHireDate,
  updateLivelloId,
  updateResignationDate,
  validatePreavviso,
  type PreavvisoFieldErrors,
  type PreavvisoState,
} from "./state.ts";

export interface PreavvisoController {
  readonly state: PreavvisoState;
  readonly errors: PreavvisoFieldErrors;
  readonly result: PreavvisoBreakdown | null;
  readonly invalidDates: boolean;
  readonly derived: PreavvisoDerived;
  readonly updateCcnlId: (ccnlId: CcnlId) => void;
  readonly updateLivelloId: (livelloId: string) => void;
  readonly updateHireDate: (hireDate: string) => void;
  readonly updateResignationDate: (resignationDate: string) => void;
  readonly reset: () => void;
  readonly adoptField: (name: string, raw: string) => void;
}

export function usePreavvisoController(): PreavvisoController {
  const [state, setState] = useState<PreavvisoState>(PREAVVISO_DEFAULTS);

  const errors = useMemo(() => validatePreavviso(state), [state]);
  const result = useMemo(() => computePreavviso(state), [state]);
  const derived = useMemo(() => derivePreavviso(state, result), [state, result]);

  const handleCcnlId = useCallback((ccnlId: CcnlId) => {
    setState((current) => updateCcnlId(current, ccnlId));
  }, []);

  const handleLivelloId = useCallback((livelloId: string) => {
    setState((current) => updateLivelloId(current, livelloId));
  }, []);

  const handleHireDate = useCallback((hireDate: string) => {
    setState((current) => updateHireDate(current, hireDate));
  }, []);

  const handleResignationDate = useCallback((resignationDate: string) => {
    setState((current) => updateResignationDate(current, resignationDate));
  }, []);

  const reset = useCallback(() => {
    setState(PREAVVISO_DEFAULTS);
  }, []);

  const adoptField = useCallback((name: string, raw: string) => {
    setState((current) => {
      if (name === "ccnlId") return isCcnlId(raw) ? updateCcnlId(current, raw) : current;
      if (name === "livelloId") {
        const ccnl = isCcnlId(current.ccnlId) ? CCNL_TABLE[current.ccnlId] : undefined;
        return ccnl?.livelli.some((livello) => livello.id === raw) === true
          ? updateLivelloId(current, raw)
          : current;
      }
      if (name === "hireDate") return updateHireDate(current, raw);
      if (name === "resignationDate") return updateResignationDate(current, raw);
      return current;
    });
  }, []);

  return {
    state,
    errors,
    result,
    invalidDates: result === null,
    derived,
    updateCcnlId: handleCcnlId,
    updateLivelloId: handleLivelloId,
    updateHireDate: handleHireDate,
    updateResignationDate: handleResignationDate,
    reset,
    adoptField,
  };
}
