import { CCNL_TABLE, type CcnlDefinition, type SeniorityBand } from "@/data/index.ts";
import type { PreavvisoBreakdown } from "@/domain/index.ts";
import type { MessageKey } from "@/i18n/messages/preavviso/it.ts";
import { isCcnlId, PREAVVISO_DEFAULTS, type PreavvisoState } from "./state.ts";

export interface NoticeTableRow {
  readonly livelloId: string;
  readonly livelloLabel: string;
  readonly workingDays: boolean;
  readonly notice: readonly { readonly band: SeniorityBand; readonly days: number }[];
}

export function noticeTableFor(ccnl: CcnlDefinition): readonly NoticeTableRow[] {
  return ccnl.livelli.map((livello) => {
    const row = ccnl.rows.find((candidate) => candidate.livelloId === livello.id);
    return {
      livelloId: livello.id,
      livelloLabel: livello.label,
      workingDays: livello.workingDays === true,
      notice: row?.notice ?? [],
    };
  });
}

const BAND_MESSAGE_KEYS: Record<SeniorityBand, MessageKey> = {
  "lt-5y": "preavviso.result.band.lt-5y",
  "5-10y": "preavviso.result.band.5-10y",
  "gt-10y": "preavviso.result.band.gt-10y",
  "lte-3y": "preavviso.result.band.lte-3y",
  "gt-3y": "preavviso.result.band.gt-3y",
};

export function seniorityBandMessageKey(band: SeniorityBand): MessageKey {
  return BAND_MESSAGE_KEYS[band];
}

export function noticeDaysNoteKey(workingDays: boolean): MessageKey {
  return workingDays ? "preavviso.result.workingDays.note" : "preavviso.result.calendarDays.note";
}

export interface PreavvisoDerived {
  readonly noticeTable: readonly NoticeTableRow[];
  readonly bandMessageKey: MessageKey | null;
  readonly daysNoteKey: MessageKey | null;
}

export function derivePreavviso(
  state: PreavvisoState,
  result: PreavvisoBreakdown | null,
): PreavvisoDerived {
  const ccnl = CCNL_TABLE[isCcnlId(state.ccnlId) ? state.ccnlId : PREAVVISO_DEFAULTS.ccnlId];
  return {
    noticeTable: noticeTableFor(ccnl),
    bandMessageKey: result ? seniorityBandMessageKey(result.band) : null,
    daysNoteKey: result ? noticeDaysNoteKey(result.workingDays) : null,
  };
}
