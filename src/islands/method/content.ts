import {
  COMUNI_SOURCE,
  latestVerification,
  param,
  SUPPORTED_YEARS,
  yearStart,
  type Bracket,
  type ComunaleRule,
  type ParamKey,
  type Source,
  type SupportedYear,
} from "@/data/index.ts";
import { listParameters } from "@/data/fonti.ts";
import type { Locale } from "@/i18n/locales.ts";
import {
  dateValues,
  listText,
  moneyText,
  numberText,
  percentPhrase,
  percentText,
  shortReference,
  wholeMoneyText,
  yearsInProse,
} from "@/islands/prose/phrases.ts";
import { regionalRates, type Formatting } from "@/islands/sources/describe.ts";
import { EXAMPLE_REGION, netSteps, type BracketShare, type MethodExample } from "./example.ts";

const EXAMPLE_REGION_KEY = `regions.${EXAMPLE_REGION}` as const;

export type CitationId =
  "inps" | "irpef" | "workDeduction" | "taxWedge" | "regional" | "comuni" | "trattamento";

export interface Citation {
  readonly id: CitationId;
  readonly anchor: string;
  readonly source: Source;
  readonly label: string;
  readonly description: string;
}

export interface Sentence {
  readonly text: string;
  readonly cite?: CitationId | undefined;
}

export interface LedgerLine {
  readonly id: string;
  readonly name: string;
  readonly rule: string;
  readonly amount: number;
  readonly subtracted: boolean;
  readonly subtotal: boolean;
}

export interface BracketRow {
  readonly label: string;
  readonly rates: readonly string[];
}

export interface BracketTable {
  readonly years: readonly SupportedYear[];
  readonly rows: readonly BracketRow[];
}

export interface MethodContent {
  readonly lede: string;
  readonly meta: string;
  readonly citations: readonly Citation[];
  readonly inps: readonly Sentence[];
  readonly inpsLedger: readonly LedgerLine[];
  readonly irpef: readonly Sentence[];
  readonly bracketTable: BracketTable;
  readonly irpefWorked: readonly Sentence[];
  readonly deductions: readonly Sentence[];
  readonly deductionLedger: readonly LedgerLine[];
  readonly surcharges: readonly Sentence[];
  readonly credits: readonly Sentence[];
  readonly rounding: readonly Sentence[];
}

const CITATION_ORDER: readonly CitationId[] = [
  "inps",
  "irpef",
  "workDeduction",
  "taxWedge",
  "regional",
  "comuni",
  "trattamento",
];

const LISTING = listParameters();

function sourceOf(key: ParamKey, year: SupportedYear): Source {
  const entry = LISTING.find((listing) => listing.key === key)?.years.find(
    (candidate) => candidate.year === year,
  );
  if (entry === undefined) throw new Error(`No source for ${key} in ${String(year)}`);
  return entry.source;
}

function citationSource(id: CitationId, example: MethodExample): Source {
  const { year } = example;
  switch (id) {
    case "inps":
      return sourceOf("inps.firstBand", year);
    case "irpef":
      return sourceOf("irpef.brackets", year);
    case "workDeduction":
      return sourceOf("irpef.workDeduction", year);
    case "taxWedge":
      return sourceOf("irpef.taxWedgeCut", year);
    case "regional":
      return sourceOf(EXAMPLE_REGION_KEY, year);
    case "comuni":
      return COMUNI_SOURCE;
    case "trattamento":
      return sourceOf("irpef.trattamentoIntegrativo", year);
  }
}

function citations(example: MethodExample, f: Formatting): readonly Citation[] {
  return CITATION_ORDER.map((id, index) => {
    const source = citationSource(id, example);
    return {
      id,
      anchor: `fonte-${String(index + 1)}`,
      source,
      label: f.t("method.cite", { reference: shortReference(source.ref) }),
      description: f.t(`method.ref.${id}`, { region: example.regionName }),
    };
  });
}

function money(amount: number, f: Formatting): string {
  return moneyText(amount, f.locale);
}

function whole(amount: number, f: Formatting): string {
  return wholeMoneyText(amount, f.locale);
}

