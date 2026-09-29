import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "employerCost.title": "What an employee costs",
  "employerCost.lede":
    "What a gross annual salary (RAL) costs the company, from {first} to {last}.",

  "employerCost.gross.label": "Gross annual salary (RAL)",
  "employerCost.gross.hint": "It is in the contract or the offer letter.",
  "employerCost.gross.readAs": "Read as {amount}",
  "employerCost.gross.monthly": "{amount} gross a month over {count} payslips",
  "employerCost.gross.monthlyNote":
    "Is this a monthly amount? The RAL is a year’s gross pay: {monthly} a month over {count} payslips is {annual}.",
  "employerCost.year.legend": "Tax year",
  "employerCost.contract.label": "Contract type",
  "employerCost.contract.indeterminato": "Permanent",
  "employerCost.contract.determinato": "Fixed-term",
  "employerCost.contract.apprendistato": "Apprenticeship",

  "employerCost.extras.title": "Adjust the calculation",
  "employerCost.extras.hint":
    "Region, comune and payslips a year only estimate the employee’s net pay: the cost to the company does not change.",
  "employerCost.group.net": "Employee’s net pay",
  "employerCost.recap.rateDefault": "no comune chosen",
  "employerCost.recap.rateManual": "municipal surcharge {rate}",
  "employerCost.region.label": "Region of residence",
  "employerCost.frequency.legend": "Payslips a year",
  "employerCost.frequency.hint":
    "How many payslips the employee gets in a year: 13 with the 13th-month pay, 14 with the 14th as well.",

  "employerCost.result.label": "Annual cost to the company",
  "employerCost.result.basis": "for a RAL of {amount}",
  "employerCost.result.monthly": "{amount} a month, average over 12 months",
  "employerCost.result.net":
    "The employee keeps {net} net a year, {monthly} on average for each of the {count} payslips. Every net euro costs the company {ratio}.",
  "employerCost.result.empty": "Enter the gross annual salary to see the cost.",
  "employerCost.result.fix": "Correct the marked values to see the cost.",
  "employerCost.result.staleGross":
    "Out of date: this is the cost for {gross} gross. Correct the salary to recalculate.",
  "employerCost.result.staleOther":
    "Out of date: this is the previous result. Correct the marked values to recalculate.",
  "employerCost.result.announce": "Annual cost to the company {amount}, for a RAL of {gross}.",
  "employerCost.result.estimate":
    "costs outside the contract, such as training, equipment and benefits, are not included.",
  "employerCost.result.verified": "Data checked on {date}",
  "employerCost.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",

  "employerCost.assumptions.net": "What the employee’s net pay assumes",
  "employerCost.assumption.year": "Tax year {year}",
  "employerCost.assumption.contract":
    "{type, select, determinato {Fixed-term contract} apprendistato {Apprenticeship} other {Permanent contract}}",
  "employerCost.assumption.region":
    "{region, select, bolzano {Autonomous Province of Bolzano} trento {Autonomous Province of Trento} other {Region: {name}}}",
  "employerCost.assumption.comune": "Comune of {name}, surcharge {rate}",
  "employerCost.assumption.comuneZero": "Comune of {name}, no surcharge",
  "employerCost.assumption.rateDefault": "Municipal surcharge {rate}, no comune chosen",
  "employerCost.assumption.rateManual": "Municipal surcharge {rate}, entered by hand",
  "employerCost.assumption.frequency": "{count} payslips a year",
  "employerCost.change.year": "tax year",
  "employerCost.change.contract": "contract",
  "employerCost.change.region": "region",
  "employerCost.change.comune": "comune",
  "employerCost.change.frequency": "payslips a year",

  "employerCost.ledger.title": "Breakdown",
  "employerCost.ledger.caption": "How the {year} cost adds up, amounts in euros",
  "employerCost.ledger.column.term": "Item",
  "employerCost.ledger.column.monthly": "Average over 12 months",
  "employerCost.ledger.column.annual": "Annual",
  "employerCost.ledger.gross": "Gross",
  "employerCost.ledger.gross.rule": "RAL",
  "employerCost.ledger.gross.explain":
    "The gross annual salary (RAL) in the contract: everything the employee receives in a year, 13th-month pay included, before contributions and taxes.",
  "employerCost.ledger.inps": "INPS contributions",
  "employerCost.ledger.inps.rule": "{rate} of the RAL",
  "employerCost.ledger.inps.explain":
    "The contributions the company pays to the national social security institute (INPS) towards the employee’s pension, on top of the RAL.",
  "employerCost.ledger.tfr": "TFR",
  "employerCost.ledger.tfr.rule": "{rate} of the RAL, set aside",
  "employerCost.ledger.tfr.explain":
    "Severance pay (TFR): every year the company sets aside the RAL divided by 13.5, minus the 0.50% it pays to INPS, and pays it out when the job ends.",
  "employerCost.ledger.other": "Other contributions",
  "employerCost.ledger.other.rule": "INAIL, NASpI, maternity, wage guarantee",
  "employerCost.ledger.other.explain":
    "Insurance against accidents at work (INAIL) and contributions for unemployment benefit (NASpI), maternity and the wage guarantee fund.",
  "employerCost.ledger.other.inail": "INAIL, {rate}",
  "employerCost.ledger.other.maternity": "Maternity, {rate}",
  "employerCost.ledger.other.naspi": "NASpI, {rate}",
  "employerCost.ledger.other.naspiAdditional": "Additional NASpI contribution, {rate}",
  "employerCost.ledger.other.cig": "Wage guarantee fund, {rate}",
  "employerCost.ledger.other.other": "Other minor contributions, {rate}",
  "employerCost.ledger.total": "Cost to the company",
  "employerCost.ledger.total.rule": "RAL plus contributions and TFR",
  "employerCost.ledger.total.explain":
    "What the company spends in a year on this contract: {annual}, {monthly} a month on average over 12 months.",

  "employerCost.action.print": "Print the employee’s payslip",
};
