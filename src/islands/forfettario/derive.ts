import type {
  ForfettarioBreakdown,
  ForfettarioEligibility,
  ForfettarioIneligibilityReason,
  Gestion,
} from "@/domain/index.ts";
import type { MessageKey } from "@/i18n/messages/forfettario/it.ts";
import type { ForfettarioState } from "./state.ts";

const GESTION_MESSAGE_KEYS: Record<Gestion, MessageKey> = {
  "gestione-separata": "forfettario.breakdown.inps.gestione-separata",
  artigiani: "forfettario.breakdown.inps.artigiani",
  commercianti: "forfettario.breakdown.inps.commercianti",
  "cassa-professionale": "forfettario.breakdown.inps.cassa-professionale",
};

export function gestionMessageKey(gestion: Gestion): MessageKey {
  return GESTION_MESSAGE_KEYS[gestion];
}

const INELIGIBILITY_MESSAGE_KEYS: Record<ForfettarioIneligibilityReason, MessageKey> = {
  "revenue-exceeds-limit": "forfettario.eligibility.revenueExceeded",
  "employee-costs-exceed-limit": "forfettario.eligibility.employeeCostsExceeded",
  "concurrent-employee-ral-too-high": "forfettario.eligibility.concurrentEmployeeRalTooHigh",
};

export function forfettarioIneligibilityMessageKey(
  reason: ForfettarioIneligibilityReason,
): MessageKey {
  return INELIGIBILITY_MESSAGE_KEYS[reason];
}

export type ForfettarioNotice =
  | { readonly kind: "none" }
  | { readonly kind: "warning"; readonly percent: number }
  | {
      readonly kind: "ineligible";
      readonly reasons: readonly ForfettarioIneligibilityReason[];
      readonly reasonMessageKeys: readonly MessageKey[];
    };

export function forfettarioNotice(eligibility: ForfettarioEligibility): ForfettarioNotice {
  if (!eligibility.eligible) {
    return {
      kind: "ineligible",
      reasons: eligibility.reasons,
      reasonMessageKeys: eligibility.reasons.map(forfettarioIneligibilityMessageKey),
    };
  }
  if (eligibility.warning) {
    return { kind: "warning", percent: Math.round(eligibility.revenueLimitPercentage) };
  }
  return { kind: "none" };
}

const DISCOUNT_35 = 0.35;
const DISCOUNT_50 = 0.5;

export function discountRecapKey(discountApplied: number): MessageKey | null {
  if (discountApplied === DISCOUNT_35) return "forfettario.recap.previdenza.discount35";
  if (discountApplied === DISCOUNT_50) return "forfettario.recap.previdenza.discount50";
  return null;
}

export interface ForfettarioDerived {
  readonly notice: ForfettarioNotice;
  readonly gestionMessageKey: MessageKey;
  readonly discountRecapKey: MessageKey | null;
  readonly isArtigianiOrCommercianti: boolean;
  readonly isCassaManual: boolean;
}

export function deriveForfettario(
  state: ForfettarioState,
  result: ForfettarioBreakdown,
): ForfettarioDerived {
  return {
    notice: forfettarioNotice(result.eligibility),
    gestionMessageKey: gestionMessageKey(result.gestion),
    discountRecapKey: discountRecapKey(result.discountApplied),
    isArtigianiOrCommercianti: state.gestion === "artigiani" || state.gestion === "commercianti",
    isCassaManual: state.gestion === "cassa-professionale",
  };
}