function rangeStart(amount: number, f: Formatting): string {
  return f.locale === "it" ? numberText(amount, f.locale, 0) : whole(amount, f);
}

function inpsSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  const date = yearStart(example.year);
  return [
    {
      text: f.t("method.inps.body", {
        rate: percentPhrase(param("inps.employee.rate", date), f.locale),
        band: whole(param("inps.firstBand", date), f),
        year: example.year,
        rateAbove: percentPhrase(param("inps.employee.rateAboveFirstBand", date), f.locale),
      }),
      cite: "inps",
    },
  ];
}

function inpsLedger(example: MethodExample, f: Formatting): readonly LedgerLine[] {
  const { breakdown } = example;
  return [
    {
      id: "gross",
      name: f.t("method.ledger.gross"),
      rule: f.t("method.ledger.gross.rule"),
      amount: breakdown.grossAnnual,
      subtracted: false,
      subtotal: false,
    },
    {
      id: "inps",
      name: f.t("method.ledger.inps"),
      rule: f.t("method.ledger.inps.rule", { rate: percentText(breakdown.inpsRate, f.locale) }),
      amount: breakdown.inpsContribution,
      subtracted: true,
      subtotal: false,
    },
    {
      id: "taxable",
      name: f.t("method.ledger.taxable"),
      rule: f.t("method.ledger.taxable.rule"),
      amount: breakdown.taxableIncome,
      subtracted: false,
      subtotal: true,
    },
  ];
}

function bracketChangeSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  return example.bracketChanges.map((change) => ({
    text: f.t("method.irpef.change", {
      year: example.year,
      min: rangeStart(change.bracket.min, f),
      max: whole(change.bracket.max ?? change.bracket.min, f),
      direction: change.bracket.rate < change.previousRate ? "down" : "up",
      from: percentPhrase(change.previousRate, f.locale, "dal"),
      to: percentPhrase(change.bracket.rate, f.locale, "al"),
    }),
    cite: "irpef",
  }));
}

function rateInYear(bracket: Bracket, year: SupportedYear): number {
  const brackets = param("irpef.brackets", yearStart(year));
  const match = brackets.find(
    (candidate) =>
      candidate.min <= bracket.min && (candidate.max === null || bracket.min < candidate.max),
  );
  return match?.rate ?? bracket.rate;
}

function bracketRowLabel(bracket: Bracket, f: Formatting): string {
  if (bracket.min === 0 && bracket.max !== null) {
    return f.t("method.irpef.table.upTo", { max: whole(bracket.max, f) });
  }
  if (bracket.max === null) return f.t("method.irpef.table.above", { min: whole(bracket.min, f) });
  const low = numberText(bracket.min, f.locale, 0);
  const high = whole(bracket.max, f);
  return f.locale === "it" ? `${low}\u2013${high}` : `${whole(bracket.min, f)}\u2013${high}`;
}

function bracketTable(example: MethodExample, f: Formatting): BracketTable {
  const latest = param("irpef.brackets", yearStart(example.year));
  return {
    years: SUPPORTED_YEARS,
    rows: latest.map((bracket) => ({
      label: bracketRowLabel(bracket, f),
      rates: SUPPORTED_YEARS.map((year) => percentText(rateInYear(bracket, year), f.locale)),
    })),
  };
}

function shareText(share: BracketShare, f: Formatting): string {
  return f.t(`method.irpef.share.${share.position}`, {
    rate: percentPhrase(share.bracket.rate, f.locale),
    amount: whole(share.amount, f),
    tax: money(share.tax, f),
  });
}

function irpefWorked(example: MethodExample, f: Formatting): readonly Sentence[] {
  const { breakdown } = example;
  return [
    {
      text: f.t("method.irpef.worked", {
        taxable: money(breakdown.taxableIncome, f),
        parts: listText(
          example.shares.map((share) => shareText(share, f)),
          f.locale,
        ),
      }),
    },
    { text: f.t("method.irpef.total", { total: money(breakdown.irpefGross, f) }) },
  ];
}

