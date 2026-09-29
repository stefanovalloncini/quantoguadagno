import type { Bracket, ParamKey, ParamValue, RegionalTaxRules, RegionCode } from "@/data/index.ts";
import type { Locale } from "@/i18n/locales.ts";
import type { TranslateFn } from "@/i18n/react.tsx";
import {
  moneyText,
  numberText,
  percentRangeText,
  percentText,
  wholeMoneyRangeText,
  wholeMoneyText,
} from "@/islands/prose/phrases.ts";

export interface Formatting {
  readonly locale: Locale;
  readonly t: TranslateFn;
}

export interface DisplayRow {
  readonly label: string;
  readonly value: string;
}

export type RegionKey = `regions.${RegionCode}`;

type FixedKey = Exclude<ParamKey, RegionKey>;

type Describe<K extends ParamKey> = (value: ParamValue<K>, f: Formatting) => readonly DisplayRow[];

type Describers = { readonly [K in FixedKey]: Describe<K> };

function row(label: string, value: string): DisplayRow {
  return { label, value };
}

function named(key: ParamKey, f: Formatting, value: string): readonly DisplayRow[] {
  return [row(parameterName(key, f), value)];
}

function money(amount: number, f: Formatting): string {
  return moneyText(amount, f.locale);
}

function percent(rate: number, f: Formatting): string {
  return percentText(rate, f.locale);
}

function upTo(text: string, f: Formatting): string {
  return f.t("sources.value.upTo", { amount: text });
}

function notInForce(key: ParamKey, f: Formatting): readonly DisplayRow[] {
  return named(key, f, f.t("sources.value.notInForce"));
}

function rangeStart(amount: number, f: Formatting): string {
  return f.locale === "it" ? numberText(amount, f.locale, 0) : wholeMoneyText(amount, f.locale);
}

function bracketLabel(bracket: Bracket, index: number, f: Formatting): string {
  if (index === 0 && bracket.max !== null) {
    return f.t("sources.part.bracket.first", { max: wholeMoneyText(bracket.max, f.locale) });
  }
  if (bracket.max === null) {
    return f.t("sources.part.bracket.last", { min: wholeMoneyText(bracket.min, f.locale) });
  }
  return f.t("sources.part.bracket.middle", {
    min: rangeStart(bracket.min, f),
    max: wholeMoneyText(bracket.max, f.locale),
  });
}

function extremes(values: readonly number[]): readonly [number, number] {
  return [Math.min(...values), Math.max(...values)];
}

export function regionalRates(rules: RegionalTaxRules): readonly number[] {
  const flat = rules.flatRate === undefined ? [] : [rules.flatRate.rate];
  return [...rules.taxBrackets.map((bracket) => bracket.rate), ...flat];
}

export function describeRegion(rules: RegionalTaxRules, f: Formatting): string {
  const [low, high] = extremes(regionalRates(rules));
  return percentRangeText(low, high, f.locale);
}

export function parameterName(key: ParamKey, f: Formatting): string {
  return f.t(`sources.name.${key}`);
}

