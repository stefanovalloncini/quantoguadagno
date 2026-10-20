import type { MessageKey } from "./it.ts";

export const en: Record<MessageKey, string> = {
  "tredicesima.title": "What the 13th salary is worth net",
  "tredicesima.lede": "What is left of the extra month’s pay after INPS and IRPEF.",
  "tredicesima.form.ral": "Gross annual salary (RAL)",
  "tredicesima.form.ral.hint": "The RAL the extra month is computed from.",
  "tredicesima.form.mensilita": "Instalments",
  "tredicesima.form.mensilita.hint": "13 for the 13th only, 14 to include the 14th too.",
  "tredicesima.form.mensilita.option13": "13",
  "tredicesima.form.mensilita.option14": "14",
  "tredicesima.form.mensilita.error": "Choose 13 or 14 instalments.",
  "tredicesima.form.taxYear": "Tax year",
  "tredicesima.result.net": "Net 13th salary",
  "tredicesima.result.net.sub": "Effective take of {rate} between INPS and IRPEF",
  "tredicesima.result.netTotal": "With the 14th the total net is {amount}.",
  "tredicesima.result.empty": "Enter the RAL to see the 13th salary’s net amount.",
  "tredicesima.result.stale":
    "Not updated: this is still the result for {ral} gross. Fix the RAL to recalculate.",
  "tredicesima.result.announce": "Net 13th salary {amount}.",
  "tredicesima.result.estimate": "your payslip is what counts.",
  "tredicesima.result.verified": "Data checked on {date}",
  "tredicesima.result.trust":
    "{checked}{pending, select, yes {: {count, plural, one {one value used in this calculation is still to be verified} other {# values used in this calculation are still to be verified}}} other {}}.",
  "tredicesima.breakdown.gross": "Gross 13th",
  "tredicesima.breakdown.inps": "INPS contributions",
  "tredicesima.breakdown.irpef": "IRPEF",
  "tredicesima.breakdown.net": "Net 13th salary",
  "tredicesima.result.note":
    "On the extra month IRPEF is worked out on its own, with the year’s brackets divided by 12 and no tax credits, and no regional or municipal surcharge is withheld. The year-end tax adjustment then recalculates IRPEF on the whole year’s income.",
  "tredicesima.ledger.title": "Breakdown",
  "tredicesima.ledger.caption": "13th salary calculation, {year}",
  "tredicesima.ledger.column.term": "Item",
  "tredicesima.ledger.column.amount": "Amount",
  "tredicesima.ledger.gross.rule": "RAL divided by {mensilita} instalments",
  "tredicesima.ledger.gross.explain":
    "The extra month is worth the same as an ordinary month: the RAL divided by {mensilita}.",
  "tredicesima.ledger.inps.rule": "{rate} of gross",
  "tredicesima.ledger.inps.explain":
    "Your contributions are the same as on any other month, at the same rate.{exemption, select, yes { The 2024 contribution cut did not apply to the extra months.} other {}}",
  "tredicesima.ledger.taxable": "Taxable income",
  "tredicesima.ledger.taxable.rule": "gross minus contributions",
  "tredicesima.ledger.taxable.explain":
    "This is the amount IRPEF on the extra month is worked out on.",
  "tredicesima.ledger.irpef.rule": "brackets divided by 12, no tax credits",
  "tredicesima.ledger.irpef.explain":
    "IRPEF on the extra month is worked out on its own, with the year’s brackets divided by 12: {bands}. No tax credits come off: they apply to the ordinary months.",
  "tredicesima.ledger.irpef.bandUpTo": "{rate} up to {max}",
  "tredicesima.ledger.irpef.bandAbove": "{rate} above",
  "tredicesima.ledger.net.rule": "gross minus contributions and IRPEF",
  "tredicesima.assumption.year": "Tax year {year}",
  "tredicesima.assumption.mensilita":
    "{mensilita, select, 14 {13th and 14th month} other {13th month only}}",
  "tredicesima.change.year": "tax year",
  "tredicesima.change.mensilita": "instalments",
};