function bracketsRule(shares: readonly BracketShare[], f: Formatting): string {
  return shares
    .map((share, index) => {
      const rate = percentText(share.bracket.rate, f.locale);
      const isLast = index === shares.length - 1;
      if (isLast && index > 0) return f.t("method.ledger.bracketAbove", { rate });
      if (share.bracket.max === null || shares.length === 1) return rate;
      return f.t("method.ledger.bracketUpTo", { rate, max: whole(share.bracket.max, f) });
    })
    .join(", ");
}

function deductionSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  const date = yearStart(example.year);
  const work = param("irpef.workDeduction", date);
  const wedge = param("irpef.taxWedgeCut", date);
  const sentences: Sentence[] = [
    { text: f.t("method.deductions.intro") },
    {
      text: f.t("method.deductions.work", { end: whole(work.thresholds[2], f) }),
      cite: "workDeduction",
    },
  ];
  const lastSomma = wedge?.sommaAggiuntiva.at(-1);
  if (wedge !== null && lastSomma !== undefined) {
    sentences.push({
      text: f.t("method.deductions.wedge", {
        from: rangeStart(lastSomma.maxIncome, f),
        to: whole(wedge.detrazioneAggiuntiva.phaseOutEnd, f),
        max: whole(wedge.detrazioneAggiuntiva.maxDeduction, f),
      }),
      cite: "taxWedge",
    });
  }
  return sentences;
}

function deductionLedger(example: MethodExample, f: Formatting): readonly LedgerLine[] {
  const { breakdown } = example;
  const lines: LedgerLine[] = [
    {
      id: "irpefGross",
      name: f.t("method.ledger.irpefGross"),
      rule: bracketsRule(example.shares, f),
      amount: breakdown.irpefGross,
      subtracted: false,
      subtotal: false,
    },
  ];
  if (breakdown.irpefDeduction !== 0) {
    lines.push({
      id: "workDeduction",
      name: f.t("method.ledger.workDeduction"),
      rule: f.t("method.ledger.workDeduction.rule"),
      amount: breakdown.irpefDeduction,
      subtracted: true,
      subtotal: false,
    });
  }
  if (breakdown.detrazioneAggiuntiva !== 0) {
    lines.push({
      id: "detrazioneAggiuntiva",
      name: f.t("method.ledger.detrazioneAggiuntiva"),
      rule: f.t("method.ledger.detrazioneAggiuntiva.rule"),
      amount: breakdown.detrazioneAggiuntiva,
      subtracted: true,
      subtotal: false,
    });
  }
  lines.push({
    id: "irpefNet",
    name: f.t("method.ledger.irpefNet"),
    rule: f.t("method.ledger.irpefNet.rule"),
    amount: breakdown.irpefNet,
    subtracted: false,
    subtotal: true,
  });
  return lines;
}

interface RateShape {
  readonly shape: "flat" | "brackets";
  readonly rate: string;
  readonly from: string;
  readonly to: string;
}

function rateShape(rates: readonly number[], f: Formatting): RateShape {
  const low = Math.min(...rates);
  const high = Math.max(...rates);
  return {
    shape: low === high ? "flat" : "brackets",
    rate: percentPhrase(low, f.locale),
    from: percentPhrase(low, f.locale, "dal"),
    to: percentPhrase(high, f.locale, "al"),
  };
}

function comunaleRates(rule: ComunaleRule): readonly number[] {
  const percents = rule.brackets === undefined ? [rule.rate] : rule.brackets.map((b) => b.rate);
  return percents.map((percent) => percent / 100);
}

function surchargeSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  const { breakdown, comune } = example;
  const regionalRules = param(EXAMPLE_REGION_KEY, yearStart(example.year));
  const regional = rateShape(regionalRates(regionalRules), f);
  const municipal = rateShape(comunaleRates(comune.rule), f);
  const sentences: Sentence[] = [
    { text: f.t("method.surcharges.intro") },
    {
      text: f.t("method.surcharges.regional", {
        region: example.regionName,
        year: example.year,
        ...regional,
        taxable: money(breakdown.taxableIncome, f),
        tax: money(breakdown.regionalTax, f),
      }),
      cite: "regional",
    },
    {
      text: f.t("method.surcharges.municipal", {
        comune: comune.name,
        ...municipal,
        hasExemption: comune.rule.exemption === undefined ? "no" : "yes",
        limit: comune.rule.exemption === undefined ? "" : whole(comune.rule.exemption, f),
        tax: money(breakdown.municipalTax, f),
      }),
      cite: "comuni",
    },
  ];
  if (comune.ruleYear < example.year) {
    sentences.push({
      text: f.t("method.surcharges.carryOver", { year: example.year, ruleYear: comune.ruleYear }),
    });
  }
  return sentences;
}

