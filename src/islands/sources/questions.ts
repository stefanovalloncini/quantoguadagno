import { param, yearStart, type ParamKey, type SupportedYear } from "@/data/index.ts";
import { numberText, percentPhrase, wholeMoneyText } from "@/islands/prose/phrases.ts";
import type { Formatting } from "./describe.ts";
import type { TodoItem } from "./model.ts";

export const MONTHS_PER_YEAR = 12;

export const LEGAL_NASPI_WEEKS_PER_MONTH = 4.33;

interface QuestionText {
  readonly title: string;
  readonly body: string;
}

type QuestionWriter = (year: SupportedYear, f: Formatting) => QuestionText;

function rangeStart(amount: number, f: Formatting): string {
  return f.locale === "it" ? numberText(amount, f.locale, 0) : wholeMoneyText(amount, f.locale);
}

const QUESTIONS: Partial<Record<ParamKey, QuestionWriter>> = {
  "irpef.taxWedgeCut": (year, f) => {
    const rules = param("irpef.trattamentoIntegrativo", yearStart(year));
    return {
      title: f.t("sources.question.taxWedgeCut.title", {
        from: rangeStart(rules.fullBonusThreshold, f),
        to: wholeMoneyText(rules.partialBonusThreshold, f.locale),
      }),
      body: f.t("sources.question.taxWedgeCut.body"),
    };
  },
  pdr: (year, f) => {
    const rules = param("pdr", yearStart(year));
    return {
      title: f.t("sources.question.pdr.title", { year }),
      body: f.t("sources.question.pdr.body", {
        rate: percentPhrase(rules.rate, f.locale, "del"),
        amount: wholeMoneyText(rules.maxAmount, f.locale),
      }),
    };
  },
  "employer.inps": (year, f) => {
    const employer = param("employer.inps", yearStart(year));
    const tfr = param("tfr", yearStart(year));
    return {
      title: f.t("sources.question.employer.title"),
      body: f.t("sources.question.employer.body", {
        contribution: percentPhrase(tfr.ivsContributionRate, f.locale, "del"),
        employerRate: percentPhrase(employer.rate, f.locale, "nel"),
      }),
    };
  },
  "naspi.rules": (year, f) => {
    const coefficient = param("naspi.rules", yearStart(year)).weeklyToMonthlyCoef;
    return {
      title: f.t("sources.question.naspi.title"),
      body: f.t("sources.question.naspi.body", {
        weeks: Math.round(coefficient * MONTHS_PER_YEAR),
        months: MONTHS_PER_YEAR,
        coefficient: numberText(coefficient, f.locale, 3),
        legal: numberText(LEGAL_NASPI_WEEKS_PER_MONTH, f.locale, 2),
      }),
    };
  },
};

export interface OpenQuestion extends QuestionText {
  readonly item: TodoItem;
}

export interface TodoOverview {
  readonly questions: readonly OpenQuestion[];
  readonly others: readonly TodoItem[];
}

export function todoOverview(
  items: readonly TodoItem[],
  year: SupportedYear,
  f: Formatting,
): TodoOverview {
  const questions: OpenQuestion[] = [];
  const others: TodoItem[] = [];
  for (const item of items) {
    const write = QUESTIONS[item.key as ParamKey];
    if (write === undefined) others.push(item);
    else questions.push({ ...write(year, f), item });
  }
  return { questions, others };
}
