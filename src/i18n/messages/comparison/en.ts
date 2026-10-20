import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "comparison.title": "Two offers compared",
  "comparison.lede":
    "Compare two job offers and see which one leaves you more net pay in a year and in each payslip.",

  "comparison.conditions.title": "Your circumstances",
  "comparison.conditions.hint": "They apply to both offers.",
  "comparison.group.residence": "Year and residence",
  "comparison.group.contract": "Contract and INPS",
  "comparison.group.dependents": "Dependants",
  "comparison.recap.residence": "{year}, {region}, {local}",
  "comparison.recap.comune": "{name} ({rate})",
  "comparison.recap.rate": "municipal surcharge {rate}",
  "comparison.recap.contract": "{contract}, contributions {rate}",
  "comparison.recap.none": "None",

  "comparison.year.legend": "Tax year",
  "comparison.region.label": "Region of residence",
  "comparison.contract.legend": "Contract type",
  "comparison.contract.hint":
    "Apprentices pay lower INPS contributions, {article, select, other {}}{rate}; fixed-term and permanent contracts give the same net pay.",
  "comparison.contract.option":
    "{type, select, determinato {Fixed-term} apprendistato {Apprenticeship} other {Permanent}}",
  "comparison.public.label": "Public sector employee",
  "comparison.public.hint":
    "Contributions are {article, select, other {}}{publicRate} instead of {baseArticle, select, other {}}{rate}.",
  "comparison.before1996.label": "Insured with INPS before 1996",
  "comparison.before1996.hint":
    "There is no contribution ceiling for you, so you pay contributions on all your gross pay, also above {massimale}.",
  "comparison.spouse.label": "Dependent spouse",
  "comparison.spouse.hint": "If in {year} your spouse earns up to {limit}.",
  "comparison.children.label":
    "{from2025, select, yes {Dependent children aged 21 to 29} other {Dependent children aged 21 or over}}",
  "comparison.children.hint":
    "{from2025, select, yes {Over 29 only with a disability; each} other {Each}} child may earn up to {young} until age 24, {limit} after.",
  "comparison.others.label": "Other dependent relatives",
  "comparison.others.hint":
    "{from2025, select, yes {Only parents or grandparents who live with you.} other {Parents, siblings and other relatives who live with you or receive maintenance from you.}}",

  "comparison.offer.title": "{offer, select, a {Offer A} other {Offer B}}",
  "comparison.offer.of": "{offer, select, a {of offer A} other {of offer B}}",
  "comparison.gross.label": "Gross annual salary (RAL)",
  "comparison.gross.unit": "{of}, in euros",
  "comparison.gross.readAs": "Read as {amount}",
  "comparison.gross.monthly": "{amount} gross a month over {count} payslips",
  "comparison.gross.monthlyNote":
    "Is this a monthly amount? The RAL is a year’s gross pay: {monthly} a month over {count} payslips is {annual}.",
  "comparison.frequency.legend": "Payslips a year",
  "comparison.offer.net": "Annual net pay",
  "comparison.offer.detail": "Monthly net pay {amount}, over {count} payslips",
  "comparison.offer.empty": "Enter the gross annual salary to see the net pay.",
  "comparison.offer.stale": "Out of date: correct the salary to recalculate.",
  "comparison.offer.staleShared": "Out of date: correct the marked values to recalculate.",

  "comparison.verdict.winner":
    "{winner, select, a {Offer A leaves you more} other {Offer B leaves you more}}",
  "comparison.verdict.tie": "Both offers leave you the same net pay",
  "comparison.verdict.pending": "Which offer leaves you more",
  "comparison.verdict.basis": "net a year",
  "comparison.verdict.basisTie": "net a year with either offer",
  "comparison.verdict.basisTieRounded": "net a year with either offer, rounded to the euro",
  "comparison.verdict.monthly": "On average {amount} more a month, over 12 months",
  "comparison.verdict.tieFrequencies":
    "Only the way you are paid changes: {countA} payslips with A, {countB} with B.",
  "comparison.verdict.empty": "Enter the gross annual salary of both offers to compare them.",
  "comparison.verdict.fix": "Correct the marked values to compare the offers.",
  "comparison.verdict.stale":
    "Out of date: this is the previous comparison. Correct the marked values to recalculate.",
  "comparison.verdict.payslipLower":
    "Each payslip from {winner} is smaller, {winnerAmount} against {otherAmount}, because {winner} spreads the salary over {winnerCount} payslips instead of {otherCount}: over a year, though, you receive more.",
  "comparison.verdict.payslipHigherFewer":
    "Each payslip from {winner} is also larger, {winnerAmount} against {otherAmount}: the gross pay is higher and {winner} spreads it over {winnerCount} payslips instead of {otherCount}.",
  "comparison.verdict.payslipHigher":
    "Each payslip from {winner} is also larger: {winnerAmount} against {otherAmount}.",
  "comparison.verdict.payslipSame":
    "Each payslip is {amount} with either offer, but {winner} pays {winnerCount} of them instead of {otherCount}.",
  "comparison.verdict.kept":
    "Of the extra {gross} gross with {winner} you keep {net} net, that is {article, select, other {}}{share}.",
  "comparison.verdict.keptLowerGross":
    "The gross pay of {winner} is not higher, but after deductions and credits you keep {net} more net a year.",
  "comparison.verdict.tiePayslip":
    "With {more} each payslip is smaller, {moreAmount} against {fewerAmount}, because {sameGross, select, yes {the same gross pay is spread} other {the gross pay is spread}} over {moreCount} payslips instead of {fewerCount}.",
  "comparison.verdict.tieSamePayslip":
    "The payslips are almost the same too: {amountA} with A, {amountB} with B.",
  "comparison.verdict.tieRule":
    "We treat two offers as equal when they differ by less than €1 a month.",
  "comparison.verdict.tieGap":
    "The difference is {amount} a year: we treat two offers as equal when they differ by less than €1 a month.",
  "comparison.announce.winner": "{verdict}: {amount} net a year, on average {monthly} a month.",
  "comparison.announce.tie": "{verdict}: {amount} net a year.",

  "comparison.part.contractType":
    "{type, select, determinato {fixed-term} apprendistato {apprenticeship} other {permanent}}",
  "comparison.part.sector": "{public, select, yes {public sector} other {private sector}}",
  "comparison.part.before1996": "insured with INPS before 1996",
  "comparison.part.spouse": "spouse",
  "comparison.part.children": "{count, plural, one {# child} other {# children}}",
  "comparison.part.others": "{count, plural, one {# other relative} other {# other relatives}}",

  "comparison.estimate":
    "your payslip is what counts. We compare gross pay and payslips a year, with no benefits for either offer.",
  "comparison.verified": "Data checked on {date}",
  "comparison.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",

  "comparison.table.caption": "The two offers line by line",
  "comparison.table.note": "In the last column, the sign shows how your net pay changes with B.",
  "comparison.table.item": "Item",
  "comparison.table.delta": "B compared with A",
  "comparison.row.gross": "Gross annual pay",
  "comparison.row.inps":
    "INPS contributions, {rate}{relief, select, yes {, less the exemption} other {}}",
  "comparison.row.irpef": "Net IRPEF, in bands less tax credits",
  "comparison.row.regional": "Regional surcharge, {region} {rate}",
  "comparison.row.municipal": "Municipal surcharge, {place}",
  "comparison.row.municipalPlace": "{name} {rate}",
  "comparison.row.credits": "Payroll credits",
  "comparison.row.netAnnual": "Annual net pay",
  "comparison.row.netMonthly": "Monthly net pay (A over {countA} payslips, B over {countB})",
  "comparison.row.netMonthlySame": "Monthly net pay, over {count} payslips",
  "comparison.row.average": "Average over 12 months",
};
