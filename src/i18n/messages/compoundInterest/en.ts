import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "compoundInterest.title": "How your savings grow",
  "compoundInterest.lede":
    "How a capital grows over time, with periodic contributions and after expected inflation.",
  "compoundInterest.form.principal": "Initial principal",
  "compoundInterest.form.principal.hint": "The amount you start with.",
  "compoundInterest.form.annualRate": "Expected annual return",
  "compoundInterest.form.annualRate.hint": "Interest rate before inflation.",
  "compoundInterest.form.years": "Duration",
  "compoundInterest.form.years.unit": "years",
  "compoundInterest.form.contribution": "Periodic contribution",
  "compoundInterest.form.contribution.hint": "Leave at zero if you contribute nothing.",
  "compoundInterest.form.contributionFrequency": "Contribution frequency",
  "compoundInterest.form.contributionFrequency.monthly": "Monthly",
  "compoundInterest.form.contributionFrequency.yearly": "Yearly",
  "compoundInterest.form.contributionFrequency.none": "None",
  "compoundInterest.form.compoundingFrequency": "Compounding",
  "compoundInterest.form.compoundingFrequency.annually": "Annually",
  "compoundInterest.form.compoundingFrequency.monthly": "Monthly",
  "compoundInterest.form.compoundingFrequency.daily": "Daily",
  "compoundInterest.form.inflationRate": "Expected inflation",
  "compoundInterest.form.inflationRate.hint": "Used to compute the real final value.",
  "compoundInterest.result.finalNominal": "Final nominal value",
  "compoundInterest.result.finalReal": "In real terms {amount}, at today’s prices",
  "compoundInterest.result.split": "Contributed {contributions}, interest accrued {interest}.",
  "compoundInterest.result.stale":
    "Not up to date: this is the previous result. Fix the flagged values to recalculate.",
  "compoundInterest.result.announce":
    "Final nominal value {amount}, in real terms {real} at today’s prices.",
  "compoundInterest.schedule.title": "Year-by-year progression",
  "compoundInterest.schedule.year": "Year",
  "compoundInterest.schedule.balance": "Nominal balance",
  "compoundInterest.schedule.real": "Real balance",
  "compoundInterest.schedule.contributions": "Contributed",
  "compoundInterest.schedule.interest": "Interest",
  "compoundInterest.chart.title": "Growth over time",
  "compoundInterest.chart.hint": "Nominal and real balance, year by year.",
  "compoundInterest.chart.summary":
    "After {years, plural, one {one year} other {# years}}, the nominal balance reaches {nominal} and the real balance, at today’s prices, {real}.",
  "compoundInterest.chart.caption":
    "The real balance discounts expected inflation to today’s prices.",
  "compoundInterest.schedule.caption": "Year-by-year progression, amounts in euros",
  "compoundInterest.schedule.caption.partial": "The first 10 years, here.",
};