function creditCase(trattamento: number, somma: number): string {
  if (trattamento > 0 && somma > 0) return "both";
  if (trattamento > 0) return "trattamento";
  if (somma > 0) return "somma";
  return "none";
}

function creditSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  const date = yearStart(example.year);
  const rules = param("irpef.trattamentoIntegrativo", date);
  const wedge = param("irpef.taxWedgeCut", date);
  const { breakdown } = example;
  const sentences: Sentence[] = [
    { text: f.t("method.credits.intro") },
    {
      text: f.t("method.credits.trattamento", {
        max: whole(rules.maxAnnualBonus, f),
        full: whole(rules.fullBonusThreshold, f),
        partial: whole(rules.partialBonusThreshold, f),
      }),
      cite: "trattamento",
    },
  ];
  const lastSomma = wedge?.sommaAggiuntiva.at(-1);
  if (wedge !== null && lastSomma !== undefined) {
    const rates = wedge.sommaAggiuntiva.map((bracket) => bracket.rate);
    sentences.push({
      text: f.t("method.credits.somma", {
        limit: whole(lastSomma.maxIncome, f),
        low: percentPhrase(Math.min(...rates), f.locale),
        high: percentPhrase(Math.max(...rates), f.locale),
      }),
      cite: "taxWedge",
    });
  }
  sentences.push({
    text: f.t("method.credits.outcome", {
      case: creditCase(breakdown.trattamentoIntegrativo, breakdown.sommaAggiuntiva),
      gross: whole(breakdown.grossAnnual, f),
      trattamento: money(breakdown.trattamentoIntegrativo, f),
      somma: money(breakdown.sommaAggiuntiva, f),
    }),
  });
  return sentences;
}

const MINUS_SIGN = "\u2212";
const NO_BREAK_SPACE = "\u00a0";

export function netEquation(example: MethodExample, locale: Locale): string {
  const steps = netSteps(example.breakdown);
  const terms = steps.map((step, index) => {
    const amount = moneyText(step.amount, locale);
    if (index === 0) return amount;
    const operator = step.sign === 1 ? "+" : MINUS_SIGN;
    return `${operator}${NO_BREAK_SPACE}${amount}`;
  });
  return `${terms.join(" ")} =${NO_BREAK_SPACE}${moneyText(example.breakdown.netAnnual, locale)}`;
}

function roundingSentences(example: MethodExample, f: Formatting): readonly Sentence[] {
  return [
    { text: f.t("method.rounding.rule") },
    { text: f.t("method.rounding.sum", { equation: netEquation(example, f.locale) }) },
  ];
}

export function methodContent(example: MethodExample, f: Formatting): MethodContent {
  const checked = latestVerification();
  return {
    lede: f.t("method.lede", {
      gross: whole(example.gross, f),
      year: example.year,
      comune: example.comune.name,
    }),
    meta: f.t("method.meta", {
      ...(checked === null ? { date: "", dateArticle: "il" } : dateValues(checked, f.locale)),
      years: yearsInProse(SUPPORTED_YEARS, f.locale),
    }),
    citations: citations(example, f),
    inps: inpsSentences(example, f),
    inpsLedger: inpsLedger(example, f),
    irpef: [{ text: f.t("method.irpef.body") }, ...bracketChangeSentences(example, f)],
    bracketTable: bracketTable(example, f),
    irpefWorked: irpefWorked(example, f),
    deductions: deductionSentences(example, f),
    deductionLedger: deductionLedger(example, f),
    surcharges: surchargeSentences(example, f),
    credits: creditSentences(example, f),
    rounding: roundingSentences(example, f),
  };
}
