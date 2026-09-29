import type { Entries, IsoDate, ParamDefinition, Source } from "./types.ts";

export const PHASE_0_REVIEW: IsoDate = "2026-09-28";

export function effective<T>(
  ...entries: Entries<T>
): ParamDefinition<T> & { readonly revaluedYearly: false } {
  return { revaluedYearly: false, entries };
}

export function revaluedYearly<T, D extends IsoDate>(
  ...entries: Entries<T, D>
): ParamDefinition<T, D> & { readonly revaluedYearly: true } {
  return { revaluedYearly: true, entries };
}

export function verifiedOn(date: IsoDate, source: Source): Source {
  return { ...source, verified: date };
}

export function verifiedInPhase0(source: Source): Source {
  return verifiedOn(PHASE_0_REVIEW, source);
}

export function cite(source: Source, detail: string): Source {
  return { ...source, ref: `${source.ref}, ${detail}` };
}
