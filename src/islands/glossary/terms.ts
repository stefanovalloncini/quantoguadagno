import {
  LATEST_SUPPORTED_YEAR,
  param,
  REGIONS_LIST,
  SUPPORTED_YEARS,
  yearStart,
  type Bracket,
  type SupportedYear,
} from "@/data/index.ts";
import {
  listText,
  numberText,
  percentPhrase,
  percentText,
  wholeMoneyText,
} from "@/islands/prose/phrases.ts";
import { regionalRates, type Formatting } from "@/islands/sources/describe.ts";

export interface GlossaryTerm {
  readonly id: string;
  readonly term: string;
  readonly definition: string;
}

export interface GlossarySection {
  readonly id: string;
  readonly title: string;
  readonly terms: readonly GlossaryTerm[];
}

type DefinitionValues = (year: SupportedYear, f: Formatting) => Record<string, string | number>;

const NO_VALUES: DefinitionValues = () => ({});

function whole(amount: number, f: Formatting): string {
  return wholeMoneyText(amount, f.locale);
}

function rangeStart(amount: number, f: Formatting): string {
  return f.locale === "it" ? numberText(amount, f.locale, 0) : whole(amount, f);
}

function bracketPhrase(bracket: Bracket, index: number, f: Formatting): string {
  const rate = percentText(bracket.rate, f.locale);
  if (index === 0 && bracket.max !== null) {
    return f.t("glossario.bracket.first", { rate, max: whole(bracket.max, f) });
  }
  if (bracket.max === null)
    return f.t("glossario.bracket.last", { rate, min: whole(bracket.min, f) });
  return f.t("glossario.bracket.middle", {
    rate,
    min: rangeStart(bracket.min, f),
    max: whole(bracket.max, f),
  });
}

function firstYearWithTaxWedgeCut(): SupportedYear | undefined {
  return SUPPORTED_YEARS.find((year) => param("irpef.taxWedgeCut", yearStart(year)) !== null);
}

const DEFINITION_VALUES: Readonly<Record<string, DefinitionValues>> = {
  irpef: (year, f) => ({
    year,
    brackets: listText(
      param("irpef.brackets", yearStart(year)).map((bracket, index) =>
        bracketPhrase(bracket, index, f),
      ),
      f.locale,
    ),
  }),
  detrazione: (year, f) => {
    const work = param("irpef.workDeduction", yearStart(year));
    return { max: whole(work.baseDeduction, f), end: whole(work.thresholds[2], f) };
  },
  trattamento: (year, f) => {
    const rules = param("irpef.trattamentoIntegrativo", yearStart(year));
    return {
      max: whole(rules.maxAnnualBonus, f),
      full: whole(rules.fullBonusThreshold, f),
      partial: whole(rules.partialBonusThreshold, f),
    };
  },
  cuneo: (year, f) => {
    const wedge = param("irpef.taxWedgeCut", yearStart(year));
    const since = firstYearWithTaxWedgeCut() ?? year;
    const sommaLimit = wedge?.sommaAggiuntiva.at(-1)?.maxIncome ?? 0;
    return {
      since,
      sommaLimit: whole(sommaLimit, f),
      detrMax: whole(wedge?.detrazioneAggiuntiva.maxDeduction ?? 0, f),
      detrFull: whole(wedge?.detrazioneAggiuntiva.fullDeductionThreshold ?? 0, f),
      detrEnd: whole(wedge?.detrazioneAggiuntiva.phaseOutEnd ?? 0, f),
    };
  },
  regionale: (year, f) => {
    const rates = REGIONS_LIST.flatMap((region) => regionalRates(region.rules[year]));
    return {
      year,
      from: percentPhrase(Math.min(...rates), f.locale, "dal"),
      to: percentPhrase(Math.max(...rates), f.locale, "al"),
    };
  },
  inps: (year, f) => {
    const date = yearStart(year);
    return {
      year,
      rate: percentPhrase(param("inps.employee.rate", date), f.locale),
      band: whole(param("inps.firstBand", date), f),
      rateAbove: percentPhrase(param("inps.employee.rateAboveFirstBand", date), f.locale),
    };
  },
  tfr: (year, f) => {
    const tfr = param("tfr", yearStart(year));
    return {
      divisor: numberText(tfr.accrualDivisor, f.locale),
      share: percentPhrase(1 / tfr.accrualDivisor, f.locale),
      fixed: percentPhrase(tfr.fixedRevaluationRate, f.locale, "del"),
      inflation: percentPhrase(tfr.inflationPercentage, f.locale),
    };
  },
  naspi: (year) => {
    const rules = param("naspi.rules", yearStart(year));
    return { weeks: rules.minWeeks, years: rules.lookbackYears };
  },
  forfettario: (year, f) => {
    const date = yearStart(year);
    const rates = param("forfettario.taxRates", date);
    return {
      maxRevenue: whole(param("forfettario.limits", date).maxRevenue, f),
      rate: percentPhrase(rates.standardRate, f.locale, "del"),
      startupRate: percentPhrase(rates.startupRate, f.locale),
      startupYears: rates.startupYears,
    };
  },
  coefficiente: (year, f) => {
    const coefficients = Object.values(param("forfettario.coefficients", yearStart(year)));
    return {
      from: percentPhrase(Math.min(...coefficients), f.locale, "dal"),
      to: percentPhrase(Math.max(...coefficients), f.locale, "al"),
    };
  },
  sostitutiva: (year, f) => {
    const pdr = param("pdr", yearStart(year));
    return {
      year,
      pdrRate: percentPhrase(pdr.rate, f.locale),
      pdrMax: whole(pdr.maxAmount, f),
    };
  },
};

interface SectionDefinition {
  readonly id: string;
  readonly title: string;
  readonly terms: readonly string[];
}

const SECTIONS: readonly SectionDefinition[] = [
  {
    id: "busta-paga",
    title: "glossario.section.pay",
    terms: ["ral", "mensilita", "imponibile", "ccnl"],
  },
  {
    id: "imposte",
    title: "glossario.section.taxes",
    terms: ["irpef", "scaglione", "detrazione", "trattamento", "cuneo", "regionale", "comunale"],
  },
  { id: "contributi", title: "glossario.section.contributions", terms: ["inps", "tfr", "naspi"] },
  {
    id: "partita-iva",
    title: "glossario.section.vat",
    terms: ["forfettario", "coefficiente", "sostitutiva"],
  },
];

export function glossarySections(
  f: Formatting,
  year: SupportedYear = LATEST_SUPPORTED_YEAR,
): readonly GlossarySection[] {
  return SECTIONS.map((section) => ({
    id: section.id,
    title: f.t(section.title),
    terms: section.terms.map((id) => ({
      id,
      term: f.t(`glossario.${id}.term`),
      definition: f.t(`glossario.${id}.definition`, (DEFINITION_VALUES[id] ?? NO_VALUES)(year, f)),
    })),
  }));
}
