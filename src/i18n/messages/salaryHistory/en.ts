import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "history.title": "Your salaries over time",
  "history.lede":
    "Add your gross annual salary for each year: we compare it with inflation, using the ISTAT price index up to {target}, and from {firstTax} we also estimate the net pay.",

  "history.form.title": "Add a year",
  "history.form.errors": "There is a problem",
  "history.form.year": "Year",
  "history.form.gross": "Gross annual salary",
  "history.form.gross.hint": "The one in your contract that year, for example 32,000.",
  "history.form.gross.readAs": "Read as {amount}",
  "history.form.duplicate": "You already added {year}: remove it from the list to enter it again.",
  "history.form.note": "Note, optional",
  "history.form.note.hint": "For example the employer or the role: you will see it in the list.",
  "history.form.submit": "Add the year",
  "history.form.privacy":
    "The years you add stay in this browser only: we never send them anywhere.",

  "history.net.title": "To work out the net pay",
  "history.net.recap": "{contract}, {count} payslips, {region}, municipal surcharge {rate}",
  "history.contract.legend": "Contract type",
  "history.contract.indeterminato": "Permanent",
  "history.contract.determinato": "Fixed term",
  "history.contract.apprendistato": "Apprenticeship",
  "history.frequency.legend": "Payslips a year",
  "history.frequency.hint": "How many payslips a year: 13 with the thirteenth-month pay.",
  "history.region.label": "Region of residence",
  "history.municipal.label": "Municipal surcharge rate",
  "history.municipal.hint": "You find it in your municipality’s resolution, for example 0.8.",
  "history.largeCompany.label": "Company with more than 15 employees",
  "history.family.title": "Dependants",
  "history.family.none": "None",
  "history.family.spouse": "Dependent spouse",
  "history.family.children": "Dependent children aged 21 or over",
  "history.family.children.hint":
    "Younger children get the universal child allowance, not a payslip deduction.",
  "history.family.others": "Other dependent relatives",
  "history.family.part.spouse": "spouse",
  "history.family.part.children": "{count, plural, one {# child} other {# children}}",
  "history.family.part.others": "{count, plural, one {# other relative} other {# other relatives}}",

  "history.result.change": "Purchasing power",
  "history.result.change.basis": "from {first} to {last}",
  "history.result.change.sub":
    "Your gross salary went from {from} to {to}, {nominal}; in {target} euro from {fromReal} to {toReal}.",
  "history.result.single": "Gross salary in {year}",
  "history.result.single.real": "In {target} euro that is {amount}.",
  "history.result.single.more": "Add another year to see how your purchasing power changed.",
  "history.result.empty":
    "Add your gross salary for at least two years to see whether it kept up with inflation.",
  "history.announce.added": "Added {year}: {amount}.",
  "history.announce.change": "Purchasing power from {first} to {last}: {change}.",
  "history.announce.removed": "Removed {year}.",
  "history.announce.cleared": "You removed every year.",

  "history.note.estimate":
    "we revalue the salary with the ISTAT FOI consumer price index, yearly average; the {target} figure is provisional. The net pay uses each year’s tax rules and is available from {firstTax} only.",
  "history.note.verified": "Data checked on {dateArticle, select, other {}}{date}",

  "history.note.trust": "{checked}.",

  "history.entries.title": "Years you added",
  "history.entries.caption": "Years you added, oldest first, gross and net amounts in euro",
  "history.entries.year": "Year",
  "history.entries.gross": "Gross",
  "history.entries.real": "In {target} euro",
  "history.entries.net": "Net a year",
  "history.entries.actions": "Actions",
  "history.entries.remove": "Remove",
  "history.entries.remove.target": "{year}",
  "history.entries.netMissing": "not estimated",
  "history.entries.realMissing": "not available",
  "history.entries.netNote":
    "Net pay is only available from {firstTax}: we do not have the tax rules for earlier years.",
  "history.entries.migrated": "default settings",
  "history.entries.migratedNote":
    "Years saved with the previous version of the site use default settings for the net pay: {count} payslips, {region}, municipal surcharge {rate}. To change them, remove those years and add them again.",
  "history.entries.clear": "Remove every year",
  "history.entries.clear.question":
    "Remove {count, plural, one {the year saved} other {the # years saved}} in this browser?",
  "history.entries.clear.confirm": "Yes, remove them",
  "history.entries.clear.cancel": "Cancel",

  "history.chart.title": "Over time",
  "history.chart.hint":
    "Your gross salary as it was each year and its value in {target} euro, that is with inflation taken out.",
  "history.chart.hint.projected": "The dashed line is the estimate for the coming years.",
  "history.chart.nominal": "Gross salary",
  "history.chart.real": "Gross in {target} euro",
  "history.chart.projected": "Estimated gross",
  "history.chart.summary":
    "Gross salary from {first} to {last}: from {from} to {to}; in {target} euro from {fromReal} to {toReal}.",
  "history.chart.summary.projected": "Estimate up to {year}: {amount}.",
  "history.chart.caption":
    "Gross salaries a year, in euro. The values for the years you added are in the “Years you added” table.",
  "history.chart.caption.projected":
    "Gross salaries a year, in euro. The values for the years you added are in the “Years you added” table, the estimates in the projection table.",
  "history.chart.year": "Year",

  "history.projection.title": "Projection",
  "history.projection.hint":
    "We start from your {year} gross salary, {amount}, and grow it every year; the net pay uses the {taxYear} tax rules.",
  "history.projection.growth": "Yearly salary growth",
  "history.projection.growth.hint":
    "It starts at the average inflation of the last 3 years, {rate}.",
  "history.projection.horizon": "Years to estimate",
  "history.projection.caption": "Estimated gross and net salary",
  "history.projection.year": "Year",
  "history.projection.gross": "Gross",
  "history.projection.net": "Net a year",
  "history.projection.empty":
    "The projection needs a year from {firstTax} onwards: add one and you will see it here.",
  "history.projection.stale": "Out of date: correct the yearly growth to recalculate.",
};
