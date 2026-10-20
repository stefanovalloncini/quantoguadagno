import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "netTable.scenario":
    "For a permanent employee in the private sector who lives in {city}, with {count} payslips a year and no dependants.",
  "netTable.action": "Calculate with your details",
  "netTable.understand.title": "Understanding the calculation",

  "netTable.column.gross": "Gross (RAL)",
  "netTable.column.net": "Annual net",
  "netTable.column.monthly": "Monthly over {count}",
  "netTable.column.withheld": "Deductions",
  "netTable.inline.monthly": "{count} payslips:",
  "netTable.inline.withheld": "deductions:",
  "netTable.row.suffix": "gross",

  "netTable.hub.title": "Gross to net table {year}",
  "netTable.hub.table.title": "All amounts",
  "netTable.hub.table.caption": "Net pay in {year} by gross salary, living in {city}",
  "netTable.hub.withheld":
    "Deductions: the part of the gross salary that does not reach the net, that is INPS contributions, IRPEF and surcharges less the payroll credits.",

  "netTable.page.title": "{gross} gross: net pay in {year}",
  "netTable.page.metaTitle": "{gross} gross: {monthly} net a month in {year}",
  "netTable.page.metaDescription":
    "On {gross} gross in {year} you keep {net} net a year: {thirteen} a month over 13 payslips, {fourteen} over 14. For an employee in {city}.",
  "netTable.page.crumb": "{gross} gross",
  "netTable.page.comuneSource":
    "Municipal surcharge of {city}: {ruleYear} data from the Department of Finance{carried, select, yes {; there is no new resolution for {year} yet} other {}}.",

  "netTable.ledger.title": "From gross to net",
  "netTable.ledger.municipalExempt":
    "No municipal surcharge: {city} does not charge it on taxable income up to {threshold}.",
  "netTable.ledger.municipalNone":
    "No municipal surcharge: the comune of {city} does not charge it.",
  "netTable.ledger.surchargesNotDue":
    "No regional or municipal surcharge: they are not due when net IRPEF is zero.",

  "netTable.months.title": "A month over 12, 13 or 14 payslips",
  "netTable.months.lead":
    "The annual net stays at {net}: only the number of payslips it is split into changes.",
  "netTable.months.caption": "Monthly net pay on {gross} gross, by number of payslips",
  "netTable.months.column.count": "Payslips",
  "netTable.months.column.net": "Net a month",
  "netTable.months.row": "{count} payslips",

  "netTable.cities.title": "In the regional capitals",
  "netTable.cities.lead":
    "On {gross} gross the annual net pay ranges from {low} ({lowCities}) to {high} ({highCities}): only the regional and municipal surcharges change.",
  "netTable.cities.caption":
    "Net pay in {year} on {gross} gross in the capitals of the regions and autonomous provinces",
  "netTable.cities.column.region": "Region",
  "netTable.cities.column.city": "Capital",
  "netTable.cities.reference": "reference",
  "netTable.cities.note":
    "Each capital opens the calculator with its comune; {city} is the reference for this page.",

  "netTable.raise.title": "If the gross salary goes up by {amount}",
  "netTable.raise.gain":
    "On {gross} gross the annual net pay goes up by {annual}, that is {monthly} a month over {count} payslips: you keep {cents, plural, one {# cent} other {# cents}} of every extra gross euro.",
  "netTable.raise.loss":
    "On {gross} gross the annual net pay goes down by {annual}: the raise crosses a threshold and part of the credits or deductions is lost.",

  "netTable.employer.title": "What it costs the employer",
  "netTable.employer.body":
    "For the company, a gross salary of {gross} costs {cost} a year: on top of the {gross} gross come {inps} of INPS contributions, {tfr} of severance pay (TFR, trattamento di fine rapporto) and {other} of other contributions.",
  "netTable.employer.link": "Work out the employer cost",

  "netTable.pager.label": "Other amounts",
  "netTable.pager.previous": "Previous",
  "netTable.pager.next": "Next",
  "netTable.pager.all": "All amounts in the gross to net table",
};
