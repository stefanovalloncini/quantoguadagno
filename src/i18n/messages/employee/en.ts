import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "employee.title": "Net salary",
  "employee.lede": "Your take-home pay in Italy, from {first} to {last}.",

  "employee.gross.label": "Gross annual salary (RAL)",
  "employee.gross.hint": "It is in your contract or offer letter.",
  "employee.gross.readAs": "Read as {amount}",
  "employee.gross.monthly": "{amount} gross a month over {count} payslips",
  "employee.gross.monthlyNote":
    "Is this a monthly amount? The RAL is a year’s gross pay: {monthly} a month over {count} payslips is {annual}.",
  "employee.gross.netQuestion": "Only know your net pay?",
  "employee.gross.netLink": "Work out the gross from the net",
  "employee.year.legend": "Tax year",
  "employee.region.label": "Region of residence",

  "employee.result.label": "Monthly net pay",
  "employee.result.basis": "average over {count} payslips",
  "employee.result.annual": "Annual net pay {amount}",
  "employee.result.split":
    "Normal month {ordinary}, {count, plural, =1 {thirteenth month {extra}} =2 {thirteenth and fourteenth months {extra} each} other {extra months {extra} each}}",
  "employee.result.withheld":
    "Deductions: {amount} a year, {article, select, other {}}{share} of gross.",
  "employee.result.withheldCredits":
    "Deductions: {amount} a year, {article, select, other {}}{share} of gross. Payroll credits: {credits}, already in the net pay.",
  "employee.result.empty": "Enter your gross annual salary to see your net pay.",
  "employee.result.fix": "Correct the marked values to see your net pay.",
  "employee.result.staleGross":
    "Out of date: this is the result for {gross} gross. Correct the salary to recalculate.",
  "employee.result.staleOther":
    "Out of date: this is the previous result. Correct the marked values to recalculate.",
  "employee.result.announce": "Monthly net pay {amount}, average over {count} payslips.",
  "employee.result.estimate": "your payslip is what counts.",
  "employee.result.verified": "Data checked on {dateArticle, select, other {}}{date}",

  "employee.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",

  "employee.part.spouse": "spouse",
  "employee.part.children": "{count, plural, one {# child} other {# children}}",
  "employee.part.others": "{count, plural, one {# other relative} other {# other relatives}}",
  "employee.part.mortgage": "mortgage interest {amount}",
  "employee.part.medical": "medical expenses {amount}",
  "employee.part.otherExpenses": "other expenses {amount}",
  "employee.part.pensionFund": "pension fund {amount}",
  "employee.part.impatriati": "impatriate regime",
  "employee.part.impatriatiChildren": "impatriate regime with children under 18",
  "employee.part.madre": "working mothers’ exemption",
  "employee.part.vouchers": "meal vouchers {amount} a day",
  "employee.part.welfare": "welfare {amount}",
  "employee.part.health": "health insurance {amount}",
  "employee.part.car": "company car {amount}",
  "employee.part.premio": "performance bonus {amount}",
  "employee.part.contractType":
    "{type, select, determinato {Fixed-term} apprendistato {Apprenticeship} other {Permanent}}",
  "employee.part.sector": "{public, select, yes {public sector} other {private sector}}",
  "employee.part.largeCompany": "company with more than 15 employees",
  "employee.part.before1996": "insured with INPS before 1996",
  "employee.part.inpsRate": "contributions {rate}",
  "employee.part.inpsCustom": "contributions {rate}, entered by you",

  "employee.ledger.title": "Breakdown",
  "employee.ledger.caption": "Breakdown for {year}, amounts in euros",
  "employee.ledger.column.term": "Item",
  "employee.ledger.column.monthly": "Monthly average",
  "employee.ledger.column.annual": "Annual",
  "employee.ledger.gross": "Gross",
  "employee.ledger.gross.rule": "RAL",
  "employee.ledger.gross.explain":
    "Your contract’s gross annual salary (RAL): what you earn in a year before contributions and taxes.",
  "employee.ledger.inps": "INPS contributions",
  "employee.ledger.inps.rule": "{rate} of gross",
  "employee.ledger.inps.ruleRelief": "{rate} of gross, minus the relief",
  "employee.ledger.inps.explain":
    "Contributions to your pension, paid to the national social security institute (INPS) and taken from your pay: {article, select, other {}}{rate} of gross{above, select, yes {, {aboveArticle, select, other {}}{aboveRate} on the part above {ceiling}} other {}}.",
  "employee.ledger.inps.massimale": "No contributions are due on pay above {massimale} a year.",
  "employee.ledger.inps.base": "Contributions {rate}",
  "employee.ledger.inps.exemption2024": "2024 contribution relief",
  "employee.ledger.inps.madre": "Working mothers’ exemption",
  "employee.ledger.taxable": "Taxable income",
  "employee.ledger.taxable.rule": "gross minus contributions",
  "employee.ledger.taxable.ruleAdjusted": "gross minus contributions, with benefits and deductions",
  "employee.ledger.taxable.explain":
    "Gross pay minus contributions: income tax (IRPEF) and the surcharges are worked out on this amount.",
  "employee.ledger.taxable.explainAdjusted":
    "Income tax (IRPEF) and the surcharges are worked out on this amount. Taxable benefits are added to income but are not paid to you; pension fund payments are taken off income.",
  "employee.ledger.taxable.benefits": "Taxable benefits",
  "employee.ledger.taxable.pensionFund": "Pension fund",
  "employee.ledger.impatriatiExempt": "Exempt share, impatriate regime ({rate})",
  "employee.ledger.impatriatiExempt.rule": "not taxed, stays in your net pay",
  "employee.ledger.impatriatiExempt.explain":
    "Under the impatriate regime {rate} of your employment income is not taxed, up to {max} of income. IRPEF, tax credits and surcharges are worked out on the rest; the tax wedge cut and the trattamento integrativo look at your whole income instead.",
  "employee.ledger.irpefBase": "IRPEF taxable income",
  "employee.ledger.irpefBase.rule": "base for IRPEF and surcharges",
  "employee.ledger.irpef": "Net IRPEF",
  "employee.ledger.irpef.rule": "in brackets, minus tax credits",
  "employee.ledger.irpef.ruleImpatriati": "in brackets on {share} of income, minus tax credits",
  "employee.ledger.irpef.ruleImpatriatiCapped": "in brackets on the taxed part, minus tax credits",
  "employee.ledger.irpef.explain":
    "IRPEF, the personal income tax, is charged in brackets on taxable income; then the tax credits you are entitled to come off.",
  "employee.ledger.irpef.gross": "Gross IRPEF: {bands}",
  "employee.ledger.irpef.bandUpTo": "{rate} up to {max}",
  "employee.ledger.irpef.bandAbove": "{rate} above",
  "employee.ledger.irpef.work": "Employee tax credit, art. 13 of the income tax code (TUIR)",
  "employee.ledger.irpef.dependents": "Tax credits for dependants",
  "employee.ledger.irpef.expenses": "Tax credits for expenses",
  "employee.ledger.irpef.wedge": "Extra tax credit from the tax wedge cut",
  "employee.ledger.irpef.wedgeNote":
    "The extra credit is worth {max} up to {full} of taxable income and tapers to zero at {end}: {whole, select, yes {you get all of it} other {you get {amount}}}.",
  "employee.ledger.irpef.incapiente":
    "The tax credits exceed gross IRPEF: net IRPEF is zero and the excess is lost.",
  "employee.ledger.irpef.impatriati":
    "Under the impatriate regime IRPEF is charged on part of your taxable income only: you save {amount}.",
  "employee.ledger.ruleNotDue": "{name}, not due",
  "employee.ledger.ruleExempt": "{name}, exempt up to {amount}",
  "employee.ledger.regional": "Regional surcharge",
  "employee.ledger.regional.explain": "Your region’s tax on taxable income.",
  "employee.ledger.regional.range":
    "{regionIn} it goes {fromArticle, select, other {}}from {min} {toArticle, select, other {}}to {max}, in brackets like IRPEF.",
  "employee.ledger.regional.single": "{regionIn} it is {article, select, other {}}{rate}.",
  "employee.ledger.regional.exempt": "Nothing is due on taxable income up to {amount}.",
  "employee.ledger.regional.flat":
    "Up to {limit} of taxable income, {article, select, other {}}{rate} applies to the whole income.",
  "employee.ledger.regional.deductions":
    "The calculation also applies the region’s own tax credits.",
  "employee.ledger.municipal": "Municipal surcharge",
  "employee.ledger.municipal.ruleNone": "municipality not chosen, {rate}",
  "employee.ledger.municipal.ruleManual": "rate entered, {rate}",
  "employee.ledger.municipal.ruleZero": "{name}, no surcharge",
  "employee.ledger.municipal.explain": "Your municipality’s tax on taxable income.",
  "employee.ledger.municipal.flat":
    "In {name} it is {article, select, other {}}{rate}{exempt, select, yes {, with an exemption up to {amount}: above the threshold it applies to the whole taxable income} other {}}.",
  "employee.ledger.municipal.range":
    "In {name} it goes {fromArticle, select, other {}}from {min} {toArticle, select, other {}}to {max}, in brackets{exempt, select, yes {, with an exemption up to {amount}} other {}}.",
  "employee.ledger.municipal.zero": "{name} does not charge the surcharge.",
  "employee.ledger.municipal.underThreshold":
    "Your taxable income is below the threshold, so you do not pay it.",
  "employee.ledger.municipal.none":
    "You have not chosen your municipality: we use {article, select, other {}}{rate}, with no exemption threshold. Choose it for a more precise result.",
  "employee.ledger.municipal.manual":
    "We use the rate you entered, {article, select, other {}}{rate}, with no exemption threshold.",
  "employee.ledger.surchargesNotDue":
    "You do not pay it: the surcharges are due only when net IRPEF is above zero.",
  "employee.ledger.somma": "Extra payment",
  "employee.ledger.somma.rule": "tax wedge cut",
  "employee.ledger.somma.explain":
    "With the tax wedge cut, employees earning up to {max} get an extra amount in their pay, a percentage of their income. It is not taxed.",
  "employee.ledger.trattamento": "Supplementary payment",
  "employee.ledger.trattamento.rule": "up to {max} a year",
  "employee.ledger.trattamento.explain":
    "A credit of up to {max} a year for taxable income up to {full}; between {full} and {partial} it applies only when the tax credits exceed the tax. It is added to your net pay.",
  "employee.ledger.premio": "Performance bonus",
  "employee.ledger.premio.rule": "net, taxed separately",
  "employee.ledger.premio.explain":
    "The performance bonus is taxed on its own: a flat substitute tax replaces IRPEF.",
  "employee.ledger.premio.gross": "Gross bonus",
  "employee.ledger.premio.inps": "INPS contributions on the bonus",
  "employee.ledger.premio.tax": "Substitute tax {rate}",
  "employee.ledger.premio.net": "Net bonus",
  "employee.ledger.net": "Net",
  "employee.ledger.net.rule": "taxable income minus IRPEF and surcharges",
  "employee.ledger.net.ruleCredits": "taxable income minus taxes, plus credits",
  "employee.ledger.net.ruleAdjusted":
    "gross minus contributions and taxes{credits, select, yes {, plus credits} other {}}",
  "employee.ledger.net.explain":
    "What you receive: {annual} a year, an average of {monthly} for each of the {count} payslips.",

  "employee.action.print": "Print the payslip",
  "employee.action.employerCost": "Work out what you cost your employer",

  "employee.frequency.legend": "Payslips a year",
  "employee.frequency.hint":
    "How many payslips you get in a year: 13 with the thirteenth-month pay, 14 with the fourteenth too.",
  "employee.extras.title": "Adjust the calculation",
  "employee.extras.hint":
    "Your comune, payslips a year and the groups below change your net pay; each group shows the values in use.",

  "employee.group.contract": "Contract and INPS",
  "employee.group.dependents": "Dependants",
  "employee.group.expenses": "Deductible expenses",
  "employee.group.special": "Special conditions",
  "employee.group.benefits": "Benefits and welfare",
  "employee.recap.dependents": "Dependants: {list}",
  "employee.recap.none.masculine": "None",
  "employee.recap.none.feminine": "None",

  "employee.contract.legend": "Contract type",
  "employee.contract.hint":
    "Apprentices pay lower INPS contributions, {article, select, other {}}{rate}; fixed-term and permanent contracts give the same net pay.",
  "employee.contract.indeterminato": "Permanent",
  "employee.contract.determinato": "Fixed-term",
  "employee.contract.apprendistato": "Apprenticeship",
  "employee.ccnl.label": "National collective agreement (CCNL)",
  "employee.ccnl.hint": "Optional: sets the number of payslips your collective agreement provides.",
  "employee.ccnl.none": "None",
  "employee.ccnl.option":
    "{ccnl, select, commercio {Retail and services} metalmeccanici {Engineering and metalworking} logistica {Logistics} cooperative_sociali {Social cooperatives} other {}}, {count} payslips",
  "employee.public.label": "Public sector employee",
  "employee.public.hint":
    "Contributions are {article, select, other {}}{publicRate} instead of {baseArticle, select, other {}}{rate}.",
  "employee.large.label": "Company with more than 15 employees",
  "employee.large.hint":
    "Contributions rise to {article, select, other {}}{rate} for the extraordinary wage guarantee fund.",
  "employee.before1996.label": "Insured with INPS before 1996",
  "employee.before1996.hint":
    "There is no contribution ceiling for you, so you pay contributions on all your gross pay, also above {massimale}.",
  "employee.override.label": "Different INPS rates",
  "employee.override.hint": "Only if your contract sets rates other than the standard ones.",
  "employee.override.employee": "INPS rate you pay",
  "employee.override.employer": "INPS rate your employer pays",
  "employee.override.employerHint":
    "Used for the cost to your employer; it does not change your net pay.",

  "employee.spouse.label": "Dependent spouse",
  "employee.spouse.hint": "If in {year} your spouse earns up to {limit}.",
  "employee.children.label":
    "{from2025, select, yes {Dependent children aged 21 to 29} other {Dependent children aged 21 or over}}",
  "employee.children.hint":
    "{from2025, select, yes {Over 29 only with a disability; each} other {Each}} child may earn up to {young} until age 24, {limit} after. Children under 21 are covered by the universal child allowance, not by a payroll tax credit.",
  "employee.others.label": "Other dependent relatives",
  "employee.others.hint":
    "{from2025, select, yes {Only parents or grandparents who live with you.} other {Parents, siblings and other relatives who live with you or receive maintenance from you.}}",

  "employee.mortgage.label": "Interest on a first-home mortgage",
  "employee.mortgage.hint": "19% tax credit on up to {max} of interest a year.",
  "employee.medical.label": "Medical expenses",
  "employee.medical.hint": "19% tax credit on the part above {floor}.",
  "employee.medical.after": "Tax credit of {amount}: 19% of {base}.",
  "employee.otherExpenses.label": "Other 19% expenses",
  "employee.otherExpenses.hint": "For example education and insurance.",
  "employee.pensionFund.label": "Supplementary pension fund",
  "employee.pensionFund.hint":
    "Payments into a pension fund come off your income, up to {max} a year.",

  "employee.impatriati.label": "Impatriate regime (moving back to Italy)",
  "employee.impatriati.hint":
    "For people who move their residence to Italy and meet the requirements of Legislative Decree 209/2023: {standard} of employment income is not taxed, {withChildren} with children under 18.",
  "employee.impatriatiChildren.label": "You have children under 18",
  "employee.impatriatiChildren.hint":
    "The untaxed part rises to {article, select, other {}}{rate}.",
  "employee.madre.label": "Contribution exemption for working mothers",
  "employee.madre.hint":
    "Lower INPS contributions for mothers of several children, if you qualify.",
  "employee.madreChildren.label": "Number of children",
  "employee.madreAge.label": "Age of the youngest child",
  "employee.madre.eligible": "With these details the exemption applies, up to {max} a year.",
  "employee.madre.notEnoughChildren": "The full exemption requires at least {min} children.",
  "employee.madre.childTooOld": "The exemption ends when the youngest child turns {age}.",

  "employee.vouchers.label": "Meal vouchers, value of one voucher",
  "employee.vouchers.hint":
    "In {year} they are tax-free up to {electronic} a day if electronic and up to {paper} if on paper.",
  "employee.voucherDays.label": "Meal vouchers a month",
  "employee.voucherDays.hint": "Usually one for each working day.",
  "employee.voucherType.legend": "Type of meal vouchers",
  "employee.voucherType.electronic": "Electronic",
  "employee.voucherType.paper": "Paper",
  "employee.welfare.label": "Company welfare a year",
  "employee.welfare.hint":
    "Tax-free up to {general} ({children} with dependent children): above the threshold all of it is taxed.",
  "employee.welfareChildren.label": "You have dependent children",
  "employee.welfareChildren.hint": "The tax-free threshold rises to {amount}.",
  "employee.health.label": "Health insurance a year",
  "employee.health.hint": "Tax-free up to {amount} a year.",
  "employee.car.label": "Company car, annual value",
  "employee.car.hint": "The taxable value your employer tells you.",
  "employee.premio.label": "Performance bonus",
  "employee.premio.hint":
    "In {year} it is taxed at {article, select, other {}}{rate} instead of IRPEF, up to {max}, if you qualify.",

  "employee.bracket.title": "IRPEF bracket",
  "employee.bracket.range": "{min} to {max}",
  "employee.bracket.upTo": "up to {max}",
  "employee.bracket.above": "above {min}",
  "employee.bracket.first":
    "{subject, select, impatriati {The taxed part of your income} other {Your taxable income}}, {income}, is in the first bracket, at {article, select, other {}}{rate}. You are {distance} away from the next bracket.",
  "employee.bracket.middle":
    "{subject, select, impatriati {The taxed part of your income} other {Your taxable income}}, {income}, reaches the {article, select, other {}}{rate} bracket, which applies only to the part above {min}. You are {distance} away from the next bracket.",
  "employee.bracket.top":
    "{subject, select, impatriati {The taxed part of your income} other {Your taxable income}}, {income}, reaches the top bracket, {article, select, other {}}{rate}, which applies only to the part above {min}.",
  "employee.raise.title": "If your gross pay rises by {amount}",
  "employee.raise.unit": "net a year",
  "employee.raise.gain":
    "That is {monthly} more a month, over {count} payslips. Of each extra gross euro you keep {cents, plural, one {# cent} other {# cents}}{taper, select, detrazioni {: besides contributions and IRPEF at {article, select, other {}}{rate}, at this income the tax credits start to taper} crediti {: besides contributions and IRPEF at {article, select, other {}}{rate}, at this income the payroll credits shrink} other {}}.",
  "employee.raise.loss":
    "That is {monthly} less a month: this raise crosses a threshold and you lose part of your credits or tax credits.",
  "employee.raise.note":
    "Marginal rate {rate}, the part of each extra gross euro that goes in deductions.",
  "employee.years.title": "Same gross, other years",
  "employee.years.caption": "Annual net pay on {gross} gross, by tax year",
  "employee.years.column.year": "Year",
  "employee.years.column.net": "Annual net",
  "employee.years.column.delta": "Compared with {year}",
  "employee.years.selected": "chosen year",
  "employee.years.same": "same",
  "employee.years.bracketChange":
    "In {year} the rate from {min} to {max} went {direction, select, down {down} other {up}} {fromArticle, select, other {}}from {from} {toArticle, select, other {}}to {to}.",

  "employee.topics.title": "Understanding the calculation",
  "employee.topic.steps": "From gross to net: the steps",
  "employee.topic.steps.body":
    "Your share of contributions to the national social security institute (INPS) comes off the gross annual pay. On the taxable income that remains, the personal income tax (IRPEF) is charged in brackets and the tax credits you are entitled to are subtracted. Then the regional and municipal surcharges come off and any payroll credits are added.",
  "employee.topic.steps.link": "Read how we calculate net pay",
  "employee.topic.brackets": "IRPEF brackets from {first} to {last}",
  "employee.topic.brackets.body":
    "In 2026: 23% up to €28,000, 33% from €28,000 to €50,000, 43% above. In 2024 and 2025 the middle bracket was 35%. Each rate applies only to the part of income that falls in its bracket.",
  "employee.topic.wedge": "The tax wedge cut",
  "employee.topic.wedge.body":
    "The tax wedge is the gap between what you cost your employer and what reaches your payslip. The cut works in two ways: an extra payment for incomes up to €20,000 and an extra tax credit of up to €1,000 between €20,000 and €40,000. In 2024 there was a cut in INPS contributions instead.",
  "employee.topic.surcharges": "Regional and municipal surcharges",
  "employee.topic.surcharges.body":
    "Your region and your municipality each add a tax on top of IRPEF, worked out on your taxable income at rates that differ from place to place. We use the rates the Department of Finance publishes for every region and every municipality.",
  "employee.topic.payslip": "Differences from your payslip",
  "employee.topic.payslip.body":
    "The calculation uses the general rules: allowances in your collective agreement, overtime, bonuses or special deductions change the net pay. The month matters too, because the thirteenth-month pay and the year-end adjustment are taxed differently.",
};
