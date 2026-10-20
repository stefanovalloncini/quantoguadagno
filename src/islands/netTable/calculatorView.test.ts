import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR } from "@/data/index.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { NET_TABLE_AMOUNTS } from "./amounts.ts";
import { calculatorResult } from "./calculatorView.ts";
import { amountPage, scenarioInput } from "./model.ts";
import { loadResidences } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const residences = await loadResidences(YEAR);

describe.each(LOCALES)("the calculator behind each amount page in %s", (locale) => {
  it("restores the scenario and computes the breakdown of the page", () => {
    for (const gross of NET_TABLE_AMOUNTS) {
      const page = amountPage(gross, YEAR, residences);
      const result = calculatorResult(page, locale);
      expect(result.input).toEqual(scenarioInput(gross, YEAR, page.residence));
      expect(result.breakdown).toEqual(page.breakdown);
      expect(result.municipal.kind).toBe("comune");
      expect(result.comune?.id).toBe(page.residence.comuneId);
    }
  });
});
