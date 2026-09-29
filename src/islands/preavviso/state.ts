import { CCNL_IDS, CCNL_TABLE, type CcnlId } from "@/data/index.ts";
import type { MessageKey } from "@/i18n/messages/preavviso/it.ts";

export interface PreavvisoState {
  readonly ccnlId: CcnlId;
  readonly livelloId: string;
  readonly hireDate: string;
  readonly resignationDate: string;
}

export function isCcnlId(value: string): value is CcnlId {
  return (CCNL_IDS as readonly string[]).includes(value);
}

function defaultLivelloFor(ccnlId: CcnlId): string {
  const first = CCNL_TABLE[ccnlId].livelli[0];
  if (!first) throw new Error(`CCNL ${ccnlId} has no livelli`);
  return first.id;
}

export const PREAVVISO_DEFAULTS: PreavvisoState = {
  ccnlId: "commercio",
  livelloId: defaultLivelloFor("commercio"),
  hireDate: "2020-01-01",
  resignationDate: "2026-05-18",
};

export function updateCcnlId(state: PreavvisoState, ccnlId: CcnlId): PreavvisoState {
  return { ...state, ccnlId, livelloId: defaultLivelloFor(ccnlId) };
}

export function updateLivelloId(state: PreavvisoState, livelloId: string): PreavvisoState {
  return { ...state, livelloId };
}

export function updateHireDate(state: PreavvisoState, hireDate: string): PreavvisoState {
  return { ...state, hireDate };
}

export function updateResignationDate(
  state: PreavvisoState,
  resignationDate: string,
): PreavvisoState {
  return { ...state, resignationDate };
}

export interface PreavvisoDates {
  readonly hire: Date;
  readonly resignation: Date;
}

export function parseDates(state: PreavvisoState): PreavvisoDates | null {
  const hire = new Date(state.hireDate);
  const resignation = new Date(state.resignationDate);
  if (Number.isNaN(hire.getTime()) || Number.isNaN(resignation.getTime())) return null;
  if (resignation <= hire) return null;
  return { hire, resignation };
}

export type PreavvisoFieldErrors = Partial<Record<keyof PreavvisoState, MessageKey>>;

export function validatePreavviso(state: PreavvisoState): PreavvisoFieldErrors {
  const errors: { -readonly [K in keyof PreavvisoFieldErrors]?: MessageKey } = {};

  if (!isCcnlId(state.ccnlId)) {
    errors.ccnlId = "preavviso.form.ccnl.error";
  } else if (!CCNL_TABLE[state.ccnlId].livelli.some((livello) => livello.id === state.livelloId)) {
    errors.livelloId = "preavviso.form.livello.error";
  }

  if (parseDates(state) === null) {
    errors.resignationDate = "preavviso.form.error.invalidDates";
  }

  return errors;
}
