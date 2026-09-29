import type {
  NaspiBreakdown,
  NaspiIneligibilityReason,
  NaspiScheduleMonth,
} from "@/domain/index.ts";
import type { MessageKey } from "@/i18n/messages/naspi/it.ts";

export const VISIBLE_NASPI_MONTHS = 12;

const INELIGIBILITY_MESSAGE_KEYS: Record<NaspiIneligibilityReason, MessageKey> = {
  "insufficient-weeks": "naspi.ineligible.insufficient-weeks",
  "voluntary-resignation-lockout": "naspi.ineligible.voluntary-resignation-lockout",
};

export function naspiIneligibilityMessageKey(reason: NaspiIneligibilityReason): MessageKey {
  return INELIGIBILITY_MESSAGE_KEYS[reason];
}

export interface NaspiDerived {
  readonly ineligibilityMessageKeys: readonly MessageKey[];
  readonly visibleSchedule: readonly NaspiScheduleMonth[];
  readonly hasMoreMonths: boolean;
}

export function deriveNaspi(
  result: NaspiBreakdown,
  showAllMonths: boolean,
  limit: number = VISIBLE_NASPI_MONTHS,
): NaspiDerived {
  const visibleSchedule = showAllMonths ? result.schedule : result.schedule.slice(0, limit);
  return {
    ineligibilityMessageKeys: result.reasons.map(naspiIneligibilityMessageKey),
    visibleSchedule,
    hasMoreMonths: result.schedule.length > visibleSchedule.length,
  };
}
