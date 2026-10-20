import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "glossario.title": "Glossary",
  "glossario.lede":
    "The words you find on your payslip and in the calculators, explained in a few lines. Figures and thresholds are those for {year}.",
  "glossario.toc": "On this page",
  "glossario.section.pay": "Salary and payslip",
  "glossario.section.taxes": "Taxes",
  "glossario.section.contributions": "Contributions and the end of employment",
  "glossario.section.vat": "VAT number",
  "glossario.method": "Read how we calculate net pay",
  "glossario.bracket.first": "{rate} up to {max}",
  "glossario.bracket.middle": "{rate} from {min} to {max}",
  "glossario.bracket.last": "{rate} above {min}",

  "glossario.ral.term": "Gross annual salary (RAL)",
  "glossario.ral.definition":
    "A year’s pay before contributions and taxes, as written in your contract. It includes the thirteenth month and, where there is one, the fourteenth.",
  "glossario.mensilita.term": "Monthly payments (mensilità)",
  "glossario.mensilita.definition":
    "The number of payslips the RAL is split into: 12, or 13 with the thirteenth month and 14 with the fourteenth. The yearly net does not change, only how much you receive each month.",
  "glossario.imponibile.term": "Taxable income (reddito imponibile)",
  "glossario.imponibile.definition":
    "Gross pay minus the INPS contributions you pay: the base for IRPEF and the surcharges.",
  "glossario.ccnl.term": "National collective agreement (CCNL)",
  "glossario.ccnl.definition":
    "The agreement between unions and employer associations that sets, for each sector, minimum pay, levels, monthly payments, holidays and notice periods.",
  "glossario.irpef.term": "IRPEF",
  "glossario.irpef.definition":
    "Italian personal income tax. It is charged in brackets on taxable income; in {year}: {brackets}.",
  "glossario.scaglione.term": "Tax bracket (scaglione)",
  "glossario.scaglione.definition":
    "A band of income with its own rate. Each rate applies only to the part of income that falls in its band: crossing a threshold means paying more only on the part above it, not on all your income.",
  "glossario.detrazione.term": "Tax deduction (detrazione)",
  "glossario.detrazione.definition":
    "An amount taken off gross IRPEF. The employment income deduction is worth up to {max} and falls as income rises, reaching zero at {end}. There are also deductions for dependants and for some expenses.",
  "glossario.trattamento.term": "Trattamento integrativo",
  "glossario.trattamento.definition":
    "A credit of up to {max} a year paid through your payslip. With income up to {full} you get all of it; up to {partial} only if your deductions exceed gross IRPEF.",
  "glossario.cuneo.term": "Tax wedge (cuneo fiscale)",
  "glossario.cuneo.definition":
    "The gap between what you cost your employer and what you take home. Since {since} the tax wedge cut adds an extra payment to your payslip with income up to {sommaLimit}, and an additional deduction of up to {detrMax} that falls above {detrFull} and reaches zero at {detrEnd}.",
  "glossario.regionale.term": "Regional surcharge (addizionale regionale)",
  "glossario.regionale.definition":
    "An extra tax on taxable income set by the region you live in. In {year} it ranges from {from} to {to} depending on the region and your income, and is due only when net IRPEF is above zero.",
  "glossario.comunale.term": "Municipal surcharge (addizionale comunale)",
  "glossario.comunale.definition":
    "An extra tax on taxable income set by the comune you live in. The calculator uses the rates the Italian Department of Finance publishes for every comune; when a comune has not set a rate for a year, the previous year’s rate applies.",
  "glossario.inps.term": "INPS contributions",
  "glossario.inps.definition":
    "Your pension contributions, paid to the national social security institute (INPS). For a private sector employee they are {rate} of pay up to {band} and {rateAbove} on the part above it ({year} values). Your employer also pays its own, which do not come out of your gross pay.",
  "glossario.tfr.term": "Severance pay (TFR)",
  "glossario.tfr.definition":
    "The part of your pay your employer sets aside every year and pays you when the job ends. The yearly amount is your pay divided by {divisor}, about {share}; each year it grows by {fixed} plus {inflation} of inflation as measured by the national statistics institute (ISTAT).",
  "glossario.naspi.term": "NASpI",
  "glossario.naspi.definition":
    "Italy’s monthly unemployment benefit, paid by INPS. It goes to people who lose their job without choosing to and have at least {weeks} weeks of contributions in the last {years} years.",
  "glossario.forfettario.term": "Forfettario regime",
  "glossario.forfettario.definition":
    "A simplified tax regime for people with a VAT number who invoice up to {maxRevenue} a year. Instead of IRPEF and surcharges you pay a {rate} substitute tax, {startupRate} in the first {startupYears} years of a new business, on a share of turnover set by law. You do not charge VAT on your invoices.",
  "glossario.coefficiente.term": "Profitability coefficient",
  "glossario.coefficiente.definition":
    "The share of turnover that counts as income under the forfettario regime. It depends on the activity and ranges from {from} to {to}.",
  "glossario.sostitutiva.term": "Substitute tax (imposta sostitutiva)",
  "glossario.sostitutiva.definition":
    "A flat-rate tax that replaces IRPEF on a given income. Besides the forfettario regime, it applies to the performance bonus: in {year}, {pdrRate} up to {pdrMax}.",

  "method.title": "How we calculate net pay",
  "method.lede":
    "The calculator follows the same steps as your payslip. Here is each step with its legal reference and an example: {gross} gross in {year}, in {comune}.",
  "method.meta": "Updated on {date} · rules for {years}",
  "method.toc": "On this page",
  "method.example": "Example, {year}",
  "method.cite": "({reference})",

  "method.inps.title": "INPS contributions",
  "method.inps.body":
    "The first step takes your share of contributions off gross pay; the national social security institute (INPS) uses them for your pension. In the private sector they are {rate} of pay up to {band}, the first band for {year}, and {rateAbove} on the part above it",

  "method.irpef.title": "Gross IRPEF and brackets",
  "method.irpef.body":
    "Personal income tax (IRPEF) is charged on taxable income in brackets: each rate applies only to the part of income that falls in its bracket",
  "method.irpef.change":
    "In {year} the rate between {min} and {max} went {direction, select, down {down} other {up}} from {from} to {to}",
  "method.irpef.table.caption": "IRPEF rates by taxable income bracket",
  "method.irpef.table.income": "Taxable income",
  "method.irpef.table.upTo": "up to {max}",
  "method.irpef.table.above": "above {min}",
  "method.irpef.worked": "With {taxable} of taxable income, {parts}",
  "method.irpef.total": "Gross IRPEF is {total}",
  "method.irpef.share.whole": "{rate} of {amount} is {tax}",
  "method.irpef.share.first": "{rate} of the first {amount} is {tax}",
  "method.irpef.share.full": "{rate} of the next {amount} is {tax}",
  "method.irpef.share.rest": "{rate} of the remaining {amount} is {tax}",

  "method.deductions.title": "Deductions",
  "method.deductions.intro": "Deductions are amounts taken off gross IRPEF",
  "method.deductions.work":
    "The employment income deduction depends on income and reaches zero at {end}",
  "method.deductions.wedge":
    "With income between {from} and {to} there is also the additional deduction from the tax wedge cut, up to {max}",

  "method.surcharges.title": "Regional and municipal surcharges",
  "method.surcharges.intro":
    "The region and the comune each charge a surcharge on taxable income, but only when net IRPEF is above zero",
  "method.surcharges.regional":
    "In {region} the {year} regional surcharge {shape, select, flat {is {rate}} other {ranges from {from} to {to} in brackets}}: on {taxable} it comes to {tax}",
  "method.surcharges.municipal":
    "In {comune} the municipal surcharge {shape, select, flat {is {rate}} other {ranges from {from} to {to} in brackets}}{hasExemption, select, yes {, with an exemption up to {limit},} other {}} and comes to {tax}",
  "method.surcharges.carryOver":
    "The comune has not yet published a new decision for {year}: the {ruleYear} one still applies",

  "method.credits.title": "Credits in your payslip",
  "method.credits.intro": "On lower incomes, your payslip also includes some credits",
  "method.credits.trattamento":
    "The trattamento integrativo is worth up to {max} a year with income up to {full}, and in part up to {partial}",
  "method.credits.somma":
    "The additional payment from the tax wedge cut applies with income up to {limit} and is between {low} and {high} of income",
  "method.credits.outcome":
    "{case, select, both {With {gross} gross the trattamento integrativo is {trattamento} and the additional payment is {somma}} trattamento {With {gross} gross only the trattamento integrativo applies: {trattamento}} somma {With {gross} gross only the additional payment applies: {somma}} other {With {gross} gross neither applies}}",

  "method.rounding.title": "Rounding",
  "method.rounding.rule": "Each line is rounded to the cent, with half a cent rounded up",
  "method.rounding.sum":
    "Net pay is built from the rounded lines, so the breakdown always adds up to the cent: {equation}",

  "method.limits.title": "What we do not calculate",
  "method.limits.contract": "Allowances, extra pay and bonuses set by your collective agreement.",
  "method.limits.yearEnd": "The year-end tax adjustment and income other than employment.",
  "method.limits.thirteenth":
    "The difference between a normal payslip and the thirteenth-month one when there is a performance bonus, a taxable benefit, a pension fund, the impatriate regime, the working mothers’ exemption or pay above the INPS contribution cap: in those cases we show only the average.",
  "method.limits.regional":
    "The child deductions and reduced rates for disability that some regions apply to the regional surcharge.",

  "method.sources.title": "Sources",
  "method.sources.all": "See all sources and the dates they were checked",
  "method.ref.inps": "Contribution rates and the first pay band.",
  "method.ref.irpef": "IRPEF brackets and rates.",
  "method.ref.workDeduction": "Employment income deduction.",
  "method.ref.taxWedge": "Tax wedge cut: additional payment and additional deduction.",
  "method.ref.regional": "Regional surcharge, {region}.",
  "method.ref.comuni": "Municipal surcharge for every comune, year by year.",
  "method.ref.trattamento": "Trattamento integrativo.",
  "method.ref.todo": "To verify",

  "method.ledger.subtracted": ", subtracted",
  "method.ledger.gross": "Gross",
  "method.ledger.gross.rule": "RAL",
  "method.ledger.inps": "INPS contributions",
  "method.ledger.inps.rule": "{rate} of gross",
  "method.ledger.taxable": "Taxable income",
  "method.ledger.taxable.rule": "gross minus contributions",
  "method.ledger.irpefGross": "Gross IRPEF",
  "method.ledger.bracketUpTo": "{rate} up to {max}",
  "method.ledger.bracketAbove": "{rate} above",
  "method.ledger.workDeduction": "Employment income deduction",
  "method.ledger.workDeduction.rule": "depends on income",
  "method.ledger.detrazioneAggiuntiva": "Additional deduction",
  "method.ledger.detrazioneAggiuntiva.rule": "tax wedge cut",
  "method.ledger.irpefNet": "Net IRPEF",
  "method.ledger.irpefNet.rule": "gross minus deductions",
};
