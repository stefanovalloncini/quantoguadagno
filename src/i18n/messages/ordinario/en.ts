import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "ordinario.title": "Self-employed under the ordinary regime",
  "ordinario.lede":
    "For professionals and sole traders with simplified accounts. Below the calculation you can compare it with the forfettario.",

  "ordinario.revenue.label": "Fees or revenue for the year",
  "ordinario.revenue.hint": "What you collect during the year, without VAT.",
  "ordinario.costs.label": "Deductible costs for the year",
  "ordinario.costs.hint": "What you pay for the business during the year, without VAT.",
  "ordinario.year.legend": "Tax year",
  "ordinario.region.label": "Region of residence",
  "ordinario.region.hint": "Sets the regional surcharge.",

  "ordinario.extras.title": "Adjust the calculation",
  "ordinario.extras.hint":
    "Your comune, where your contributions go and your activity for the comparison with the forfettario.",
  "ordinario.group.comune": "Municipal surcharge",
  "ordinario.group.previdenza": "Pension contributions",
  "ordinario.group.forfettario": "Comparison with the forfettario",
  "ordinario.recap.rateDefault": "no comune chosen, surcharge {rate}",
  "ordinario.recap.rateManual": "municipal surcharge {rate}",
  "ordinario.recap.reduced": "{gestion}, rate {rate}",
  "ordinario.recap.months": "{gestion}, {months, plural, one {# month} other {# months}}",
  "ordinario.recap.cassa": "{gestion}, {amount} a year",
  "ordinario.recap.forfettario": "coefficient {coefficient}, tax {rate}",

  "ordinario.gestion.label": "Pension scheme",
  "ordinario.gestion.hint":
    "Gestione Separata is for professionals without their own fund, Artigiani and Commercianti for sole traders.",
  "ordinario.gestion.gestione-separata": "INPS Gestione Separata",
  "ordinario.gestion.artigiani": "INPS Artigiani",
  "ordinario.gestion.commercianti": "INPS Commercianti",
  "ordinario.gestion.cassa-professionale": "Professional fund",
  "ordinario.otherPension.label": "I already have other pension cover",
  "ordinario.otherPension.hint":
    "For example a job or a pension: the Gestione Separata rate drops to {article, select, other {}}{rate}.",
  "ordinario.months.label": "Months of activity in the year",
  "ordinario.months.hint":
    "The minimum income and the minimum contribution are prorated by the months registered.",
  "ordinario.cassa.label": "Annual contributions to the fund",
  "ordinario.cassa.hint": "What you pay your fund for the year: every fund has its own rules.",
  "ordinario.activity.label": "Your activity",
  "ordinario.activity.hint":
    "Under the forfettario it sets the profitability coefficient, the share of revenue you pay tax on.",
  "ordinario.activity.professionisti":
    "Professional, scientific, technical, health and education activities",
  "ordinario.activity.altre-attivita": "Other economic activities",
  "ordinario.activity.intermediari": "Trade intermediaries",
  "ordinario.activity.commercio": "Wholesale and retail trade",
  "ordinario.activity.commercio-ambulante-altro": "Street trading of other goods",
  "ordinario.activity.commercio-ambulante-alimentare": "Street trading of food and drinks",
  "ordinario.activity.industrie-alimentari": "Food and drink manufacturing",
  "ordinario.activity.servizi-alloggio": "Accommodation and food services",
  "ordinario.activity.costruzioni": "Construction and real estate",
  "ordinario.startup.label": "I am in my first {years} years of activity",
  "ordinario.startup.hint":
    "With a new activity that meets the legal requirements, the forfettario substitute tax is {startupArticle, select, other {}}{startupRate} instead of {standardArticle, select, other {}}{standardRate}.",

  "ordinario.result.label": "Net per year",
  "ordinario.result.basis": "after costs, contributions and taxes",
  "ordinario.result.monthly": "On average {amount} a month over 12 months",
  "ordinario.result.empty": "Enter your fees or revenue for the year to see the net.",
  "ordinario.result.fix": "Correct the marked values to see the net.",
  "ordinario.result.stale": "Not updated: correct the marked field to recalculate.",
  "ordinario.result.announce": "Estimated net per year {amount}, on average {monthly} a month.",
  "ordinario.result.estimate":
    "it assumes the VAT number is your only income and that you pay the year’s contributions within the year.",
  "ordinario.result.verified": "Data checked on {date}",
  "ordinario.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be checked} other {# values used in this calculation are still to be checked}}} other {}}.",
  "ordinario.result.vatTerm": "IRAP and VAT:",
  "ordinario.result.vat":
    "since 2022 individuals do not pay IRAP. VAT stays out of the calculation: what you charge clients goes to the State, and what you pay on purchases you deduct.",

  "ordinario.ledger.title": "Breakdown",
  "ordinario.ledger.caption": "Breakdown for {year}, amounts in euro",
  "ordinario.ledger.column.term": "Item",
  "ordinario.ledger.column.annual": "Annual",
  "ordinario.ledger.revenue": "Fees or revenue",
  "ordinario.ledger.revenue.rule": "without VAT",
  "ordinario.ledger.revenue.explain":
    "What you collect for the business during the year, without VAT: fees received for a professional (art. 54 TUIR), revenue collected for a sole trader with simplified accounts (art. 66 TUIR).",
  "ordinario.ledger.costs": "Deductible costs",
  "ordinario.ledger.costs.explain":
    "What you pay for the business during the year, without the VAT you deduct. Some costs are only partly deductible: only the deductible part counts.",
  "ordinario.ledger.income": "Income",
  "ordinario.ledger.income.rule": "fees or revenue minus costs",
  "ordinario.ledger.income.explain":
    "Self-employment or business income. Contributions and the self-employment deduction are worked out on this income.",
  "ordinario.ledger.income.loss":
    "Costs are higher than revenue: the income is a loss, so there is no IRPEF and no surcharge.",
  "ordinario.ledger.contributions.gestione-separata": "Gestione Separata contributions",
  "ordinario.ledger.contributions.artigiani": "INPS Artigiani contributions",
  "ordinario.ledger.contributions.commercianti": "INPS Commercianti contributions",
  "ordinario.ledger.contributions.cassa-professionale": "Fund contributions",
  "ordinario.ledger.contributions.rate": "{rate} of income",
  "ordinario.ledger.contributions.capped": "{rate} of income up to the ceiling",
  "ordinario.ledger.contributions.separata":
    "INPS Gestione Separata takes {article, select, other {}}{rate} of income, up to the ceiling of {massimale}.",
  "ordinario.ledger.contributions.reduced":
    "This is the reduced rate for people who already have other pension cover.",
  "ordinario.ledger.contributions.minimum": "minimum contribution",
  "ordinario.ledger.contributions.overMinimum": "minimum plus {rate} above {minimale}",
  "ordinario.ledger.contributions.minimumExplain":
    "Artigiani and Commercianti pay a minimum contribution even when income is below the minimum income. {months, plural, =12 {For a full year the minimum income is {minimale} and the minimum contribution {fixed}.} one {With # month of activity the minimum income drops to {minimale} and the minimum contribution to {fixed}.} other {With # months of activity the minimum income drops to {minimale} and the minimum contribution to {fixed}.}}",
  "ordinario.ledger.contributions.overExplain":
    "Income above the minimum adds {article, select, other {}}{rate}, which becomes {higherArticle, select, other {}}{higherRate} above {band}, up to the ceiling of {massimale}.",
  "ordinario.ledger.contributions.typed": "amount entered",
  "ordinario.ledger.contributions.cassa":
    "The annual contribution you entered for your professional fund, deducted in full from income.",
  "ordinario.ledger.taxable": "Taxable income",
  "ordinario.ledger.taxable.rule": "income minus contributions",
  "ordinario.ledger.taxable.explain":
    "Compulsory pension contributions come off income (art. 10 TUIR): IRPEF and the surcharges are worked out on what is left.",
  "ordinario.ledger.taxable.zero":
    "No income is left to tax, so there is no IRPEF and no surcharge.",
  "ordinario.ledger.irpef": "Net IRPEF",
  "ordinario.ledger.irpef.rule": "{gross} of gross IRPEF minus {deduction} of deduction",
  "ordinario.ledger.irpef.ruleNoDeduction": "by bracket, no deduction",
  "ordinario.ledger.irpef.ruleZero": "no tax",
  "ordinario.ledger.irpef.explain":
    "IRPEF is worked out by bracket on taxable income. Then the deduction for self-employment and small businesses comes off (art. 13, paragraph 5, TUIR). It depends on income before contributions, {income}.",
  "ordinario.ledger.irpef.gross": "Gross IRPEF: {bands}",
  "ordinario.ledger.irpef.bandUpTo": "{rate} up to {max}",
  "ordinario.ledger.irpef.bandAbove": "{rate} above",
  "ordinario.ledger.irpef.deduction": "Self-employment deduction",
  "ordinario.ledger.irpef.lost":
    "The deduction due is {due}, more than the tax: the part left over is lost.",
  "ordinario.ledger.regional": "Regional surcharge",
  "ordinario.ledger.regional.explain":
    "Your region’s tax on taxable income, at the rates the region set for the year.",
  "ordinario.ledger.municipal": "Municipal surcharge",
  "ordinario.ledger.municipal.explain": "Your comune’s tax on taxable income.",
  "ordinario.ledger.municipal.none": "no comune chosen, {rate}",
  "ordinario.ledger.municipal.manual": "rate entered, {rate}",
  "ordinario.ledger.municipal.zero": "{name}, no surcharge",
  "ordinario.ledger.notDue": "{name}, not due",
  "ordinario.ledger.exempt": "{name}, exempt up to {amount}",
  "ordinario.ledger.surchargesNotDue":
    "Not due: the surcharges apply only when some IRPEF is left to pay after the deductions.",
  "ordinario.ledger.net": "Net per year",
  "ordinario.ledger.net.rule": "income minus contributions and taxes",
  "ordinario.ledger.net.explain":
    "What is left after costs, contributions and taxes. On average that is {monthly} a month over 12 months.",

  "ordinario.compare.title": "With the forfettario",
  "ordinario.compare.more":
    "With the forfettario your annual net would be {net}: {difference} more than under the ordinary regime.",
  "ordinario.compare.less":
    "With the forfettario your annual net would be {net}: {difference} less than under the ordinary regime.",
  "ordinario.compare.same": "With the forfettario your annual net would be the same: {net}.",
  "ordinario.compare.caption": "Ordinary regime and forfettario in {year}",
  "ordinario.compare.captionNote":
    "Annual amounts in euro, with the same revenue, the same costs and the same pension scheme.",
  "ordinario.compare.column.item": "Item",
  "ordinario.compare.column.ordinario": "Ordinary",
  "ordinario.compare.column.forfettario": "Forfettario",
  "ordinario.compare.column.difference": "Difference",
  "ordinario.compare.row.revenue": "Fees or revenue",
  "ordinario.compare.row.costs": "Costs",
  "ordinario.compare.row.contributions": "Contributions",
  "ordinario.compare.row.taxes": "Taxes",
  "ordinario.compare.row.net": "Net per year",
  "ordinario.compare.how":
    "Under the forfettario you pay a substitute tax of {rateArticle, select, other {}}{rate} on {coefficientArticle, select, other {}}{coefficient} of revenue, after contributions. Real costs are not deducted, but you still pay them: that is why the net subtracts them.",
  "ordinario.compare.discount":
    "It does not apply the {article, select, other {}}{discount} contribution reduction that Artigiani and Commercianti can ask for under the forfettario.",
  "ordinario.compare.cassa":
    "For a professional fund the comparison uses the contribution you entered for the ordinary regime.",
  "ordinario.compare.limits":
    "The comparison does not check the other forfettario requirements. For those, and for contribution reductions, use the {link}.",
  "ordinario.compare.link": "forfettario calculator",
  "ordinario.compare.overTitle": "Above the forfettario limit",
  "ordinario.compare.over":
    "With {revenue} of fees or revenue you are above the limit of {limit} a year: the forfettario does not apply.",

  "ordinario.topics.title": "Understanding the ordinary regime",
  "ordinario.topic.payments": "Balance and advance payments: when you pay",
  "ordinario.topic.payments.when":
    "The calculation shows a year’s taxes and contributions, not the dates you pay them. A year’s taxes are paid the following year, with the tax return: the balance by 30 June, together with the first advance for the current year, and the second advance by 30 November.",
  "ordinario.topic.payments.advance":
    "The IRPEF advance equals the previous year’s tax minus withholdings, and is not due if the amount is below €52. You pay 40% in June and the rest in November, or half and half if you apply the synthetic reliability indices (ISA). If you expect lower tax, you can base the advances on it.",
  "ordinario.topic.payments.withholding":
    "If you are a professional and invoice businesses or other professionals, the client withholds 20% of your fees as ritenuta d’acconto and pays it for you: it is IRPEF already paid, which comes off the balance and the advances.",
  "ordinario.topic.payments.firstYear":
    "In your first year of activity, if you had no IRPEF to pay the year before, you pay no advances. The following year, by 30 June, you pay the balance for the whole first year and the first advance for the second.",
  "ordinario.topic.payments.others":
    "The municipal surcharge has a 30% advance, the regional one is paid in full with the balance. Gestione Separata contributions follow the tax deadlines, with a balance and two advances. Artigiani and Commercianti pay the minimum contribution in four instalments, in May, August, November and February, and the part above the minimum with the taxes.",
  "ordinario.topic.deduction": "The self-employment deduction",
  "ordinario.topic.deduction.amounts":
    "A deduction comes off gross IRPEF, based on income before contributions: {base} up to {first}, then it falls to {fixed} at {second} and reaches zero at {last}. With income above {above} and up to {upTo} it goes up by {bonus} (art. 13, paragraphs 5 and 5-ter, TUIR).",
  "ordinario.topic.deduction.limits":
    "The deduction never becomes a refund: if it is larger than the tax, the excess is lost. It does not add to the deductions for employment or pension income.",
  "ordinario.topic.scope": "What the calculation leaves out",
  "ordinario.topic.scope.income":
    "The calculation holds if the VAT number is your only income. With a salary or a pension the incomes add up and IRPEF rises.",
  "ordinario.topic.scope.missing":
    "It leaves out losses from previous years, other deductible expenses and tax credits, the contribution reductions for Artigiani and Commercianti and the minimums of professional funds. Businesses are assumed to keep simplified accounts: with ordinary accounts the self-employment deduction does not apply.",
};
