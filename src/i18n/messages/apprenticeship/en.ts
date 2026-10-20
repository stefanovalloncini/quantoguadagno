import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "apprenticeship.title": "Apprenticeship progression",
  "apprenticeship.lede":
    "An apprentice’s pay grows as a percentage of the target level, year by year.",
  "apprenticeship.form.target": "Target gross salary (RAL)",
  "apprenticeship.form.target.hint": "Final-level annual gross, after the apprenticeship ends.",
  "apprenticeship.form.years": "Duration in years",
  "apprenticeship.form.years.hint": "Typically 3 years; some CCNL contracts allow up to 5.",
  "apprenticeship.form.region": "Region for the net estimate",
  "apprenticeship.form.region.hint":
    "Change the region to update the estimate; the municipal surcharge stays fixed at 0.80%.",
  "apprenticeship.col.year": "Year",
  "apprenticeship.col.percent": "% of target",
  "apprenticeship.col.gross": "Gross annual",
  "apprenticeship.col.net": "Monthly net (estimate)",
  "apprenticeship.schedule.title": "Year by year",
  "apprenticeship.schedule.caption": "Pay progression by year of apprenticeship",
  "apprenticeship.result.label": "Monthly net in the first year",
  "apprenticeship.result.firstYear": "Monthly net in the first year",
  "apprenticeship.result.sub": "By year {year} you reach about {amount} a month",
  "apprenticeship.result.empty": "Enter the target gross salary to see the estimate.",
  "apprenticeship.result.fix": "Fix the values to see the estimate.",
  "apprenticeship.result.staleTarget":
    "Last valid estimate for {amount} gross a year: fix the target gross salary.",
  "apprenticeship.result.staleYears": "Fix the duration to update the estimate.",
  "apprenticeship.result.announce": "About {amount} net a month in the first year.",
  "apprenticeship.row.link": "Work out the net",
  "apprenticeship.row.openLink": "Work out the net for year {year}",
  "apprenticeship.assumptions.fixed":
    "Apprenticeship contract, {rate} municipal surcharge, {count} monthly payments",
  "apprenticeship.result.estimate":
    "your payslip is what counts. The municipal surcharge and the number of payments can be changed in the calculator: open a year from the table.",
  "apprenticeship.result.verified": "Data checked on {date}",
  "apprenticeship.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",
};
