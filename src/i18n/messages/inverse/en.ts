import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "inverse.title": "From net to gross",
  "inverse.lede":
    "The gross annual salary (RAL) you need for the net pay you want, from {first} to {last}.",

  "inverse.target.label": "Annual net pay you want",
  "inverse.target.hint": "Your payslips for a year, 13th-month pay included.",
  "inverse.target.readAs": "Read as {amount}",
  "inverse.target.monthly": "{amount} net a month over {count} payslips",
  "inverse.target.monthlyNote":
    "Is this a monthly amount? Annual net pay is a whole year: {monthly} a month over {count} payslips is {annual}.",
  "inverse.target.grossQuestion": "Already know the gross salary?",
  "inverse.target.grossLink": "Work out the net from the gross",
  "inverse.year.legend": "Tax year",
  "inverse.region.label": "Region of residence",
  "inverse.frequency.legend": "Payslips a year",
  "inverse.frequency.hint":
    "How many payslips you get in a year: 13 with the 13th-month pay, 14 with the 14th as well.",

  "inverse.extras.title": "Adjust the calculation",
  "inverse.extras.hint":
    "Your comune, payslips a year and contract change the gross you need; the group shows the values in use.",
  "inverse.group.contract": "Contract and INPS",
  "inverse.contract.legend": "Contract type",
  "inverse.contract.hint":
    "With an apprenticeship INPS contributions drop to {article, select, other {}}{rate}; fixed-term and permanent contracts need the same gross.",
  "inverse.contract.indeterminato": "Permanent",
  "inverse.contract.determinato": "Fixed-term",
  "inverse.contract.apprendistato": "Apprenticeship",
  "inverse.public.label": "Public sector employee",
  "inverse.public.hint":
    "Contributions are {article, select, other {}}{publicRate} instead of {baseArticle, select, other {}}{rate}.",
  "inverse.large.label": "Company with more than 15 employees",
  "inverse.large.hint":
    "Contributions rise to {article, select, other {}}{rate} for the extraordinary wage guarantee fund.",
  "inverse.part.contractType":
    "{type, select, determinato {Fixed-term} apprendistato {Apprenticeship} other {Permanent}}",
  "inverse.part.sector": "{public, select, yes {public sector} other {private sector}}",
  "inverse.part.largeCompany": "company with more than 15 employees",
  "inverse.part.inpsRate": "contributions {rate}",

  "inverse.result.label": "Gross salary needed",
  "inverse.result.basis": "for {amount} net a year",
  "inverse.result.monthly": "Monthly gross {amount} over {count} payslips",
  "inverse.result.net":
    "With this gross your net pay is {annual} a year, {monthly} on average for each of the {count} payslips.",
  "inverse.result.notConverged":
    "No gross salary gives exactly {target} net: at this income a legal threshold makes net pay change in steps. The closest gross gives {annual} net a year.",
  "inverse.result.empty": "Enter the annual net pay to see the gross salary.",
  "inverse.result.fix": "Correct the marked values to see the gross salary.",
  "inverse.result.staleTarget":
    "Out of date: this is the gross for {amount} net. Correct the annual net pay to recalculate.",
  "inverse.result.staleOther":
    "Out of date: this is the previous result. Correct the marked values to recalculate.",
  "inverse.result.announce": "Gross salary needed {amount}, for {target} net a year.",
  "inverse.result.estimate": "your payslip is what counts.",
  "inverse.result.verified": "Data checked on {date}",
  "inverse.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",

  "inverse.ledger.title": "Breakdown",
  "inverse.ledger.caption": "How the {year} calculation adds up, amounts in euros",
  "inverse.ledger.column.term": "Item",
  "inverse.ledger.column.monthly": "Monthly average",
  "inverse.ledger.column.annual": "Annual",
  "inverse.ledger.gross": "Gross",
  "inverse.ledger.gross.rule": "RAL",
  "inverse.ledger.gross.explain":
    "The gross annual salary (RAL) you need: what you earn in a year before contributions and taxes.",
  "inverse.ledger.inps": "INPS contributions",
  "inverse.ledger.inps.rule": "{rate} of gross",
  "inverse.ledger.inps.explain":
    "Contributions towards your pension, paid to the national social security institute (INPS) and withheld from your pay.",
  "inverse.ledger.taxable": "Taxable income",
  "inverse.ledger.taxable.rule": "gross minus contributions",
  "inverse.ledger.taxable.explain":
    "Gross pay minus contributions: personal income tax (IRPEF) and the surcharges are worked out on this figure.",
  "inverse.ledger.irpef": "Net IRPEF",
  "inverse.ledger.irpef.rule": "by bracket, minus deductions",
  "inverse.ledger.irpef.explain":
    "IRPEF is worked out by bracket on taxable income; then the deductions you are entitled to come off.",
  "inverse.ledger.irpef.gross": "Gross IRPEF",
  "inverse.ledger.irpef.deductions": "Deductions",
  "inverse.ledger.ruleNotDue": "{name}, not due",
  "inverse.ledger.ruleExempt": "{name}, exempt up to {amount}",
  "inverse.ledger.regional": "Regional surcharge",
  "inverse.ledger.regional.explain":
    "Your region’s tax on taxable income. It is due only when net IRPEF is above zero.",
  "inverse.ledger.municipal": "Municipal surcharge",
  "inverse.ledger.municipal.ruleNone": "no comune chosen, {rate}",
  "inverse.ledger.municipal.ruleManual": "rate entered, {rate}",
  "inverse.ledger.municipal.ruleZero": "{name}, no surcharge",
  "inverse.ledger.municipal.explain":
    "Your comune’s tax on taxable income. It is due only when net IRPEF is above zero.",
  "inverse.ledger.somma": "Extra payment",
  "inverse.ledger.somma.rule": "tax wedge cut",
  "inverse.ledger.somma.explain":
    "With the tax wedge cut, anyone with employment income up to {max} gets an extra amount in their pay. It is not taxed.",
  "inverse.ledger.trattamento": "Supplementary payment",
  "inverse.ledger.trattamento.rule": "up to {max} a year",
  "inverse.ledger.trattamento.explain":
    "A payroll credit for lower incomes, up to {max} a year. It is added to net pay.",
  "inverse.ledger.net": "Net",
  "inverse.ledger.net.rule": "taxable minus IRPEF and surcharges",
  "inverse.ledger.net.ruleCredits": "taxable minus taxes, plus credits",
  "inverse.ledger.net.explain":
    "What you receive: {annual} in a year, {monthly} on average for each of the {count} payslips.",

  "inverse.action.print": "Print the payslip for this gross",
  "inverse.action.employerCost": "Work out what it costs the company",
};
