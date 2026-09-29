import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "inflation.title": "Purchasing power over time",
  "inflation.lede": "What an amount from another year is worth today, using the ISTAT FOI index.",
  "inflation.form.amount": "Amount",
  "inflation.form.amount.hint":
    "The amount whose real value you want to compare between two years.",
  "inflation.form.fromYear": "From year",
  "inflation.form.toYear": "To year",
  "inflation.result.adjusted": "Equivalent in {year}",
  "inflation.result.adjusted.sub": "Same purchasing power as {year}",
  "inflation.result.cumulative": "Cumulative inflation",
  "inflation.result.stale":
    "Not up to date: this is the previous result. Fix the flagged values to recalculate.",
  "inflation.result.announce": "{amount} from {fromYear} is equivalent to {adjusted} in {toYear}.",
  "inflation.result.note":
    "Based on the ISTAT FOI index (consumer prices for blue- and white-collar households), 2015 base. It is the same index used to revalue TFR.",
  "inflation.result.verified": "Data checked on {date}",
  "inflation.result.provisionalBadge": "Provisional",
  "inflation.result.provisional": "The {year} figure is still provisional.",
  "inflation.assumptions.amount": "Amount of {amount}",
  "inflation.assumptions.amount.change": "Change the amount",
  "inflation.assumptions.fromYear": "From year {year}",
  "inflation.assumptions.fromYear.change": "Change the from year",
  "inflation.assumptions.toYear": "To year {year}",
  "inflation.assumptions.toYear.change": "Change the to year",
  "inflation.keepPace.title": "The raise it takes to match inflation",
  "inflation.keepPace.needed": "Amount needed in {year}",
  "inflation.keepPace.raise": "Raise",
  "inflation.keepPace.note":
    "The raise that brings the {from} amount back to the same purchasing power in {to}.",
  "inflation.frozen.title": "If the salary stays put",
  "inflation.frozen.hint": "The real value of the same amount, if it never goes up.",
  "inflation.frozen.caption": "Real value, in {year} euros",
  "inflation.frozen.col.year": "Year",
  "inflation.frozen.col.real": "Real value",
  "inflation.frozen.col.loss": "Loss",
  "inflation.frozen.row.base": "base year",
  "inflation.frozen.row.loss": "down {rate}",
  "inflation.frozen.row.gain": "up {rate}",
  "inflation.frozen.chart.caption": "The real value is computed at {year} prices.",
  "inflation.frozen.seriesEnd":
    "The ISTAT FOI series ends in {year}, nothing is projected beyond it.",
  "inflation.form.fromYear.error": "Choose a year from the ISTAT FOI series.",
  "inflation.form.toYear.error": "Choose a year from the ISTAT FOI series.",
};