const DESCRIBERS: Describers = {
  "irpef.brackets": (brackets, f) =>
    brackets.map((bracket, index) =>
      row(bracketLabel(bracket, index, f), percent(bracket.rate, f)),
    ),
  "irpef.workDeduction": (config, f) => [
    row(
      f.t("sources.part.workDeduction.base", {
        limit: wholeMoneyText(config.thresholds[0], f.locale),
      }),
      money(config.baseDeduction, f),
    ),
    row(f.t("sources.part.workDeduction.end"), money(config.thresholds[2], f)),
  ],
  "irpef.trattamentoIntegrativo": (config, f) =>
    named("irpef.trattamentoIntegrativo", f, upTo(money(config.maxAnnualBonus, f), f)),
  "irpef.taxWedgeCut": (config, f) => {
    if (config === null) return notInForce("irpef.taxWedgeCut", f);
    const rates = config.sommaAggiuntiva.map((bracket) => bracket.rate);
    const lastBracket = config.sommaAggiuntiva[config.sommaAggiuntiva.length - 1];
    const [low, high] = extremes(rates);
    return [
      row(
        f.t("sources.part.taxWedgeCut.somma", {
          limit: wholeMoneyText(lastBracket?.maxIncome ?? 0, f.locale),
        }),
        percentRangeText(low, high, f.locale),
      ),
      row(
        f.t("sources.part.taxWedgeCut.detrazione", {
          limit: wholeMoneyText(config.detrazioneAggiuntiva.phaseOutEnd, f.locale),
        }),
        upTo(money(config.detrazioneAggiuntiva.maxDeduction, f), f),
      ),
    ];
  },
  "inps.firstBand": (amount, f) => named("inps.firstBand", f, money(amount, f)),
  "inps.massimale": (amount, f) => named("inps.massimale", f, money(amount, f)),
  "inps.aboveFirstBandSurcharge": (rate, f) =>
    named("inps.aboveFirstBandSurcharge", f, percent(rate, f)),
  "inps.employee.rate": (rate, f) => named("inps.employee.rate", f, percent(rate, f)),
  "inps.employee.apprenticeRate": (rate, f) =>
    named("inps.employee.apprenticeRate", f, percent(rate, f)),
  "inps.employee.cigsRate": (rate, f) => named("inps.employee.cigsRate", f, percent(rate, f)),
  "inps.employee.publicRate": (rate, f) => named("inps.employee.publicRate", f, percent(rate, f)),
  "inps.employee.exemption2024": (config, f) => {
    if (config === null) return notInForce("inps.employee.exemption2024", f);
    return config.brackets.map((bracket) =>
      row(
        f.t("sources.part.exemption2024.bracket", {
          limit: wholeMoneyText(bracket.maxMonthlyIncome, f.locale),
        }),
        percent(bracket.exemptionRate, f),
      ),
    );
  },
  "inps.autonomi.minimale": (amount, f) => named("inps.autonomi.minimale", f, money(amount, f)),
  "inps.artigiani.rate": (rate, f) => named("inps.artigiani.rate", f, percent(rate, f)),
  "inps.commercianti.rate": (rate, f) => named("inps.commercianti.rate", f, percent(rate, f)),
  "inps.autonomi.maternity": (amount, f) =>
    named("inps.autonomi.maternity", f, f.t("sources.value.perYear", { amount: money(amount, f) })),
  "inps.autonomi.forfettarioReduction": (rate, f) =>
    named("inps.autonomi.forfettarioReduction", f, percent(rate, f)),
  "inps.autonomi.newRegistrantReduction": (rate, f) =>
    named("inps.autonomi.newRegistrantReduction", f, percent(rate, f)),
  "inps.gestioneSeparata.rates": (rates, f) => [
    row(f.t("sources.part.gestioneSeparata.full"), percent(rates.fullRate, f)),
    row(f.t("sources.part.gestioneSeparata.reduced"), percent(rates.reducedRate, f)),
  ],
  "deductions.spouse": (config, f) =>
    named("deductions.spouse", f, upTo(money(config.lowIncomeMax, f), f)),
  "deductions.children": (config, f) =>
    named("deductions.children", f, money(config.childOver21Deduction, f)),
  "deductions.otherFamily": (config, f) =>
    named("deductions.otherFamily", f, upTo(money(config.otherFamilyDeduction, f), f)),
  "deductions.dependentIncomeLimit": (limits, f) => [
    row(f.t("sources.part.dependentIncomeLimit.general"), money(limits.dependentIncomeLimit, f)),
    row(f.t("sources.part.dependentIncomeLimit.young"), money(limits.dependentIncomeLimitYoung, f)),
  ],
  "deductions.expenses": (config, f) => {
    const sameRate = config.medicalDeductionRate === config.standardDeductionRate;
    const rateRows = sameRate
      ? [row(f.t("sources.part.expenses.rate"), percent(config.standardDeductionRate, f))]
      : [
          row(f.t("sources.part.expenses.medicalRate"), percent(config.medicalDeductionRate, f)),
          row(f.t("sources.part.expenses.standardRate"), percent(config.standardDeductionRate, f)),
        ];
    return [
      ...rateRows,
      row(f.t("sources.part.expenses.medicalFloor"), money(config.medicalExpenseFloor, f)),
      row(f.t("sources.part.expenses.mortgage"), upTo(money(config.maxMortgageInterest, f), f)),
    ];
  },
  "deductions.pensionFund": (amount, f) =>
    named("deductions.pensionFund", f, upTo(money(amount, f), f)),
  "deductions.expensePhaseOut": (config, f) =>
    named(
      "deductions.expensePhaseOut",
      f,
      wholeMoneyRangeText(config.phaseOutStart, config.phaseOutEnd, f.locale),
    ),
  "deductions.expenseCap": (config, f) => {
    if (config === null) return notInForce("deductions.expenseCap", f);
    const [low, high] = extremes(config.bands.map((band) => band.base));
    return [
      row(
        f.t("sources.part.expenseCap.bands", { limit: wholeMoneyText(config.minIncome, f.locale) }),
        wholeMoneyRangeText(low, high, f.locale),
      ),
    ];
  },
  "deductions.expenseReduction": (config, f) => {
    if (config === null) return notInForce("deductions.expenseReduction", f);
    return [
      row(
        f.t("sources.part.expenseReduction.amount", {
          limit: wholeMoneyText(config.minIncome, f.locale),
        }),
        money(config.amount, f),
      ),
    ];
  },
  "fringe.mealVouchers.electronic": (amount, f) =>
    named(
      "fringe.mealVouchers.electronic",
      f,
      f.t("sources.value.perDay", { amount: money(amount, f) }),
    ),
  "fringe.mealVouchers.paper": (amount, f) =>
    named(
      "fringe.mealVouchers.paper",
      f,
      f.t("sources.value.perDay", { amount: money(amount, f) }),
    ),
  "fringe.healthInsurance": (amount, f) =>
    named("fringe.healthInsurance", f, upTo(money(amount, f), f)),
  "fringe.welfare": (thresholds, f) => [
    row(f.t("sources.part.welfare.general"), money(thresholds.welfareThresholdGeneral, f)),
    row(f.t("sources.part.welfare.children"), money(thresholds.welfareThresholdWithChildren, f)),
  ],
  "fringe.companyCar.co2": (thresholds, f) => {
    const [low, high] = extremes(thresholds.map((threshold) => threshold.taxablePercentage));
    return named("fringe.companyCar.co2", f, percentRangeText(low, high, f.locale));
  },
  "fringe.companyCar.powertrain": (rates, f) => {
    if (rates === null) return notInForce("fringe.companyCar.powertrain", f);
    return rates.map((rate) =>
      row(
        f.t(`sources.part.powertrain.${rate.powertrainType}`),
        percent(rate.taxablePercentage, f),
      ),
    );
  },
  "fringe.companyCar.conventionalKm": (km, f) =>
    named(
      "fringe.companyCar.conventionalKm",
      f,
      f.t("sources.value.km", { km: numberText(km, f.locale, 0) }),
    ),
  "employer.inps": (rates, f) => [
    row(f.t("sources.part.employerInps.rate"), percent(rates.rate, f)),
    row(f.t("sources.part.employerInps.apprentice"), percent(rates.apprenticeshipRate, f)),
  ],
  "employer.otherCosts": (costs, f) => [
    row(f.t("sources.part.otherCosts.inail"), percent(costs.inailRate, f)),
    row(f.t("sources.part.otherCosts.maternity"), percent(costs.maternityRate, f)),
    row(f.t("sources.part.otherCosts.naspi"), percent(costs.naspiRate, f)),
    row(
      f.t("sources.part.otherCosts.naspiFixedTerm"),
      percent(costs.naspiAdditionalDeterminatoRate, f),
    ),
    row(f.t("sources.part.otherCosts.cig"), percent(costs.cigRate, f)),
    row(f.t("sources.part.otherCosts.other"), percent(costs.otherRate, f)),
  ],
  tfr: (config, f) => [
    row(
      f.t("sources.part.tfr.accrual"),
      f.t("sources.value.divided", { divisor: numberText(config.accrualDivisor, f.locale) }),
    ),
    row(
      f.t("sources.part.tfr.revaluation"),
      f.t("sources.value.revaluation", {
        fixed: percentText(config.fixedRevaluationRate, f.locale),
        share: percentText(config.inflationPercentage, f.locale),
      }),
    ),
    row(f.t("sources.part.tfr.tax"), percent(config.revaluationTaxRate, f)),
    row(f.t("sources.part.tfr.contribution"), percent(config.ivsContributionRate, f)),
  ],
  madreLavoratrice: (rules, f) =>
    named(
      "madreLavoratrice",
      f,
      upTo(f.t("sources.value.perYear", { amount: money(rules.maxAnnualExemption, f) }), f),
    ),
  impatriati: (config, f) => [
    row(f.t("sources.part.impatriati.standard"), percent(config.standardExemptionRate, f)),
    row(f.t("sources.part.impatriati.children"), percent(config.withMinorChildrenExemptionRate, f)),
  ],
  pdr: (config, f) =>
    named(
      "pdr",
      f,
      f.t("sources.value.rateUpTo", {
        rate: percent(config.rate, f),
        amount: money(config.maxAmount, f),
      }),
    ),
  "forfettario.taxRates": (rates, f) => [
    row(f.t("sources.part.forfettario.standard"), percent(rates.standardRate, f)),
    row(
      f.t("sources.part.forfettario.startup", { years: rates.startupYears }),
      percent(rates.startupRate, f),
    ),
  ],
  "forfettario.limits": (limits, f) => [
    row(f.t("sources.part.forfettario.revenue"), money(limits.maxRevenue, f)),
    row(f.t("sources.part.forfettario.employeeCosts"), money(limits.maxEmployeeCosts, f)),
  ],
  "forfettario.coefficients": (coefficients, f) => {
    const [low, high] = extremes(Object.values(coefficients));
    return named("forfettario.coefficients", f, percentRangeText(low, high, f.locale));
  },
  "forfettario.concurrentEmployeeIncomeLimit": (amount, f) =>
    named("forfettario.concurrentEmployeeIncomeLimit", f, upTo(money(amount, f), f)),
  "naspi.soglia": (amount, f) => named("naspi.soglia", f, money(amount, f)),
  "naspi.massimale": (amount, f) => named("naspi.massimale", f, money(amount, f)),
  "naspi.rules": (rules, f) => [
    row(f.t("sources.part.naspi.base"), percent(rules.pctBase, f)),
    row(f.t("sources.part.naspi.marginal"), percent(rules.pctMarginal, f)),
    row(
      f.t("sources.part.naspi.decalage", { month: rules.decalageStartUnder55 }),
      percent(rules.decalageRate, f),
    ),
    row(
      f.t("sources.part.naspi.weeksPerMonth"),
      numberText(rules.weeklyToMonthlyCoef, f.locale, 3),
    ),
    row(
      f.t("sources.part.naspi.minWeeks", { years: rules.lookbackYears }),
      f.t("sources.value.weeks", { weeks: rules.minWeeks }),
    ),
    row(
      f.t("sources.part.naspi.maxDuration"),
      f.t("sources.value.weeks", { weeks: rules.maxDurationWeeks }),
    ),
  ],
  "inps.employee.rateAboveFirstBand": (rate, f) =>
    named("inps.employee.rateAboveFirstBand", f, percent(rate, f)),
  "inps.employee.publicRateAboveFirstBand": (rate, f) =>
    named("inps.employee.publicRateAboveFirstBand", f, percent(rate, f)),
  "inps.artigiani.rateAboveFirstBand": (rate, f) =>
    named("inps.artigiani.rateAboveFirstBand", f, percent(rate, f)),
  "inps.commercianti.rateAboveFirstBand": (rate, f) =>
    named("inps.commercianti.rateAboveFirstBand", f, percent(rate, f)),
  "inps.autonomi.massimaleAnte1996": (amount, f) =>
    named("inps.autonomi.massimaleAnte1996", f, money(amount, f)),
  "inps.gestioneSeparata.minimale": (amount, f) =>
    named("inps.gestioneSeparata.minimale", f, money(amount, f)),
  "inps.artigiani.minimumContribution": (amount, f) =>
    named(
      "inps.artigiani.minimumContribution",
      f,
      f.t("sources.value.perYear", { amount: money(amount, f) }),
    ),
  "inps.commercianti.minimumContribution": (amount, f) =>
    named(
      "inps.commercianti.minimumContribution",
      f,
      f.t("sources.value.perYear", { amount: money(amount, f) }),
    ),
  "madreLavoratrice.maxMonthlyExemption": (amount, f) =>
    named(
      "madreLavoratrice.maxMonthlyExemption",
      f,
      upTo(f.t("sources.value.perMonth", { amount: money(amount, f) }), f),
    ),
};

function describerFor<K extends FixedKey>(key: K): Describe<K> {
  return DESCRIBERS[key];
}

export function isRegionKey(key: ParamKey): key is RegionKey {
  return key.startsWith("regions.");
}

export function describeParameter<K extends ParamKey>(
  key: K,
  value: ParamValue<K>,
  f: Formatting,
  regionName: (key: RegionKey) => string,
): readonly DisplayRow[] {
  if (isRegionKey(key)) {
    return [row(regionName(key), describeRegion(value as RegionalTaxRules, f))];
  }
  return describerFor(key)(value as ParamValue<FixedKey>, f);
}
