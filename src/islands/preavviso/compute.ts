import { CCNL_TABLE } from "@/data/index.ts";
import { calculatePreavviso, type PreavvisoBreakdown } from "@/domain/index.ts";
import { isCcnlId, parseDates, type PreavvisoState } from "./state.ts";

export function computePreavviso(state: PreavvisoState): PreavvisoBreakdown | null {
  if (!isCcnlId(state.ccnlId)) return null;
  const ccnl = CCNL_TABLE[state.ccnlId];

  const livelloId = ccnl.livelli.some((livello) => livello.id === state.livelloId)
    ? state.livelloId
    : ccnl.livelli[0]?.id;
  if (livelloId === undefined) return null;

  const dates = parseDates(state);
  if (dates === null) return null;

  return calculatePreavviso({
    ccnl,
    livelloId,
    hireDate: dates.hire,
    resignationDate: dates.resignation,
  });
}
