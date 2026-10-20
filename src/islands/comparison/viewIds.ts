import type { OfferId, Offers } from "./state.ts";

export type ConditionGroup = "residence" | "contract" | "dependents";

export const CONDITION_GROUPS: readonly ConditionGroup[] = ["residence", "contract", "dependents"];

export const GROUP_IDS: Readonly<Record<ConditionGroup, string>> = {
  residence: "gruppo-residenza",
  contract: "gruppo-contratto",
  dependents: "gruppo-familiari",
};

export const IDS = {
  conditionsHeading: "condizioni-titolo",
  result: "risultato",
  verdictHeading: "verdetto-titolo",
  year: "anno",
  region: "regione",
  comune: "comune",
  municipalRate: "aliquota-comunale",
  contract: "contratto",
  isPublicEmployee: "pubblico",
  insuredBefore1996: "prima-1996",
  hasSpouse: "coniuge",
  childrenOver21: "figli",
  otherDependents: "altri-familiari",
} as const;

export const OFFER_HEADING_IDS: Offers<string> = { a: "offerta-a-titolo", b: "offerta-b-titolo" };
export const GROSS_IDS: Offers<string> = { a: "ral-a", b: "ral-b" };
export const FREQUENCY_IDS: Offers<string> = { a: "mensilita-a", b: "mensilita-b" };

export function offerLetter(id: OfferId): string {
  return id.toUpperCase();
}
