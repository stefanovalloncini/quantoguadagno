import { regionRules, type ComunaleRule } from "@/data/index.ts";
import { resolveInpsRates } from "@/domain/inpsRates.ts";
import { getTaxConfig } from "@/domain/taxConfig.ts";
import type { EmployeeValues } from "@/islands/home/state.ts";
import type { ViewFormat } from "@/islands/home/viewFormat.tsx";

export function standardInpsRate(values: EmployeeValues): number {
  return resolveInpsRates(getTaxConfig(values.taxYear).inps, {
    contractType: values.contractType,
    companySize: values.companySize,
    isPublicEmployee: values.isPublicEmployee,
    override: values.inpsOverride ?? undefined,
  }).standardRate;
}

export function rangeText(rates: readonly number[], f: ViewFormat): string {
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  if (min === max) return f.percent(max);
  return `${f.percent(min).replace("%", "")}–${f.percent(max)}`;
}

export function comuneRates(rule: ComunaleRule): readonly number[] {
  const rates =
    rule.brackets === undefined ? [rule.rate] : rule.brackets.map((bracket) => bracket.rate);
  return rates.map((rate) => rate / 100);
}

export function regionalRangeText(values: EmployeeValues, f: ViewFormat): string {
  const rules = regionRules(values.regionCode, values.taxYear);
  return rangeText(
    rules.taxBrackets.map((bracket) => bracket.rate),
    f,
  );
}
