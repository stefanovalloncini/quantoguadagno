import type { TfrProjection, TfrYear } from "@/domain/index.ts";

export const VISIBLE_TFR_YEARS = 10;

export interface TfrDerived {
  readonly visibleSchedule: readonly TfrYear[];
  readonly hasMoreYears: boolean;
}

export function deriveTfr(
  result: TfrProjection,
  showAllYears: boolean,
  limit: number = VISIBLE_TFR_YEARS,
): TfrDerived {
  const visibleSchedule = showAllYears ? result.schedule : result.schedule.slice(0, limit);
  return { visibleSchedule, hasMoreYears: result.schedule.length > visibleSchedule.length };
}
