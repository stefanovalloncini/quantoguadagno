import { describe, expect, it } from "vitest";
import { LATEST_SUPPORTED_YEAR, REGION_CODES } from "@/data/index.ts";
import { LOCALES } from "@/i18n/locales.ts";
import { computeEmployerCost } from "@/islands/employerCost/compute.ts";
import { checkEmployerCost, employerCostDefaults } from "@/islands/employerCost/state.ts";
import { employerCostFromQuery } from "@/islands/employerCost/url.ts";
import { computeEmployee, loadComune } from "@/islands/home/compute.ts";
import { checkEmployee, employeeDefaults } from "@/islands/home/state.ts";
import { employeeFromQuery } from "@/islands/home/url.ts";
import { readQuery } from "@/islands/runtime/query.ts";
import { EMPLOYEE_PARAMS, EMPLOYER_COST_PARAMS } from "@/queryParams.ts";
import { pathFor, SITE_ORIGIN } from "@/routePaths.ts";
import { NET_TABLE_AMOUNTS } from "./amounts.ts";
import { calculatorHref, employerCostHref } from "./links.ts";
import { amountPage, scenarioInput, type Residence } from "./model.ts";
import { loadResidences, referenceResidence } from "./residences.ts";

const YEAR = LATEST_SUPPORTED_YEAR;
const residences = await loadResidences(YEAR);
const milano = referenceResidence(YEAR);

async function comuneOf(residence: Residence) {
  const comune = await loadComune(residence.region, residence.comuneId);
  if (comune === null) throw new Error(`missing comune ${residence.comuneId}`);
  return comune;
}

describe("links to the calculators", () => {
  it("name only the gross and the comune for the reference scenario", () => {
    expect(calculatorHref("it", YEAR, milano, 30_000)).toBe("/?l=30000&k=F205");
    expect(calculatorHref("en", YEAR, milano, 30_000)).toBe("/en?l=30000&k=F205");
    expect(calculatorHref("it", YEAR, milano)).toBe("/?k=F205");
    expect(calculatorHref("it", YEAR, residences.lazio, 30_000)).toBe("/?l=30000&r=lazio&k=H501");
    expect(employerCostHref("it", YEAR, milano, 30_000)).toBe("/costo-azienda?l=30000&k=F205");
  });

  it.each(LOCALES)("open the net salary calculator on the same numbers in %s", async (locale) => {
    const comune = await comuneOf(milano);
    for (const gross of NET_TABLE_AMOUNTS) {
      const url = new URL(calculatorHref(locale, YEAR, milano, gross), SITE_ORIGIN);
      expect(url.pathname).toBe(new URL(pathFor("home", locale), SITE_ORIGIN).pathname);
      const state = employeeFromQuery(
        readQuery(url.search, EMPLOYEE_PARAMS),
        employeeDefaults(locale),
        locale,
      );
      const { values } = checkEmployee(state, locale);
      if (values === null) throw new Error(`invalid link for ${String(gross)}`);
      expect(computeEmployee(values, comune).input).toEqual(scenarioInput(gross, YEAR, milano));
    }
  });

  it.each(REGION_CODES)("open the calculator on the same capoluogo in %s", async (region) => {
    const residence = residences[region];
    const url = new URL(calculatorHref("it", YEAR, residence, 30_000), SITE_ORIGIN);
    const state = employeeFromQuery(
      readQuery(url.search, EMPLOYEE_PARAMS),
      employeeDefaults("it"),
      "it",
    );
    const { values } = checkEmployee(state, "it");
    if (values === null) throw new Error(`invalid link for ${region}`);
    const result = computeEmployee(values, await comuneOf(residence));
    expect(result.input).toEqual(scenarioInput(30_000, YEAR, residence));
  });

  it("open the employer cost calculator on the same cost", async () => {
    const comune = await comuneOf(milano);
    for (const gross of NET_TABLE_AMOUNTS) {
      const url = new URL(employerCostHref("it", YEAR, milano, gross), SITE_ORIGIN);
      const state = employerCostFromQuery(
        readQuery(url.search, EMPLOYER_COST_PARAMS),
        employerCostDefaults("it"),
        "it",
      );
      const { values } = checkEmployerCost(state, "it");
      if (values === null) throw new Error(`invalid link for ${String(gross)}`);
      expect(computeEmployerCost(values, comune).breakdown.totalEmployerCost).toBe(
        amountPage(gross, YEAR, residences).employerCost,
      );
    }
  });
});
