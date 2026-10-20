import type { TranslateFn } from "@/i18n/react.tsx";
import { REFERENCE_FREQUENCY, type Residence } from "./model.ts";

const STRAIGHT_APOSTROPHE = /'/g;

/** A comune name as the dataset spells it, with a typographic apostrophe: L’Aquila. */
export function placeName(name: string): string {
  return name.replace(STRAIGHT_APOSTROPHE, "’");
}

/** The reference scenario in one sentence, the same on every page of the table. */
export function scenarioText(t: TranslateFn, residence: Residence): string {
  return t("netTable.scenario", {
    city: placeName(residence.comuneName),
    count: REFERENCE_FREQUENCY,
  });
}
