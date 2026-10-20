import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "tfr.title": "How much TFR you build up",
  "tfr.lede": "The amount you build up year by year, revaluation and tax already worked out.",
  "tfr.ral.label": "Gross annual salary (RAL)",
  "tfr.ral.hint": "The gross salary the TFR quota is calculated on.",
  "tfr.form.years": "Years of service",
  "tfr.form.years.hint": "How many years you stay with the same employer.",
  "tfr.form.inflation": "Expected inflation",
  "tfr.form.inflation.hint": "Drives the yearly revaluation: 1.5% fixed plus 75% of inflation.",
  "tfr.result.stock": "Accumulated TFR",
  "tfr.result.stock.sub": "Annual quota {amount}, before separate taxation",
  "tfr.result.empty": "Enter your gross annual salary to see the accumulated TFR.",
  "tfr.result.fix": "Correct the marked values to see the accumulated TFR.",
  "tfr.result.announce":
    "Accumulated TFR {amount} after {years, plural, one {one year} other {# years}}.",
  "tfr.result.stale":
    "Not up to date: this is the previous result. Correct the marked values to recalculate.",
  "tfr.result.verified": "Data checked on {date}",
  "tfr.breakdown.quote": "Quotas set aside",
  "tfr.breakdown.quote.explain":
    "Gross annual salary divided by 13.5, net of the 0.50% withheld as an IVS contribution (art. 3, Law 297/1982).",
  "tfr.breakdown.revaluation": "Net revaluation",
  "tfr.breakdown.revaluation.explain":
    "1.5% fixed plus 75% of the expected inflation on the previous year’s balance, net of the 17% substitute tax.",
  "tfr.ledger.title": "Breakdown",
  "tfr.ledger.caption": "Breakdown over {years} years, amounts in euros",
  "tfr.ledger.column.term": "Item",
  "tfr.ledger.column.total": "Amount",
  "tfr.schedule.title": "Year by year",
  "tfr.schedule.caption": "Year-by-year accrual, amounts in euros",
  "tfr.schedule.year": "Year",
  "tfr.schedule.quota": "Quota",
  "tfr.schedule.revaluation": "Revaluation",
  "tfr.schedule.stock": "Accumulated",
  "tfr.result.note":
    "each year you set aside about 7.4% of your salary, revalued at 1.5% plus 75% of ISTAT inflation, with a 17% substitute tax on the revaluation. At payout, separate taxation applies and is not computed here.",
};
