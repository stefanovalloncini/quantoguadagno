import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "glossario.title": "Glossary",
  "glossario.lede":
    "The words you find on your payslip and in the calculators, explained in a few lines. Figures and thresholds are those for {year}.",
  "glossario.toc": "On this page",
  "glossario.section.pay": "Salary and contract",
  "glossario.section.payslip": "Payslip items",
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
  "glossario.competenze.term": "Earnings and deductions (competenze e trattenute)",
  "glossario.competenze.definition":
    "The two columns of your payslip. Earnings are the amounts in your favour, such as the month’s pay and overtime; deductions are what your employer takes off, such as contributions and taxes. Net pay is the difference between the two totals.",
  "glossario.livello.term": "Job level (livello di inquadramento)",
  "glossario.livello.definition":
    "The position your collective agreement assigns you based on your duties, shown as a number or a code. Your level sets your base pay and, in many agreements, the amount of your seniority increases and your notice period.",
  "glossario.minimo.term": "Base pay (paga base o minimo tabellare)",
  "glossario.minimo.definition":
    "The minimum pay your collective agreement sets for your level, usually as a monthly amount. Together with the other fixed items, such as the cost-of-living allowance, seniority increases and above-minimum pay, it makes up your fixed monthly pay. Each renewal of the agreement updates it.",
  "glossario.contingenza.term": "Cost-of-living allowance (contingenza)",
  "glossario.contingenza.definition":
    "An allowance that used to rise automatically with the cost of living, under the system known as the scala mobile. When the scala mobile was abolished the amount was frozen, and today it is a fixed part of your pay. Some agreements show it as a separate item, others have merged it into base pay.",
  "glossario.edr.term": "Separate pay element (EDR)",
  "glossario.edr.definition":
    "A small fixed monthly amount, the same at every level, introduced when the scala mobile was abolished. Where it has not been absorbed into base pay or the cost-of-living allowance, it appears as a separate item.",
  "glossario.scatti.term": "Seniority increases (scatti di anzianità)",
  "glossario.scatti.definition":
    "Pay rises that come after a set number of years with the same employer. Your collective agreement decides how many there are, how often they come and how much they are worth, often depending on your level.",
  "glossario.superminimo.term": "Above-minimum pay (superminimo)",
  "glossario.superminimo.definition":
    "An amount on top of the collective agreement minimum, which your employer grants when you are hired or later on. If it is absorbable (assorbibile), it can shrink by the same amount when the minimums rise with a renewal, so your total stays the same; if it is not absorbable, you get the rise on top. When your employment letter says nothing about it, it is absorbable as a rule.",
  "glossario.previdenziale.term": "Contribution base (imponibile previdenziale)",
  "glossario.previdenziale.definition":
    "The part of your pay on which contributions to the national social security institute (INPS) are calculated. It covers almost everything you are due in the month, apart from items such as meal vouchers, fringe benefits and business trip reimbursements, which the law leaves out up to set limits. The tax base (imponibile fiscale), on which personal income tax (IRPEF) is calculated, is generally this amount minus your own contributions.",
  "glossario.fringe.term": "Fringe benefits",
  "glossario.fringe.definition":
    "Goods and services your employer gives you on top of your pay, such as shopping vouchers, fuel cards or a company car you also use privately. In {year} they are free of tax and contributions up to {general} a year in total, or {children} if you have dependent children. If you go over the threshold, the whole value becomes taxable, from the first euro.",
  "glossario.buoni.term": "Meal vouchers (buoni pasto)",
  "glossario.buoni.definition":
    "Vouchers your employer gives you to pay for meals, usually one for each day worked. In {year} they are free of tax and contributions up to {electronic} a day if electronic and up to {paper} if on paper; the part above is taxable like your pay.",
  "glossario.rimborsi.term": "Expense reimbursements (rimborsi spese)",
  "glossario.rimborsi.definition":
    "The money your employer pays back when you cover work expenses yourself, such as travel, meals and hotels on a business trip. For trips outside the comune where you work, if the expenses are documented and paid in a traceable way, for example by card or bank transfer, they are usually free of tax and contributions.",
  "glossario.premio.term": "Performance bonus (premio di risultato)",
  "glossario.premio.definition":
    "A bonus tied to the company’s results, for example on productivity or quality, set by a company or local agreement. In {year}, up to {max} gross, it is subject to a {rate} substitute tax instead of IRPEF and the surcharges, if you work in the private sector and your employment income the year before stayed within the legal limit. You still pay INPS contributions on it, as on the rest of your pay.",
  "glossario.arretrati.term": "Back pay (arretrati)",
  "glossario.arretrati.definition":
    "Money due for past months that you receive only now, for example when a renewal of the collective agreement backdates pay rises by a few months. If it relates to earlier years and comes from a law, a collective agreement or a court ruling, it is usually taxed separately: it is not added to the year’s income and does not push you into a higher bracket.",
  "glossario.conguaglio.term": "Tax adjustment (conguaglio)",
  "glossario.conguaglio.definition":
    "The recalculation of IRPEF on everything your employer has paid you in the year, with the deductions you are entitled to. If the tax withheld in earlier months was too high you get the difference back; if it was too low, you pay it. It usually comes with the December payslip, sometimes with the January or February one; if the job ends, with the last one.",
  "glossario.addizionali.term": "Surcharge balance and advance (saldo e acconto delle addizionali)",
  "glossario.addizionali.definition":
    "The regional and municipal surcharges for a year are worked out at the year-end tax adjustment, and you pay them in instalments the following year: this is the balance. For the municipal surcharge you also pay an advance on the current year, in instalments from March, so the same payslip shows last year’s balance and this year’s advance. If the job ends, your last payslip takes all the remaining instalments at once.",
  "glossario.sindacale.term": "Union dues (trattenuta sindacale)",
  "glossario.sindacale.definition":
    "Your union membership fee, if you have signed the authorisation for it: your employer takes it from your payslip and pays it on your behalf. The union sets the amount, often as a small percentage of your pay.",
  "glossario.quinto.term": "Salary-backed loan (cessione del quinto)",
  "glossario.quinto.definition":
    "A loan you repay in monthly instalments: your employer takes each instalment from your payslip and pays it to the bank or finance company. By law the instalment cannot exceed a fifth (un quinto) of your net pay, hence the name. If the job ends before the last instalment, your severance pay (TFR) usually covers the remaining debt.",
  "glossario.ratei.term": "Accruals (ratei)",
  "glossario.ratei.definition":
    "The shares of the thirteenth and fourteenth month, holidays and leave that you build up with each month of work. When the job ends, your last payslip pays out the accruals you have not yet received, including unused holidays and, usually, unused leave.",
  "glossario.ferie.term": "Holidays and leave (ferie, permessi, ROL ed ex festività)",
  "glossario.ferie.definition":
    "The summary on your payslip shows, for each of these, the hours or days accrued, used and left. Leave for reduced working hours (ROL) and ex festività are hours of paid leave set by the collective agreement, the latter in place of some public holidays abolished by law. Your employer usually pays you for leave you have not used by the deadline in the agreement, but you have to take the legal minimum holidays: they are paid out only when the job ends.",
  "glossario.netto.term": "Take-home pay (netto in busta)",
  "glossario.netto.definition":
    "What reaches your bank account: total earnings minus total deductions. Many payslips round it to a whole euro and carry the cents over to the following month. It changes from month to month with overtime, absences, tax adjustments and surcharge instalments.",
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
  "method.meta": "Updated on {dateArticle, select, other {}}{date}. Rules for {years}.",
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
